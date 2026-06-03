const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const getRemoteIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '';
};

export const isTurnstileVerificationEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

export const verifyTurnstileToken = async ({ token, req }) => {
  if (!isTurnstileVerificationEnabled()) {
    return { success: true, skipped: true };
  }

  if (!token) {
    return { success: false, error: 'Captcha token is required' };
  }

  try {
    const params = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: getRemoteIp(req),
    });

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: 'Captcha verification failed',
        details: result['error-codes'] || [],
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Captcha verification failed',
      details: [error.message],
    };
  }
};
