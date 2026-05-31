'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';

const MascotIllustration = dynamic(() => import('@/components/MascotIllustration'), { ssr: false });

const MOOD_MESSAGES: Record<string, string[]> = {
  idle: [
    '你好呀！(＾▽＾)',
    '来看新文章了吗？',
    '今天天气真好～',
    '咕噜咕噜～',
    '欢迎回来！',
    '我在这里～',
  ],
  happy: [
    '有新文章啦！🎉',
    '好开心！(★ω★)',
    '快去看新内容！',
    '今天是个好日子～',
    '好耶！(ﾉ◕ヮ◕)ﾉ',
  ],
  sleepy: [
    'Zzz... 好安静...',
    '什么时候有新文章呢...',
    '好想有人陪我玩...',
    '呼噜... 呼噜...',
    '(。-ω-)zzz',
  ],
  excited: [
    '哇！好多人！(ﾟ∀ﾟ)',
    '今天好热闹！',
    '大家好啊～！',
    '欢迎欢迎！ヽ(●´∀`●)ﾉ',
  ],
};

const ADOPT_MESSAGES = [
  '主人回来啦！(´▽`ʃ♡ƪ)',
  '主人！等你很久了～',
  '主人主人！这里这里！',
  '欢迎回家，主人！(๑´ㅂ`๑)',
];

const GREETINGS_POOL = [
  '你好呀！(＾▽＾)',
  '来玩吧！',
  '戳我干嘛～',
  '嘿嘿 (〃∀〃)',
  '好无聊啊～',
  '有什么有趣的事吗？',
];

export default function BlogPet() {
  const { user, token } = useAuth();
  const [mood, setMood] = useState('idle');
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [adopted, setAdopted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);

  // Load initial state
  useEffect(() => {
    fetchMood();
    setAdopted(localStorage.getItem('blog-pet-adopted') === 'true');
    const interval = setInterval(fetchMood, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-greeting every 2 minutes when not interacted
  useEffect(() => {
    if (showBubble) return;
    const interval = setInterval(() => {
      setMessage(GREETINGS_POOL[greetingIdx % GREETINGS_POOL.length]);
      setGreetingIdx(i => i + 1);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 3500);
    }, 120000);
    return () => clearInterval(interval);
  }, [showBubble, greetingIdx]);

  const fetchMood = useCallback(async () => {
    try {
      const res = await fetch('/api/mascot/state');
      const data = await res.json();
      if (data.mood) setMood(data.mood);
    } catch { /* ignore */ }
  }, []);

  const getRandomMessage = useCallback(() => {
    const list = MOOD_MESSAGES[mood] || MOOD_MESSAGES.idle;
    return list[Math.floor(Math.random() * list.length)];
  }, [mood]);

  const handleClick = useCallback(() => {
    setBouncing(true);
    const msg = adopted
      ? ADOPT_MESSAGES[Math.floor(Math.random() * ADOPT_MESSAGES.length)]
      : getRandomMessage();
    setMessage(msg);
    setShowBubble(true);
    setTimeout(() => {
      setShowBubble(false);
      setBouncing(false);
    }, 4000);
    setTimeout(() => setBouncing(false), 600);
  }, [adopted, getRandomMessage]);

  const toggleAdopt = useCallback(() => {
    const next = !adopted;
    setAdopted(next);
    localStorage.setItem('blog-pet-adopted', String(next));
    setShowMenu(false);
    setMessage(next ? '领养成功！以后就是你的小蓝啦！(ﾉ◕ヮ◕)ﾉ' : '呜... 好的吧 (｡•́︿•̀｡)');
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 4000);
  }, [adopted]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 select-none"
      onMouseEnter={() => !showBubble && setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Speech bubble */}
      {showBubble && (
        <div
          className="absolute bottom-full right-0 mb-3 max-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200"
          onClick={() => setShowBubble(false)}
        >
          <div className="bg-white dark:bg-slate-800 text-sky-800 dark:text-sky-200 text-sm px-4 py-2.5 rounded-2xl shadow-lg border border-sky-100 dark:border-slate-700 leading-relaxed">
            {message}
          </div>
          {/* Tail */}
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-sky-100 dark:border-slate-700 rotate-45" />
        </div>
      )}

      {/* Adopt badge */}
      {adopted && !showBubble && !showMenu && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] shadow-md z-10">
          💛
        </div>
      )}

      {/* Pet container */}
      <div className="relative">
        {/* Sleep Zzz indicator */}
        {mood === 'sleepy' && !showBubble && (
          <div className="absolute -top-4 -left-2 text-lg opacity-60 animate-bounce pointer-events-none">
            💤
          </div>
        )}

        <div
          className={`
            w-24 h-28 cursor-pointer transition-transform duration-150
            ${bouncing ? 'scale-110' : 'hover:scale-105'}
            ${mood === 'sleepy' ? 'opacity-70' : ''}
          `}
          onClick={handleClick}
        >
          <div className={`
            w-full h-full
            ${mood === 'happy' ? 'animate-float' : ''}
            ${mood === 'sleepy' ? 'animate-sleep' : ''}
            ${mood === 'excited' ? 'animate-wiggle' : ''}
          `}>
            <MascotIllustration className="w-full h-full" />
          </div>
        </div>

        {/* Hover menu */}
        {showMenu && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-sky-100 dark:border-slate-700 py-1 whitespace-nowrap">
            <button
              onClick={toggleAdopt}
              className="block w-full px-4 py-1.5 text-xs text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition text-left"
            >
              {adopted ? '💔 放生' : '💛 领养'}
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                handleClick();
              }}
              className="block w-full px-4 py-1.5 text-xs text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700 transition text-left"
            >
              💬 聊天
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
