import { useState, useCallback } from 'react';
import OpeningScene from './components/OpeningScene';
import OpeningText from './components/OpeningText';
import Echo from './components/Echo';
import { theme } from './styles/theme';

function App() {
  const [showOpeningScene, setShowOpeningScene] = useState(true);
  const [showOpeningText, setShowOpeningText] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const handleOpeningComplete = useCallback(() => {
    setShowOpeningScene(false);
    setShowOpeningText(true);
  }, []);

  const handleTextDone = useCallback(() => {
    setShowOpeningText(false);
    setGameStarted(true);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: theme.bg,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Phase 1: Three.js opening animation — the star explosion */}
      {showOpeningScene && (
        <OpeningScene onComplete={handleOpeningComplete} />
      )}

      {/* Phase 2: Narration text — the story of your death and rebirth */}
      {showOpeningText && (
        <OpeningText onDone={handleTextDone} />
      )}

      {/* Phase 3: The game — ECHO / 回声 */}
      {gameStarted && <Echo />}
    </div>
  );
}

export default App;
