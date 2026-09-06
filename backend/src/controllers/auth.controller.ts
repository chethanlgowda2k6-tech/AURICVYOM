import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { emailService } from '../services/email.service';

// In-memory or temporary store for reset tokens simulation
const passwordResetTokens = new Map<string, { email: string; expiresAt: number }>();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        passwordHash,
        preferences: {
          create: {
            travelStyle: 'Luxury & Curated',
            budgetRange: '₹25,000–₹50,000',
            preferredAccommodationType: 'Palace & Heritage',
            luxuryPreference: 5,
            heritagePreference: 4,
            naturePreference: 4,
            beachPreference: 3,
            wellnessPreference: 4
          }
        }
      },
      include: {
        preferences: true
      }
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to AuricVyom. Your journey begins here.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          preferredCurrency: user.preferredCurrency,
          preferences: user.preferences
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { preferences: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "We couldn't sign you in. Please check your email and password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "We couldn't sign you in. Please check your email and password." });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          preferredCurrency: user.preferredCurrency,
          preferences: user.preferences
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const tokens = generateTokens(decoded.userId);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        preferredCurrency: true,
        preferences: true,
        savedTrips: {
          include: {
            trip: {
              include: { days: { include: { activities: true } } }
            }
          }
        },
        bookings: {
          include: {
            items: true
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Always respond with a generic success to prevent email enumeration
    const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    passwordResetTokens.set(resetToken, {
      email: cleanEmail,
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    // Dispatch password reset email
    await emailService.sendPasswordReset(cleanEmail, resetToken);

    res.json({
      success: true,
      message: 'If an account exists with this email, recovery instructions have been sent.',
      data: {
        // Provided in development/demo mode for easy testing
        resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
      }
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to process password recovery' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const record = passwordResetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset link. Please request a new one.' });
    }

    const user = await prisma.user.findUnique({ where: { email: record.email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    passwordResetTokens.delete(token);

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new credentials.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

export const updatePreferences = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { travelStyle, budgetRange, preferredActivities, preferredAccommodationType } = req.body;

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        travelStyle,
        budgetRange,
        preferredActivities: Array.isArray(preferredActivities) ? preferredActivities : [],
        preferredAccommodationType
      },
      create: {
        userId,
        travelStyle,
        budgetRange,
        preferredActivities: Array.isArray(preferredActivities) ? preferredActivities : [],
        preferredAccommodationType
      }
    });

    res.json({
      success: true,
      message: 'Personalization preferences updated successfully',
      data: { preferences }
    });
  } catch (error) {
    console.error('updatePreferences error:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};

export const getPreferences = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const preferences = await prisma.userPreference.findUnique({
      where: { userId }
    });

    res.json({
      success: true,
      data: { preferences }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch preferences' });
  }
};
