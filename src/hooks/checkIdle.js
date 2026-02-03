import { useEffect, useRef, useState } from "react";

export default function useIdle(timeout = 30 * 60 * 1000) { 
  const [isIdle, setIsIdle] = useState(false);
  const timer = useRef(null);

  const resetTimer = () => {
    setIsIdle(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIsIdle(true);
    }, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "wheel", "scroll", "click"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); 

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [timeout]);

  return isIdle;
}
