'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setKey(k => k + 1);
  }, [pathname]);

  return (
    <div key={key} className={key > 0 ? 'animate-page-enter' : ''}>
      {children}
    </div>
  );
}
