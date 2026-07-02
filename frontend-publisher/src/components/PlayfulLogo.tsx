import React, { useState, useEffect, useRef } from 'react';

const IDLE_TIME = 15000; // 15 seconds
const ANIMATIONS = ['jump', 'shake', 'rotate', 'roll', 'fall', 'dvd'];

interface PlayfulLogoProps {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export default function PlayfulLogo({ width = 45, height = 45, style = {}, className = '' }: PlayfulLogoProps) {
  const [idle, setIdle] = useState(false);
  const [animState, setAnimState] = useState('');
  const [dvdPos, setDvdPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetIdle = () => {
      setIdle(false);
      setAnimState('');
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIdle(true);
        const randomAnim = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
        setAnimState(randomAnim);
        
        if (randomAnim === 'dvd' && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDvdPos({ x: rect.left, y: rect.top });
        }
      }, IDLE_TIME);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdle));
    
    resetIdle();
    
    return () => {
      clearTimeout(timeout);
      events.forEach(e => window.removeEventListener(e, resetIdle));
    };
  }, []);

  // DVD Bounce logic
  useEffect(() => {
    if (animState !== 'dvd') return;
    
    let x = dvdPos.x;
    let y = dvdPos.y;
    let dx = 2;
    let dy = 2;
    let animationFrame: number;
    const w = typeof width === 'number' ? width : parseInt(width as string, 10) || 45;
    const h = typeof height === 'number' ? height : parseInt(height as string, 10) || 45;
    
    const animate = () => {
      x += dx;
      y += dy;
      
      if (x + w >= window.innerWidth || x <= 0) dx = -dx;
      if (y + h >= window.innerHeight || y <= 0) dy = -dy;
      
      setDvdPos({ x, y });
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [animState, width, height]);

  const animClass = animState && animState !== 'dvd' ? `logo-anim-${animState}` : '';

  const svgElement = (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 1237.43 937.16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} ${animClass}`} 
      style={{ ...style, transition: 'all 0.3s ease' }}
    >
      <path d="M29,562.98v315.4c0,19.18,17.87,33.36,36.55,28.99l6.87-1.61c13.47-3.15,22.99-15.16,22.99-28.99v-286.68c0-11.99,7.2-22.82,18.26-27.45l158.02-66.28c19.62-8.23,41.29,6.18,41.29,27.45v274.01c0,20.07,19.45,34.39,38.61,28.43l9.16-2.85c12.45-3.87,20.93-15.39,20.93-28.43v-486.09c0-12.16,7.39-23.1,18.68-27.63l419.1-168.31c19.56-7.86,40.87,6.55,40.87,27.63v564.55c0,11.37,6.48,21.75,16.69,26.74h0c19.78,9.67,42.85-4.73,42.85-26.74v-242.89c0-20.9,20.97-35.3,40.48-27.78l167.18,64.43c11.49,4.43,19.07,15.47,19.07,27.78v317.94c0,23.41,25.78,37.66,45.61,25.21l2.29-1.44c8.67-5.45,13.94-14.97,13.94-25.21v-347.97c0-12.11-7.33-23.01-18.55-27.58l-249.17-101.4c-11.22-4.56-18.55-15.47-18.55-27.58V58.8c0-21.02-21.2-35.43-40.75-27.68L337.85,246.66c-10.94,4.34-18.3,14.72-18.77,26.48l-5.33,132.56c-.47,11.57-7.6,21.82-18.28,26.28l-248.15,103.53c-11.09,4.63-18.31,15.46-18.31,27.48Z" fill="currentColor" stroke="currentColor" strokeMiterlimit="10" strokeWidth="58" />
      <path d="M719.18,541.39l-93.07-42.81v-102.86c0-23.41-18.97-42.38-42.38-42.38h0c-23.41,0-42.38,18.97-42.38,42.38v129.59c0,.15,0,.3.01.45.02,16.02,9.16,31.35,24.67,38.48l117.73,54.15c21.26,9.78,46.43.47,56.21-20.79h0c9.78-21.26.47-46.43-20.79-56.21Z" fill="currentColor" />
      <ellipse cx="589.39" cy="524.36" rx="34.12" ry="24.59" transform="translate(-183.22 364.95) rotate(-30)" fill="#fff" />
    </svg>
  );

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative', display: 'inline-block' }}>
      {animState === 'dvd' ? (
        <div style={{ position: 'fixed', left: dvdPos.x, top: dvdPos.y, zIndex: 9999 }}>
          {svgElement}
        </div>
      ) : (
        svgElement
      )}
    </div>
  );
}
