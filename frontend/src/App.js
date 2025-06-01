import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import './App.css';
import SceneDisplay from './Scene';
import XRScene from './XRScene'; // Import the XRScene component

function App() {
  const [currentScene, setCurrentScene] = useState(null);
  const [error, setError] = useState(null);
  const gameScreenRef = useRef(null); // Ref for the game screen element
  const [showXR, setShowXR] = useState(false); // State to toggle XR scene

  // Fetch initial game state
  useEffect(() => {
    fetch('/api/game')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setCurrentScene(data))
      .catch(err => {
        console.error("Error fetching initial game state:", err);
        setError(err.message);
      });
  }, []);

  const handleChoice = (choiceIndex) => {
    setError(null); // Clear previous errors
    fetch('/api/game/choice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ choiceIndex }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => { // Try to parse error body
            throw new Error(`HTTP error! status: ${res.status} - ${errData.error || 'Unknown error'}`);
          });
        }
        return res.json();
      })
      .then(data => setCurrentScene(data))
      .catch(err => {
        console.error("Error making choice:", err);
        setError(err.message);
      });
  };

  const handleReset = () => {
    setError(null);
    fetch('/api/game/reset', { method: 'POST' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setCurrentScene(data))
      .catch(err => {
        console.error("Error resetting game:", err);
        setError(err.message);
      });
  };

  const handleTakePhoto = () => {
    if (gameScreenRef.current) {
      html2canvas(gameScreenRef.current, {
        allowTaint: true, // Important for external images/backgrounds if any
        useCORS: true     // Important for external images/backgrounds if any
      }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `text-adventure-scene-${currentScene.id || 'current'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(err => {
        console.error("Error taking photo:", err);
        setError("Could not capture screen: " + err.message);
      });
    }
  };

  if (error) {
    return (
      <div className="App error-container">
        <h1>An Error Occurred</h1>
        <p>{error}</p>
        <button onClick={handleReset}>Try Resetting Game</button>
      </div>
    );
  }

  if (!currentScene) {
    return <div className="App loading">Loading game...</div>;
  }

  return (
    <div className="App">
      {showXR && <XRScene onExit={() => setShowXR(false)} />}
      <header className="App-header">
        <h1>Text Adventure Game</h1>
      </header>
      <main ref={gameScreenRef} style={{ display: showXR ? 'none' : 'block' }}> {/* Hide main content when XR is active */}
        <SceneDisplay sceneId={currentScene.id} npc={currentScene.npc} itemSprite={null} />

        <div className="narrative-text">
          <p>{currentScene.text}</p>
        </div>

        {currentScene.npc && currentScene.npc.dialogue && (
          <div className="npc-dialogue">
            <strong>{currentScene.npc.name}:</strong> <em>"{currentScene.npc.dialogue}"</em>
          </div>
        )}

        {currentScene.inventory && currentScene.inventory.length > 0 && (
          <div className="inventory">
            <h3>Inventory:</h3>
            <ul>
              {currentScene.inventory.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}

        <div className="choices">
          {currentScene.choices && currentScene.choices.map((choice, index) => (
            <button key={index} onClick={() => handleChoice(index)}>
              {choice.text}
            </button>
          ))}
        </div>

        <div className="controls">
            <button onClick={handleReset}>Reset Game</button>
            <button onClick={handleTakePhoto} className="photo-button">Take Photo</button>
            <button onClick={() => setShowXR(true)} className="xr-button">View in AR</button>
        </div>
      </main>
    </div>
  );
}

export default App;
