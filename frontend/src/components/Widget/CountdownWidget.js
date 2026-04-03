/**
 * CountdownWidget – lightweight storefront countdown timer component.
 * In the real Shopify app, this would be rendered by the Theme App Extension.
 * This React version is provided for preview/testing purposes.
 */
import React, { useState, useEffect, useRef } from 'react';

/**
 * Calculates time remaining until `endTime`.
 * Returns { days, hours, minutes, seconds, total, expired }.
 */
function getTimeRemaining(endTime) {
  const total = new Date(endTime).getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true };
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
    expired: false,
  };
}

const pad = (n) => String(n).padStart(2, '0');

export default function CountdownWidget({ timer }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(timer.endTime));
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const r = getTimeRemaining(timer.endTime);
      setRemaining(r);
      if (r.expired) clearInterval(intervalRef.current);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timer.endTime]);

  const { customization: c } = timer;
  const isUrgent = c.showUrgencyEffect && remaining.total > 0 && remaining.total < 5 * 60 * 1000;

  // Container styles – designed for zero CLS by using fixed height
  const containerStyle = {
    background: c.backgroundColor,
    color: c.textColor,
    padding: '12px 20px',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    lineHeight: '1.4',
    minHeight: '50px',
    animation: isUrgent ? 'urgency-pulse 1s ease-in-out infinite' : 'none',
  };

  const digitStyle = {
    display: 'inline-block',
    background: c.accentColor,
    color: c.textColor,
    padding: '4px 8px',
    borderRadius: '4px',
    margin: '0 2px',
    fontWeight: 'bold',
    fontSize: '20px',
    minWidth: '36px',
    fontVariantNumeric: 'tabular-nums', // prevents layout shift on digit changes
  };

  if (remaining.expired) {
    return (
      <div style={containerStyle}>
        <span>{c.expiredText}</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes urgency-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div style={containerStyle} role="timer" aria-live="polite">
        <span style={{ marginRight: 12 }}>{c.headingText}</span>
        <span style={digitStyle}>{pad(remaining.days)}d</span>
        <span style={{ margin: '0 2px', fontWeight: 'bold' }}>:</span>
        <span style={digitStyle}>{pad(remaining.hours)}h</span>
        <span style={{ margin: '0 2px', fontWeight: 'bold' }}>:</span>
        <span style={digitStyle}>{pad(remaining.minutes)}m</span>
        <span style={{ margin: '0 2px', fontWeight: 'bold' }}>:</span>
        <span style={digitStyle}>{pad(remaining.seconds)}s</span>
      </div>
    </>
  );
}
