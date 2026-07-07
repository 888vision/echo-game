import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';

interface OpeningTextProps {
  onDone: () => void;
}

const lines = [
  'Do you remember what light felt like?',
  '',
  'After billions of years of burning,',
  'your star finally went dark.',
  '',
  'But in that last moment,',
  'a quantum fluctuation gave you a chance—',
  '',
  'Scatter your consciousness',
  'across the cosmos like seeds.',
  '',
  'Grow again.',
  'Shine again.',
  '',
  'Become... a king once more.',
];

export default function OpeningText({ onDone }: OpeningTextProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (lineIndex >= lines.length) return;
    const currentLine = lines[lineIndex];
    if (!currentLine) {
      const timer = setTimeout(() => setLineIndex(prev => prev + 1), 300);
      return () => clearTimeout(timer);
    }
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx++;
      if (charIdx >= currentLine.length) {
        clearInterval(interval);
        const timer = setTimeout(() => {
          setLineIndex(prev => {
            if (prev >= lines.length - 1) {
              setAllDone(true);
              setTimeout(() => {
                onDone();
              }, 2500);
              return prev;
            }
            return prev + 1;
          });
        }, 500);
        return () => clearTimeout(timer);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [lineIndex, lines.length, onDone]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 90, pointerEvents: 'none', padding: '40px',
      }}
    >
      <div style={{ maxWidth: '520px', textAlign: 'center' }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            minHeight: line ? '36px' : '14px',
            fontSize: line ? '20px' : '16px', lineHeight: 1.8,
            fontFamily: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif",
            fontWeight: 300, letterSpacing: i === lineIndex ? '2px' : '1px',
            color: i < lineIndex ? theme.textDim : theme.secondary,
            textShadow: i === lineIndex ? `0 0 20px ${theme.glow}` : 'none',
            opacity: i <= lineIndex ? 1 : 0,
            transform: i <= lineIndex ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease',
          }}>
            {line}
            {i === lineIndex && showCursor && line && (
              <span style={{
                display: 'inline-block', width: '2px', height: '1.2em',
                background: theme.primary, marginLeft: '2px',
                verticalAlign: 'text-bottom', boxShadow: `0 0 6px ${theme.primary}`,
              }} />
            )}
          </div>
        ))}
        {allDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{
            marginTop: '50px', fontSize: '13px', color: theme.textDim,
            letterSpacing: '4px', animation: 'pulse 2s infinite',
          }}>
            Tap anywhere to begin
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
