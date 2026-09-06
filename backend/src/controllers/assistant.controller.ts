import { Request, Response } from 'express';
import { geminiAssistantService } from '../services/geminiAssistant.service';
import { verifyAccessToken } from '../utils/jwt';

export const askAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({
        success: false,
        message: 'Question string is required.',
      });
      return;
    }

    // Extract optional authenticated user from Authorization header
    let authenticatedUserId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyAccessToken(token);
        if (decoded?.userId) {
          authenticatedUserId = decoded.userId;
        }
      } catch (err) {
        // Token invalid or expired: treat as unauthenticated guest rather than blocking general questions
        authenticatedUserId = null;
      }
    }

    const response = await geminiAssistantService.ask(question.trim(), authenticatedUserId);

    res.status(200).json({
      success: true,
      data: {
        question: question.trim(),
        answer: response.answer,
        sources: response.sources,
        toolsUsed: response.toolsUsed,
        grounded: response.grounded,
      },
    });
  } catch (error) {
    console.error('Error in askAssistant controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process question via Gemini Assistant.',
    });
  }
};
