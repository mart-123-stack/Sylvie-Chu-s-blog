'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

type AnimationType = 'fade-in-up' | 'fade-in' | 'scale-in' | 'slide-in-right';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

const animations: Record<AnimationType, { visible: string; hidden: string }> = {
  'fade-in-up': {
    visible: 'translateY(0) scale(1)',
    hidden: 'translateY(30px) scale(1)',
  },
  'fade-in': {
    visible: 'translateY(0)',
    hidden: 'translateY(0)',
  },
  'scale-in': {
    visible: 'translateY(0) scale(1)',
    hidden: 'translateY(20px) scale(0.95)',
  },
  'slide-in-right': {
    visible: 'translateX(0)',
    hidden: 'translateX(30px)',
  },
};

export default function AnimatedSection({
  children,
  className = '',
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.08,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    // Small delay before observing to ensure layout is settled
    const timer = setTimeout(() => observer.observe(el), 100);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [threshold, once]);

  const { visible: visibleTransform, hidden: hiddenTransform } = animations[animation];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? visibleTransform : hiddenTransform,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
