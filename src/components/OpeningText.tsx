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

// Chinese translation for the second phase
const chineseLines = [
  '你还记得光的样子吗？',
  '',
  '在数十亿年的燃烧之后，',
  '你的恒星终于熄灭了。',
  '',
  '但在最后一刻，',
  '量子涨落给了你一个机会——',
  '',
  '将你的意识，',
  '像种子一样撒向宇宙。',
  '',
  '重新生长。',
  '重新发光。',
  '',
  '重新……成为王。',
];

export default function OpeningText({ onDone }: OpeningTextProps) {
  const [phase, setPhase] = useState<'en' | 'zh' | 'done'>('en');
  const [lineIndex, setLineIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [showHint, setShowHint] = useState(false);

  // Which lines to type based on current phase
  const currentLines = phase === 'en' ? lines : chineseLines;

  // Typing animation
  useEffect(() => {
    if (phase === 'done') return;
    if (lineIndex >= currentLines.length) return;

    const currentLine = currentLines[lineIndex];
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
            if (prev >= currentLines.length - 1) {
              // Line done — move to next phase
              if (phase === 'en') {
                setPhase('zh');
                setLineIndex(0);
              } else {
                setPhase('done');
                setShowHint(true);
                setTimeout(() => {
                  onDone();
                }, 2500);
              }
              return prev;
            }
            return prev + 1;
          });
        }, 500);
        return () => clearTimeout(timer);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [lineIndex, currentLines, phase, onDone]);

  // Cursor blink
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
        {currentLines.map((line, i) => (
          <div key={`${phase}-${i}`} style={{
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
        {showHint && (
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
