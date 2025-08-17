import { useState, useEffect } from 'react';

const useTypewriter = (text, speed = 12) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const safeText = typeof text === 'string' ? text : (text ? String(text) : '');
    if (!safeText) {
      setDisplayText('');
      return;
    }
    setIsTyping(true);
    let currentIndex = 0;
    let cancelled = false;
    let buffer = '';
    let lastTime = performance.now();
    function typeNext(now) {
      if (cancelled) return;
      if (now - lastTime >= speed) {
        buffer += safeText[currentIndex] ?? '';
        setDisplayText(buffer);
        currentIndex++;
        lastTime = now;
      }
      if (currentIndex < safeText.length) {
        requestAnimationFrame(typeNext);
      } else {
        setIsTyping(false);
      }
    }
    setDisplayText('');
    requestAnimationFrame(typeNext);
    return () => { cancelled = true; };
  }, [text, speed]);
  return { displayText, isTyping };
};

export default useTypewriter;
