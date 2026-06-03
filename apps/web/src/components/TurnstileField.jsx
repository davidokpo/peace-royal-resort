import React, { useEffect, useRef } from 'react';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';

let turnstileScriptPromise = null;

const loadTurnstileScript = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.turnstile), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

const TurnstileField = ({
  onVerify,
  onError,
  resetSignal = 0,
  theme = 'light',
  className = '',
}) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current) {
      return undefined;
    }

    let active = true;

    loadTurnstileScript()
      .then((turnstile) => {
        if (!active || !turnstile || widgetIdRef.current !== null) {
          return;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          callback: (token) => onVerify?.(token || ''),
          'expired-callback': () => onVerify?.(''),
          'timeout-callback': () => onVerify?.(''),
          'error-callback': () => {
            onVerify?.('');
            onError?.('Captcha verification could not be loaded. Please try again.');
          },
        });
      })
      .catch(() => {
        onVerify?.('');
        onError?.('Captcha verification could not be loaded. Please try again.');
      });

    return () => {
      active = false;
      if (typeof window !== 'undefined' && window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onError, onVerify, theme]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || typeof window === 'undefined' || !window.turnstile || widgetIdRef.current === null) {
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
    onVerify?.('');
  }, [onVerify, resetSignal]);

  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return (
    <div className={className}>
      <div ref={containerRef} />
      <p className="mt-2 text-xs text-muted-foreground">
        This form is protected by Cloudflare Turnstile.
      </p>
    </div>
  );
};

export const isTurnstileEnabled = () => Boolean(TURNSTILE_SITE_KEY);

export default TurnstileField;
