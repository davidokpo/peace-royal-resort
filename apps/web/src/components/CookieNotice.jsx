import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COOKIE_NOTICE_KEY = 'peace-royal-cookie-notice-accepted';

const CookieNotice = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem(COOKIE_NOTICE_KEY);
    setIsVisible(!accepted);
  }, []);

  const handleAccept = () => {
    window.localStorage.setItem(COOKIE_NOTICE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-xl rounded-[1.75rem] border border-border/50 bg-background/95 p-5 shadow-[0_20px_50px_rgba(25,25,25,0.14)] backdrop-blur-xl lg:bottom-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
        Privacy Notice
      </p>
      <p className="mt-3 text-sm leading-6 text-foreground/85">
        We use essential cookies and browser storage to support bookings, payment flow, and basic site preferences. Read the{' '}
        <Link to="/privacy" className="font-medium text-primary underline underline-offset-4">
          full privacy notice
        </Link>.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={handleAccept}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Accept
        </Button>
        <Button asChild type="button" variant="outline" className="w-full sm:w-auto">
          <Link to="/terms">View terms</Link>
        </Button>
      </div>
    </div>
  );
};

export default CookieNotice;
