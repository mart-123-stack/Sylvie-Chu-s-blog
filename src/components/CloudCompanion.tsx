'use client';

import { useState, useEffect, useCallback } from 'react';

const WEATHER_MESSAGES: Record<string, string[]> = {
  sunny: [
    "What a bright day! ☀️",
    "Hope you're having a great day!",
    "Feeling sunny and cheerful!",
    "Perfect weather for a good read!",
    "The sun is shining! ✨",
  ],
  cloudy: [
    'Hello there!',
    'Enjoying the blog?',
    'Drifting by...',
    'Lovely weather up here!',
    'Welcome back!',
    'Just floating around...',
  ],
  rainy: [
    'Cozy weather for reading...',
    'Perfect day to stay inside with a book.',
    'Listening to the rain fall...',
    'Quiet and peaceful today.',
    'A nice day to curl up and read.',
  ],
  rainbow: [
    'Something wonderful is in the air! ✨',
    'The blog is full of life today!',
    'So much happening! How exciting!',
    'What a colorful, wonderful day!',
    'Today feels magical! ✨',
  ],
};

const GREETINGS = [
  'Hi there!',
  'Hello!',
  'Nice to see you!',
  'Thanks for stopping by!',
  'Enjoy your stay!',
  'Hey!',
  'Welcome!',
];

export default function CloudCompanion() {
  const [weather, setWeather] = useState('cloudy');
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showBubble) return;
    const interval = setInterval(() => {
      setMessage(GREETINGS[greetingIdx % GREETINGS.length]);
      setGreetingIdx(i => i + 1);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 4000);
    }, 120000);
    return () => clearInterval(interval);
  }, [showBubble, greetingIdx]);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch('/api/mascot/state');
      const data = await res.json();
      if (data.mood) {
        const map: Record<string, string> = {
          idle: 'cloudy',
          happy: 'sunny',
          sleepy: 'rainy',
          excited: 'rainbow',
        };
        setWeather(map[data.mood] || 'cloudy');
      }
    } catch { /* offline fallback */ }
  }, []);

  const getRandomMessage = useCallback(() => {
    const list = WEATHER_MESSAGES[weather] || WEATHER_MESSAGES.cloudy;
    return list[Math.floor(Math.random() * list.length)];
  }, [weather]);

  const handleClick = useCallback(() => {
    setBouncing(true);
    setMessage(getRandomMessage());
    setShowBubble(true);
    setTimeout(() => { setShowBubble(false); setBouncing(false); }, 4000);
    setTimeout(() => setBouncing(false), 600);
  }, [getRandomMessage]);

  const weatherIcon = weather === 'sunny' ? '☀️' : weather === 'rainy' ? '🌧️' : weather === 'rainbow' ? '🌈' : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {showBubble && (
        <div
          className="absolute bottom-full right-0 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
          onClick={() => setShowBubble(false)}
        >
          <div className="bg-white dark:bg-slate-800 text-sky-800 dark:text-sky-200 text-sm px-4 py-2.5 rounded-2xl shadow-lg border border-sky-100 dark:border-slate-700 leading-relaxed max-w-[220px]">
            {message}
          </div>
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-sky-100 dark:border-slate-700 rotate-45" />
        </div>
      )}

      <div
        className={`relative cursor-pointer transition-transform duration-150 ${
          bouncing ? 'scale-110' : 'hover:scale-105'
        }`}
        onClick={handleClick}
      >
        {weatherIcon && (
          <div className="absolute -top-1 right-0 text-base z-10 floating-weather-icon">
            {weatherIcon}
          </div>
        )}

        <svg viewBox="0 0 140 100" width="100" height="72" className="drop-shadow-lg">
          <defs>
            <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0f9ff" />
            </linearGradient>
            <linearGradient id="cloudGradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
            </linearGradient>
            <filter id="cloudShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(56,189,248,0.15)" />
            </filter>
          </defs>

          <g className={`cloud-svg-group weather-${weather}`}>
            {/* Shadow */}
            <ellipse cx="70" cy="92" rx="44" ry="5" fill="rgba(56,189,248,0.08)" />

            {/* Cloud shape */}
            <g fill="url(#cloudGrad)" filter="url(#cloudShadow)">
              <ellipse cx="70" cy="68" rx="54" ry="26" />
              <circle cx="38" cy="50" r="24" />
              <circle cx="70" cy="36" r="28" />
              <circle cx="100" cy="46" r="22" />
              <circle cx="54" cy="42" r="20" />
              <circle cx="86" cy="40" r="20" />
            </g>

            {/* Eyes */}
            <ellipse cx="52" cy="64" rx="5.5" ry="6.5" fill="#475569" />
            <ellipse cx="88" cy="64" rx="5.5" ry="6.5" fill="#475569" />

            {/* Eye highlights */}
            <circle cx="50" cy="61" r="2.5" fill="white" />
            <circle cx="86" cy="61" r="2.5" fill="white" />
            <circle cx="54" cy="66" r="1.2" fill="white" opacity="0.5" />
            <circle cx="90" cy="66" r="1.2" fill="white" opacity="0.5" />

            {/* Blush */}
            <ellipse cx="34" cy="73" rx="9" ry="4.5" fill="#FFB5B5" opacity="0.45" />
            <ellipse cx="106" cy="73" rx="9" ry="4.5" fill="#FFB5B5" opacity="0.45" />

            {/* Mouth */}
            <path d="M65,71 Q70,76 75,71" stroke="#64748b" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* Sparkles */}
          <g>
            <circle cx="16" cy="38" r="2" fill="#FBBF24" opacity="0.5" className="sparkle s1" />
            <circle cx="124" cy="32" r="2.5" fill="#FBBF24" opacity="0.4" className="sparkle s2" />
            <circle cx="10" cy="72" r="1.5" fill="#7DD3FC" opacity="0.5" className="sparkle s3" />
            <circle cx="130" cy="70" r="1.8" fill="#7DD3FC" opacity="0.4" className="sparkle s4" />
            <circle cx="28" cy="22" r="1.5" fill="#FBBF24" opacity="0.3" className="sparkle s1" />
            <circle cx="112" cy="18" r="1.8" fill="#7DD3FC" opacity="0.35" className="sparkle s2" />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .cloud-svg-group.weather-sunny {
          animation: cloud-float 3s ease-in-out infinite;
        }
        .cloud-svg-group.weather-rainy {
          animation: cloud-bob 4s ease-in-out infinite;
        }
        .cloud-svg-group.weather-rainbow {
          animation: cloud-float 2.5s ease-in-out infinite;
        }
        .floating-weather-icon {
          animation: cloud-float 3s ease-in-out infinite;
        }

        :global(.sparkle) {
          animation: twinkle 3s ease-in-out infinite;
        }
        :global(.s1) { animation-delay: 0s; }
        :global(.s2) { animation-delay: 0.8s; }
        :global(.s3) { animation-delay: 1.6s; }
        :global(.s4) { animation-delay: 2.4s; }

        @keyframes cloud-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes cloud-bob {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-3px); }
          75% { transform: translateY(2px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
