import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface RippleButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  rippleColor?: string;
  contentClassName?: string;
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, className = '', onClick, rippleColor, contentClassName, whileTap, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.2;
      const id = Date.now() + Math.random();

      setRipples((prev) => [...prev.slice(-3), { id, x, y, size }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <motion.button
        ref={ref}
        whileTap={whileTap !== undefined ? whileTap : { scale: 0.955 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        {...props}
        onClick={handleClick}
        className={`relative overflow-hidden ${className}`}
      >
        {/* Child Content */}
        <div className={`relative z-10 w-full h-full pointer-events-none ${contentClassName ?? 'flex items-center justify-between'}`}>
          {children}
        </div>

        {/* Animated Ripples */}
        {ripples.map((ripple, rIdx) => (
          <motion.span
            key={`btn-ripple-${ripple.id}-${rIdx}`}
            initial={{ scale: 0, opacity: 0.45 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              pointerEvents: 'none',
              backgroundColor: rippleColor || 'rgba(255, 255, 255, 0.35)',
              zIndex: 5,
            }}
          />
        ))}
      </motion.button>
    );
  }
);

RippleButton.displayName = 'RippleButton';
