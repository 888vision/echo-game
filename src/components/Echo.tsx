import { useRef, useEffect, useCallback, useState } from 'react';
import { loadRoom, update, drawRoom, handleTap } from '../scenes/echo/engine';
import type { EchoState, SoundColor } from '../scenes/echo/types';
import { theme } from '../styles/theme';

export default function Echo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<EchoState | null>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showText, setShowText] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [displayedTextZh, setDisplayedTextZh] = useState('');
  const [showGame, setShowGame] = useState(false);

  // Opening narration lines
  const introLines = [
    { en: 'You can no longer hear this world.', zh: '你听不见这个世界了。' },
    { en: '', zh: '' },
    { en: 'But perhaps it can hear you.', zh: '但也许，它能听见你。' },
  ];

  // Typing animation for intro
  useEffect(() => {
    if (!showIntro) return;
    let charIdx = 0;
    const currentLine = introLines[0].en;
    const interval = setInterval(() => {
      charIdx++;
      setDisplayedText(currentLine.slice(0, charIdx));
      if (charIdx >= currentLine.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowIntro(false);
          setShowText(true);
          setTimeout(() => {
            setShowText(false);
            setShowGame(true);
          }, 2000);
        }, 1500);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [showIntro]);

  // Second line (Chinese)
  useEffect(() => {
    if (!showText) return;
    let charIdx = 0;
    const currentLine = introLines[0].zh;
    const interval = setInterval(() => {
      charIdx++;
      setDisplayedTextZh(currentLine.slice(0, charIdx));
      if (charIdx >= currentLine.length) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [showText]);

  // Game loop
  useEffect(() => {
    if (!showGame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize state
    stateRef.current = loadRoom(1);

    // Resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Click/tap handler
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (!stateRef.current) return;
      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0]?.clientX ?? 0;
        clientY = e.touches[0]?.clientY ?? 0;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      handleTap(stateRef.current, clientX, clientY, 'gold');
    };

    // Long press for stronger waves
    let pressStart = 0;
    const handlePressStart = () => { pressStart = Date.now(); };
    const handlePressEnd = () => {
      const duration = Math.min(1, (Date.now() - pressStart) / 3000);
      if (!stateRef.current) return;
      // The duration is used by the next tap
      stateRef.current.lastTap = duration;
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handlePressStart);
    canvas.addEventListener('mouseup', handlePressEnd);
    canvas.addEventListener('touchstart', handlePressStart, { passive: true });
    canvas.addEventListener('touchend', handlePressEnd);

    // Animation loop
    const loop = (timestamp: number) => {
      animRef.current = requestAnimationFrame(loop);
      if (!stateRef.current || !ctx) return;

      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const w = canvas.width;
      const h = canvas.height;

      // Update
      update(stateRef.current, dt);

      // Draw
      ctx.clearRect(0, 0, w, h);
      drawRoom(ctx, stateRef.current, w, h);

      // Draw chapter indicator (very subtle)
      if (stateRef.current.room) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#f5f0e8';
        ctx.font = '11px Cormorant Garamond, Georgia, serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Chapter ${stateRef.current.chapter} — ${stateRef.current.room.name}`, w - 20, h - 15);
        ctx.globalAlpha = 1;
      }

      // Draw resonance indicator
      if (stateRef.current.resonance > 0) {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#f5f0e8';
        ctx.font = '11px Cormorant Garamond, Georgia, serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Resonance: ${Math.round(stateRef.current.resonance)}%`, 20, h - 15);
        ctx.globalAlpha = 1;
      }

      // Draw completion screen
      if (stateRef.current.completed) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#e8a87c';
        ctx.font = 'bold 36px Cormorant Garamond, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#e8a87c';
        ctx.shadowBlur = 20;
        ctx.fillText('You are home.', w / 2, h / 2 - 30);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(245, 240, 232, 0.5)';
        ctx.font = '18px Cormorant Garamond, Georgia, serif';
        ctx.fillText('你回家了。', w / 2, h / 2 + 10);
        ctx.fillStyle = 'rgba(245, 240, 232, 0.3)';
        ctx.font = '13px Cormorant Garamond, Georgia, serif';
        ctx.fillText('Click to begin again', w / 2, h / 2 + 50);
        ctx.textAlign = 'left';
      }
    };

    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handlePressStart);
      canvas.removeEventListener('mouseup', handlePressEnd);
      canvas.removeEventListener('touchstart', handlePressStart);
      canvas.removeEventListener('touchend', handlePressEnd);
      window.removeEventListener('resize', resize);
    };
  }, [showGame]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Intro text overlay */}
      {showIntro && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, pointerEvents: 'none', padding: '40px',
        }}>
          <div style={{
            maxWidth: '500px', textAlign: 'center',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}>
            <p style={{
              fontSize: '24px', lineHeight: 1.8, color: '#f5f0e8',
              fontWeight: 300, letterSpacing: '2px',
              textShadow: '0 0 20px rgba(232, 168, 124, 0.3)',
            }}>
              {displayedText}
              <span style={{
                display: 'inline-block', width: '2px', height: '1.2em',
                background: '#e8a87c', marginLeft: '2px', verticalAlign: 'text-bottom',
                boxShadow: '0 0 6px #e8a87c',
              }} />
            </p>
          </div>
        </div>
      )}

      {/* Second text overlay */}
      {showText && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, pointerEvents: 'none', padding: '40px',
        }}>
          <div style={{
            maxWidth: '500px', textAlign: 'center',
            fontFamily: "'Noto Serif SC', 'Cormorant Garamond', Georgia, serif",
          }}>
            <p style={{
              fontSize: '22px', lineHeight: 1.8, color: 'rgba(245, 240, 232, 0.6)',
              fontWeight: 300, letterSpacing: '4px',
            }}>
              {displayedTextZh}
            </p>
          </div>
        </div>
      )}

      {/* Game canvas */}
      {showGame && (
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      )}

      {/* Film grain overlay */}
      <div style={{
        position: 'fixed', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
        width: '200%', height: '200%',
        background: 'transparent url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E") repeat',
        animation: 'grain 8s steps(10) infinite',
        pointerEvents: 'none',
        zIndex: 999,
        opacity: 0.4,
      }} />

      {/* Footer — Contact */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '12px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: '11px',
          color: 'rgba(245, 240, 232, 0.35)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          letterSpacing: '1px',
          lineHeight: 1.8,
        }}>
          <a href="mailto:visionfish@outlook.com" style={{
            color: 'rgba(232, 168, 124, 0.5)',
            textDecoration: 'none',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}>visionfish@outlook.com</a>
          {'  ·  '}
          <a href="tel:+852-57495090" style={{
            color: 'rgba(232, 168, 124, 0.5)',
            textDecoration: 'none',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}>+852-57495090</a>
        </div>
      </div>
    </div>
  );
}
