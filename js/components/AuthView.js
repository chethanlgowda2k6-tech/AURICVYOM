// AURICVYOM Master Authentication Experience View & Component
import { appState } from "../state.js";
import { authService } from "../services/authService.js";

export function renderAuthView(initialMode = null) {
  const container = document.createElement("section");
  container.className = "auth-view-page";
  container.id = "auth-page-view";

  let mode = initialMode || appState.getState().authMode || "login"; // 'login', 'signup', 'forgot', 'reset', 'personalization'
  let showPassword = false;
  let showConfirmPassword = false;
  let forgotSubmitted = false;
  let resetToken = "";

  // Personalization form state
  const selectedStyles = new Set(["Luxury", "Heritage"]);
  let selectedBudget = "₹25K–₹50K";
  let selectedDuration = "Short holiday";

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "#f43f5e" };
    if (score === 2 || score === 3) return { score: 2, label: "Fair", color: "#f59e0b" };
    return { score: 3, label: "Strong", color: "#10b981" };
  };

  const renderDOM = () => {
    const { authLoading, authError, currentUser } = appState.getState();
    const currentPass = container.querySelector("#auth-pass-input")?.value || "";
    const strength = calculatePasswordStrength(currentPass);

    container.innerHTML = `
      <div class="auth-master-wrapper">
        <!-- LEFT PANEL: BRAND / TRAVEL VISUAL -->
        <div class="auth-visual-panel">
          <div class="auth-visual-bg" style="background-image: url('./images/destinations/jaipur-hawa-mahal.jpg');"></div>
          <div class="auth-visual-overlay"></div>
          
          <div class="auth-visual-content">
            <!-- Brand Mark -->
            <div class="auth-visual-brand">
              <div class="brand-logo-mark" style="width: 44px; height: 44px; font-size: 1.2rem;">
                <span>AV</span>
              </div>
              <div class="brand-title" style="font-size: 1.4rem;">Auric<span>Vyom</span></div>
            </div>

            <!-- Cinematic Travel Copy -->
            <div class="auth-visual-quote-wrap">
              <span class="auth-visual-tag">Bespoke Indian Journeys</span>
              <h1 class="auth-visual-headline">
                Travel India,<br/>
                <span class="gold-gradient-text">Beautifully Curated.</span>
              </h1>
              <p class="auth-visual-subtext">
                Discover extraordinary places, refined heritage stays, and journeys designed around your signature travel style across 28 states.
              </p>
            </div>

            <!-- Destination Badge Indicator -->
            <div class="auth-visual-badge">
              <span style="color: var(--gold-light);">📍 Hawa Mahal • Jaipur, Rajasthan</span>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: AUTHENTICATION CARD & FORMS -->
        <div class="auth-card-panel">
          <div class="auth-card-inner">
            <!-- Mobile Compact Brand Header -->
            <div class="auth-mobile-header">
              <div class="brand-logo-mark" style="width: 40px; height: 40px; font-size: 1.1rem; margin: 0 auto 8px;">
                <span>AV</span>
              </div>
              <div class="brand-title" style="font-size: 1.3rem; text-align: center;">Auric<span>Vyom</span></div>
            </div>

            <!-- Mode Header -->
            <div class="auth-header-block">
              ${mode === 'login' ? `
                <h2 class="auth-main-title">Welcome back</h2>
                <p class="auth-sub-title">Continue your journey with AuricVyom.</p>
              ` : mode === 'signup' ? `
                <h2 class="auth-main-title">Begin your journey</h2>
                <p class="auth-sub-title">Create your AuricVyom account and start discovering India differently.</p>
              ` : mode === 'forgot' ? `
                <h2 class="auth-main-title">Forgot your password?</h2>
                <p class="auth-sub-title">Enter your email and we'll send you instructions to reset your password.</p>
              ` : mode === 'reset' ? `
                <h2 class="auth-main-title">Reset your password</h2>
                <p class="auth-sub-title">Create a new secure password for your account.</p>
              ` : `
                <h2 class="auth-main-title">Tailor your experience</h2>
                <p class="auth-sub-title">Tell us how you like to travel to unlock bespoke recommendations.</p>
              `}
            </div>

            <!-- Inline Error Alert -->
            ${authError ? `
              <div class="auth-error-banner" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>${authError}</span>
              </div>
            ` : ''}

            <!-- 1. LOGIN FORM -->
            ${mode === 'login' ? `
              <form id="auth-login-form" class="auth-form-body" novalidate>
                <div class="auth-field-group">
                  <label for="login-email" class="auth-label">Email Address</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="email" 
                      id="login-email" 
                      name="email" 
                      class="auth-input" 
                      placeholder="Enter your email" 
                      autocomplete="email" 
                      required 
                      value="${container.querySelector("#login-email")?.value || ''}"
                    />
                  </div>
                  <span class="auth-field-error" id="login-email-error"></span>
                </div>

                <div class="auth-field-group">
                  <div class="auth-label-row">
                    <label for="login-password" class="auth-label">Password</label>
                    <button type="button" class="auth-inline-link" id="goto-forgot-btn">Forgot password?</button>
                  </div>
                  <div class="auth-input-wrapper">
                    <input 
                      type="${showPassword ? 'text' : 'password'}" 
                      id="login-password" 
                      name="password" 
                      class="auth-input" 
                      placeholder="Enter your password" 
                      autocomplete="current-password" 
                      required 
                      value="${container.querySelector("#login-password")?.value || ''}"
                    />
                    <button type="button" class="auth-pw-toggle" id="toggle-login-pw" aria-label="${showPassword ? 'Hide password' : 'Show password'}">
                      ${showPassword ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ` : `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      `}
                    </button>
                  </div>
                  <span class="auth-field-error" id="login-password-error"></span>
                </div>

                <button type="submit" class="btn-primary-gold auth-submit-btn" ${authLoading ? 'disabled' : ''}>
                  ${authLoading ? `
                    <span class="auth-spinner"></span>
                    <span>Signing in...</span>
                  ` : `
                    <span>Sign In</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  `}
                </button>

                <div class="auth-divider">
                  <span>OR</span>
                </div>

                <button type="button" class="btn-google-auth" id="google-auth-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div class="auth-switch-footer">
                  <span>Don't have an account?</span>
                  <button type="button" class="auth-switch-link" id="goto-signup-btn">Create one</button>
                </div>
              </form>
            ` : ''}

            <!-- 2. SIGN UP FORM -->
            ${mode === 'signup' ? `
              <form id="auth-signup-form" class="auth-form-body" novalidate>
                <div class="auth-field-group">
                  <label for="signup-name" class="auth-label">Full Name</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="text" 
                      id="signup-name" 
                      name="name" 
                      class="auth-input" 
                      placeholder="Enter your full name" 
                      autocomplete="name" 
                      required 
                      value="${container.querySelector("#signup-name")?.value || ''}"
                    />
                  </div>
                  <span class="auth-field-error" id="signup-name-error"></span>
                </div>

                <div class="auth-field-group">
                  <label for="signup-email" class="auth-label">Email Address</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="email" 
                      id="signup-email" 
                      name="email" 
                      class="auth-input" 
                      placeholder="Enter your email" 
                      autocomplete="email" 
                      required 
                      value="${container.querySelector("#signup-email")?.value || ''}"
                    />
                  </div>
                  <span class="auth-field-error" id="signup-email-error"></span>
                </div>

                <div class="auth-field-group">
                  <label for="signup-phone" class="auth-label">Phone Number (Optional)</label>
                  <div class="auth-input-wrapper auth-phone-group">
                    <span class="auth-phone-prefix">🇮🇳 +91</span>
                    <input 
                      type="tel" 
                      id="signup-phone" 
                      name="phone" 
                      class="auth-input auth-phone-input" 
                      placeholder="98765 43210" 
                      autocomplete="tel" 
                      value="${container.querySelector("#signup-phone")?.value || ''}"
                    />
                  </div>
                  <span class="auth-field-error" id="signup-phone-error"></span>
                </div>

                <div class="auth-field-group">
                  <label for="signup-password" class="auth-label">Password</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="${showPassword ? 'text' : 'password'}" 
                      id="signup-password" 
                      name="password" 
                      class="auth-input" 
                      placeholder="Create a password" 
                      autocomplete="new-password" 
                      required 
                      value="${container.querySelector("#signup-password")?.value || ''}"
                    />
                    <button type="button" class="auth-pw-toggle" id="toggle-signup-pw" aria-label="${showPassword ? 'Hide password' : 'Show password'}">
                      ${showPassword ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ` : `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      `}
                    </button>
                  </div>

                  <!-- Password Strength Meter -->
                  <div class="auth-strength-meter" id="auth-strength-container" style="display: ${container.querySelector("#signup-password")?.value ? 'block' : 'none'};">
                    <div class="auth-strength-bars">
                      <div class="auth-strength-bar ${strength.score >= 1 ? 'active' : ''}" style="--strength-color: ${strength.color};"></div>
                      <div class="auth-strength-bar ${strength.score >= 2 ? 'active' : ''}" style="--strength-color: ${strength.color};"></div>
                      <div class="auth-strength-bar ${strength.score >= 3 ? 'active' : ''}" style="--strength-color: ${strength.color};"></div>
                    </div>
                    <span class="auth-strength-label" style="color: ${strength.color};">${strength.label} password</span>
                  </div>

                  <!-- Requirements Checklist -->
                  <div class="auth-reqs-checklist">
                    <div class="auth-req-item" id="req-len">
                      <span class="req-icon">●</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div class="auth-req-item" id="req-upper">
                      <span class="req-icon">●</span>
                      <span>One uppercase letter</span>
                    </div>
                    <div class="auth-req-item" id="req-num">
                      <span class="req-icon">●</span>
                      <span>One number</span>
                    </div>
                  </div>
                  <span class="auth-field-error" id="signup-password-error"></span>
                </div>

                <div class="auth-field-group">
                  <label for="signup-confirm-password" class="auth-label">Confirm Password</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="${showConfirmPassword ? 'text' : 'password'}" 
                      id="signup-confirm-password" 
                      name="confirmPassword" 
                      class="auth-input" 
                      placeholder="Confirm your password" 
                      autocomplete="new-password" 
                      required 
                      value="${container.querySelector("#signup-confirm-password")?.value || ''}"
                    />
                    <button type="button" class="auth-pw-toggle" id="toggle-signup-cpw" aria-label="${showConfirmPassword ? 'Hide password' : 'Show password'}">
                      ${showConfirmPassword ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ` : `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      `}
                    </button>
                  </div>
                  <span class="auth-field-error" id="signup-confirm-error"></span>
                </div>

                <!-- Terms & Conditions Checkbox -->
                <div class="auth-checkbox-group">
                  <label class="auth-checkbox-label">
                    <input type="checkbox" id="signup-terms" required class="auth-checkbox" />
                    <span class="auth-custom-box"></span>
                    <span class="auth-terms-text">
                      I agree to the <a href="#terms" class="auth-link-gold" onclick="event.preventDefault(); appState.showToast('AuricVyom Luxury Terms: Privacy & Concierge Integrity');">Terms of Service</a> and <a href="#privacy" class="auth-link-gold" onclick="event.preventDefault(); appState.showToast('AuricVyom Privacy: End-to-end data encryption');">Privacy Policy</a>
                    </span>
                  </label>
                  <span class="auth-field-error" id="signup-terms-error"></span>
                </div>

                <button type="submit" class="btn-primary-gold auth-submit-btn" ${authLoading ? 'disabled' : ''}>
                  ${authLoading ? `
                    <span class="auth-spinner"></span>
                    <span>Creating account...</span>
                  ` : `
                    <span>Create Account</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  `}
                </button>

                <div class="auth-divider">
                  <span>OR</span>
                </div>

                <button type="button" class="btn-google-auth" id="google-auth-btn-signup">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div class="auth-switch-footer">
                  <span>Already have an account?</span>
                  <button type="button" class="auth-switch-link" id="goto-login-btn">Sign in</button>
                </div>
              </form>
            ` : ''}

            <!-- 3. FORGOT PASSWORD FORM -->
            ${mode === 'forgot' ? `
              ${forgotSubmitted ? `
                <div class="auth-success-box">
                  <div class="auth-success-icon">✉️</div>
                  <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--text-white); margin-bottom: 8px;">Check Your Inbox</h3>
                  <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
                    We have dispatched recovery instructions to your email address. Follow the link to choose a new password.
                  </p>
                  <button type="button" class="btn-primary-gold" id="goto-reset-demo-btn" style="width: 100%; justify-content: center; margin-bottom: 12px;">
                    Enter Reset Token (Demo Simulator)
                  </button>
                  <button type="button" class="auth-switch-link" id="goto-login-from-forgot" style="display: block; margin: 0 auto;">
                    ‹ Back to Sign In
                  </button>
                </div>
              ` : `
                <form id="auth-forgot-form" class="auth-form-body" novalidate>
                  <div class="auth-field-group">
                    <label for="forgot-email" class="auth-label">Email Address</label>
                    <div class="auth-input-wrapper">
                      <input 
                        type="email" 
                        id="forgot-email" 
                        name="email" 
                        class="auth-input" 
                        placeholder="Enter your email" 
                        autocomplete="email" 
                        required 
                      />
                    </div>
                    <span class="auth-field-error" id="forgot-email-error"></span>
                  </div>

                  <button type="submit" class="btn-primary-gold auth-submit-btn" ${authLoading ? 'disabled' : ''}>
                    ${authLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <div class="auth-switch-footer" style="justify-content: center;">
                    <button type="button" class="auth-switch-link" id="goto-login-from-forgot">‹ Back to Sign In</button>
                  </div>
                </form>
              `}
            ` : ''}

            <!-- 4. RESET PASSWORD FORM -->
            ${mode === 'reset' ? `
              <form id="auth-reset-form" class="auth-form-body" novalidate>
                <div class="auth-field-group">
                  <label for="reset-token" class="auth-label">Reset Token</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="text" 
                      id="reset-token" 
                      class="auth-input" 
                      placeholder="Paste recovery token" 
                      value="${resetToken}" 
                      required 
                    />
                  </div>
                  <span class="auth-field-error" id="reset-token-error"></span>
                </div>

                <div class="auth-field-group">
                  <label for="reset-new-password" class="auth-label">New Password</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="${showPassword ? 'text' : 'password'}" 
                      id="reset-new-password" 
                      class="auth-input" 
                      placeholder="Minimum 8 characters" 
                      autocomplete="new-password" 
                      required 
                    />
                  </div>
                  <span class="auth-field-error" id="reset-new-password-error"></span>
                </div>

                <div class="auth-field-group">
                  <label for="reset-confirm-password" class="auth-label">Confirm New Password</label>
                  <div class="auth-input-wrapper">
                    <input 
                      type="${showConfirmPassword ? 'text' : 'password'}" 
                      id="reset-confirm-password" 
                      class="auth-input" 
                      placeholder="Confirm new password" 
                      autocomplete="new-password" 
                      required 
                    />
                  </div>
                  <span class="auth-field-error" id="reset-confirm-error"></span>
                </div>

                <button type="submit" class="btn-primary-gold auth-submit-btn" ${authLoading ? 'disabled' : ''}>
                  ${authLoading ? 'Updating password...' : 'Reset Password'}
                </button>

                <div class="auth-switch-footer" style="justify-content: center;">
                  <button type="button" class="auth-switch-link" id="goto-login-from-reset">‹ Back to Sign In</button>
                </div>
              </form>
            ` : ''}

            <!-- 5. FIRST-TIME PERSONALIZATION FLOW -->
            ${mode === 'personalization' ? `
              <div class="auth-personalization-body">
                <div class="auth-pref-section">
                  <label class="auth-pref-label">Travel Style (Select all that inspire you)</label>
                  <div class="auth-chips-grid">
                    ${["Luxury", "Heritage", "Nature", "Adventure", "Beach", "Wellness", "Food", "Wildlife"].map(style => `
                      <button type="button" class="auth-pref-chip ${selectedStyles.has(style) ? 'selected' : ''}" data-style="${style}">
                        <span>${style === 'Luxury' ? '👑' : style === 'Heritage' ? '🏛️' : style === 'Nature' ? '🌿' : style === 'Adventure' ? '🧗' : style === 'Beach' ? '🏖️' : style === 'Wellness' ? '🧘' : style === 'Food' ? '🍛' : '🐅'}</span>
                        <span>${style}</span>
                      </button>
                    `).join("")}
                  </div>
                </div>

                <div class="auth-pref-section">
                  <label class="auth-pref-label">Target Budget Per Trip</label>
                  <div class="auth-chips-grid">
                    ${["Under ₹10K", "₹10K–₹25K", "₹25K–₹50K", "₹50K+"].map(b => `
                      <button type="button" class="auth-pref-chip ${selectedBudget === b ? 'selected' : ''}" data-budget="${b}">
                        ${b}
                      </button>
                    `).join("")}
                  </div>
                </div>

                <div class="auth-pref-section">
                  <label class="auth-pref-label">Preferred Trip Pace</label>
                  <div class="auth-chips-grid">
                    ${["Weekend escape", "Short holiday", "Long vacation", "Luxury getaway"].map(d => `
                      <button type="button" class="auth-pref-chip ${selectedDuration === d ? 'selected' : ''}" data-duration="${d}">
                        ${d}
                      </button>
                    `).join("")}
                  </div>
                </div>

                <div style="display: flex; gap: 14px; margin-top: 24px;">
                  <button type="button" class="btn-primary-gold" id="save-personalization-btn" style="flex: 2; justify-content: center; padding: 14px;">
                    ✨ Save Preferences
                  </button>
                  <button type="button" class="btn-outline-glass" id="skip-personalization-btn" style="flex: 1; justify-content: center; padding: 14px;">
                    Skip for now
                  </button>
                </div>
              </div>
            ` : ''}

          </div>
        </div>
      </div>
    `;

    bindFormEvents();
  };

  const bindFormEvents = () => {
    // Mode Switchers
    container.querySelector("#goto-signup-btn")?.addEventListener("click", () => {
      mode = "signup";
      appState.setState({ authError: null, authMode: "signup" });
      renderDOM();
    });

    container.querySelector("#goto-login-btn")?.addEventListener("click", () => {
      mode = "login";
      appState.setState({ authError: null, authMode: "login" });
      renderDOM();
    });

    container.querySelector("#goto-forgot-btn")?.addEventListener("click", () => {
      mode = "forgot";
      forgotSubmitted = false;
      appState.setState({ authError: null, authMode: "forgot" });
      renderDOM();
    });

    container.querySelector("#goto-login-from-forgot")?.addEventListener("click", () => {
      mode = "login";
      appState.setState({ authError: null, authMode: "login" });
      renderDOM();
    });

    container.querySelector("#goto-login-from-reset")?.addEventListener("click", () => {
      mode = "login";
      appState.setState({ authError: null, authMode: "login" });
      renderDOM();
    });

    container.querySelector("#goto-reset-demo-btn")?.addEventListener("click", () => {
      mode = "reset";
      resetToken = "demo_token_" + Date.now();
      renderDOM();
    });

    // Password Visibility Toggles
    container.querySelector("#toggle-login-pw")?.addEventListener("click", () => {
      showPassword = !showPassword;
      const input = container.querySelector("#login-password");
      if (input) input.type = showPassword ? "text" : "password";
      renderDOM();
    });

    container.querySelector("#toggle-signup-pw")?.addEventListener("click", () => {
      showPassword = !showPassword;
      const input = container.querySelector("#signup-password");
      if (input) input.type = showPassword ? "text" : "password";
      renderDOM();
    });

    container.querySelector("#toggle-signup-cpw")?.addEventListener("click", () => {
      showConfirmPassword = !showConfirmPassword;
      const input = container.querySelector("#signup-confirm-password");
      if (input) input.type = showConfirmPassword ? "text" : "password";
      renderDOM();
    });

    // Live Signup Password Strength & Checklist Listeners
    const signupPassInput = container.querySelector("#signup-password");
    if (signupPassInput) {
      signupPassInput.addEventListener("input", (e) => {
        const val = e.target.value;
        const meter = container.querySelector("#auth-strength-container");
        if (meter) meter.style.display = val ? "block" : "none";

        const reqLen = container.querySelector("#req-len");
        const reqUpper = container.querySelector("#req-upper");
        const reqNum = container.querySelector("#req-num");

        if (reqLen) reqLen.classList.toggle("valid", val.length >= 8);
        if (reqUpper) reqUpper.classList.toggle("valid", /[A-Z]/.test(val));
        if (reqNum) reqNum.classList.toggle("valid", /[0-9]/.test(val));
      });
    }

    // Google Auth Button
    const handleGoogleAuth = async () => {
      const res = await authService.continueWithGoogle();
      if (res && !res.configured) {
        appState.showToast(`✨ ${res.message}`);
        // Simulate google sign-in for seamless developer testing
        setTimeout(() => {
          appState.login(res.demoUser.email, "GoogleOAuth123");
        }, 1200);
      }
    };

    container.querySelector("#google-auth-btn")?.addEventListener("click", handleGoogleAuth);
    container.querySelector("#google-auth-btn-signup")?.addEventListener("click", handleGoogleAuth);

    // 1. Submit Login
    const loginForm = container.querySelector("#auth-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = container.querySelector("#login-email");
        const passInput = container.querySelector("#login-password");
        const emailErr = container.querySelector("#login-email-error");
        const passErr = container.querySelector("#login-password-error");

        let isValid = true;
        emailErr.textContent = "";
        passErr.textContent = "";

        const emailVal = emailInput.value.trim();
        const passVal = passInput.value;

        if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          emailErr.textContent = "Please enter a valid email address.";
          emailInput.focus();
          isValid = false;
        } else if (!passVal) {
          passErr.textContent = "Please enter your password.";
          passInput.focus();
          isValid = false;
        }

        if (!isValid) return;

        const res = await appState.login(emailVal, passVal);
        if (!res.success) {
          renderDOM();
        }
      });
    }

    // 2. Submit Signup
    const signupForm = container.querySelector("#auth-signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nameInput = container.querySelector("#signup-name");
        const emailInput = container.querySelector("#signup-email");
        const phoneInput = container.querySelector("#signup-phone");
        const passInput = container.querySelector("#signup-password");
        const cpassInput = container.querySelector("#signup-confirm-password");
        const termsInput = container.querySelector("#signup-terms");

        const nameErr = container.querySelector("#signup-name-error");
        const emailErr = container.querySelector("#signup-email-error");
        const phoneErr = container.querySelector("#signup-phone-error");
        const passErr = container.querySelector("#signup-password-error");
        const cpassErr = container.querySelector("#signup-confirm-error");
        const termsErr = container.querySelector("#signup-terms-error");

        nameErr.textContent = "";
        emailErr.textContent = "";
        phoneErr.textContent = "";
        passErr.textContent = "";
        cpassErr.textContent = "";
        termsErr.textContent = "";

        let isValid = true;
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const phoneVal = phoneInput.value.trim();
        const passVal = passInput.value;
        const cpassVal = cpassInput.value;

        if (!nameVal || nameVal.length < 2) {
          nameErr.textContent = "Please enter your full name.";
          isValid = false;
        }

        if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          emailErr.textContent = "Please enter a valid email address.";
          isValid = false;
        }

        if (phoneVal && !/^[0-9\s-]{10,14}$/.test(phoneVal.replace(/\+91/g, ''))) {
          phoneErr.textContent = "Please enter a valid 10-digit Indian phone number.";
          isValid = false;
        }

        if (!passVal || passVal.length < 8) {
          passErr.textContent = "Password must contain at least 8 characters.";
          isValid = false;
        } else if (!/[A-Z]/.test(passVal) || !/[0-9]/.test(passVal)) {
          passErr.textContent = "Password must include at least one uppercase letter and one number.";
          isValid = false;
        }

        if (cpassVal !== passVal) {
          cpassErr.textContent = "Passwords do not match.";
          isValid = false;
        }

        if (!termsInput.checked) {
          termsErr.textContent = "You must agree to the Terms and Privacy Policy to proceed.";
          isValid = false;
        }

        if (!isValid) return;

        const formattedPhone = phoneVal ? (phoneVal.startsWith("+91") ? phoneVal : `+91 ${phoneVal}`) : null;
        const res = await appState.signup(nameVal, emailVal, passVal, formattedPhone);
        if (res.success) {
          mode = "personalization";
          renderDOM();
        } else {
          renderDOM();
        }
      });
    }

    // 3. Submit Forgot Password
    const forgotForm = container.querySelector("#auth-forgot-form");
    if (forgotForm) {
      forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = container.querySelector("#forgot-email");
        const emailErr = container.querySelector("#forgot-email-error");
        emailErr.textContent = "";

        const emailVal = emailInput.value.trim();
        if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          emailErr.textContent = "Please enter a valid email address.";
          return;
        }

        appState.setState({ authLoading: true });
        const res = await authService.forgotPassword(emailVal);
        appState.setState({ authLoading: false });
        forgotSubmitted = true;
        if (res?.data?.resetToken) {
          resetToken = res.data.resetToken;
        }
        renderDOM();
      });
    }

    // 4. Submit Reset Password
    const resetForm = container.querySelector("#auth-reset-form");
    if (resetForm) {
      resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const tokenInput = container.querySelector("#reset-token");
        const passInput = container.querySelector("#reset-new-password");
        const cpassInput = container.querySelector("#reset-confirm-password");

        const tokenErr = container.querySelector("#reset-token-error");
        const passErr = container.querySelector("#reset-new-password-error");
        const cpassErr = container.querySelector("#reset-confirm-error");

        tokenErr.textContent = "";
        passErr.textContent = "";
        cpassErr.textContent = "";

        let isValid = true;
        const tokenVal = tokenInput.value.trim();
        const passVal = passInput.value;
        const cpassVal = cpassInput.value;

        if (!tokenVal) {
          tokenErr.textContent = "Reset token is required.";
          isValid = false;
        }

        if (!passVal || passVal.length < 8) {
          passErr.textContent = "Password must contain at least 8 characters.";
          isValid = false;
        }

        if (cpassVal !== passVal) {
          cpassErr.textContent = "Passwords do not match.";
          isValid = false;
        }

        if (!isValid) return;

        try {
          appState.setState({ authLoading: true });
          const res = await authService.resetPassword({ token: tokenVal, newPassword: passVal });
          appState.setState({ authLoading: false });
          appState.showToast("✓ Password reset successfully! Please sign in.");
          mode = "login";
          renderDOM();
        } catch (err) {
          appState.setState({ authLoading: false, authError: err.message });
          renderDOM();
        }
      });
    }

    // 5. Personalization Interaction Handlers
    container.querySelectorAll("[data-style]").forEach(chip => {
      chip.addEventListener("click", () => {
        const style = chip.dataset.style;
        if (selectedStyles.has(style)) selectedStyles.delete(style);
        else selectedStyles.add(style);
        chip.classList.toggle("selected", selectedStyles.has(style));
      });
    });

    container.querySelectorAll("[data-budget]").forEach(chip => {
      chip.addEventListener("click", () => {
        selectedBudget = chip.dataset.budget;
        container.querySelectorAll("[data-budget]").forEach(c => c.classList.toggle("selected", c.dataset.budget === selectedBudget));
      });
    });

    container.querySelectorAll("[data-duration]").forEach(chip => {
      chip.addEventListener("click", () => {
        selectedDuration = chip.dataset.duration;
        container.querySelectorAll("[data-duration]").forEach(c => c.classList.toggle("selected", c.dataset.duration === selectedDuration));
      });
    });

    container.querySelector("#save-personalization-btn")?.addEventListener("click", () => {
      appState.updatePreferences({
        travelStyle: Array.from(selectedStyles).join(" & ") || "Luxury",
        budgetRange: selectedBudget,
        preferredActivities: Array.from(selectedStyles),
        preferredTripDuration: selectedDuration === "Weekend escape" ? 3 : 7
      });
      const resumeAction = appState.getState().intendedAction;
      if (typeof resumeAction === "function") {
        setTimeout(() => resumeAction(), 300);
      }
    });

    container.querySelector("#skip-personalization-btn")?.addEventListener("click", () => {
      const resumeAction = appState.getState().intendedAction;
      const resumeRoute = appState.getState().intendedRoute || "home";
      appState.setState({
        activeModal: null,
        activeTab: resumeRoute,
        intendedAction: null,
        intendedRoute: null
      });
      appState.showToast("✨ Welcome to your AuricVyom sanctuary.");
      if (typeof resumeAction === "function") {
        setTimeout(() => resumeAction(), 300);
      }
    });
  };

  appState.subscribe((state) => {
    if (state.activeTab === "login" || state.activeTab === "signup" || state.activeModal === "authModal") {
      if (state.authMode && state.authMode !== mode) {
        mode = state.authMode;
        renderDOM();
      }
    }
  });

  renderDOM();
  return container;
}
