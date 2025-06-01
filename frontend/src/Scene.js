import React from 'react';
import './Scene.css';

const SceneDisplay = ({ sceneId, npc, itemSprite }) => {
  // Basic hash function to get a color from sceneId for variety
  const getBackgroundColor = (id) => {
    if (!id) return '#CCCCCC'; // Default color
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '000000'.substring(0, 6 - color.length) + color;
  };

  const style = {
    backgroundColor: getBackgroundColor(sceneId),
    // In a real game, you might have backgroundImage: `url(/images/scenes/${sceneId}.png)`
  };

  return (
    <div className="scene-container" style={style}>
      <div className="scene-content">
        {/* <p>Current Scene ID (for dev): {sceneId}</p> */}
        {npc && (
          <div className="sprite-placeholder npc-sprite">
            {/* In a real game: <img src={`/images/npcs/${npc.name}.png`} alt={npc.name} /> */}
            <p>NPC: {npc.name}</p>
            {/* Simple representation of NPC mood for now */}
            {npc.mood && <p>(Mood: {npc.mood})</p>}
          </div>
        )}
        {itemSprite && (
          <div className="sprite-placeholder item-sprite"> {/* Corrected class name */}
            {/* In a real game: <img src={`/images/items/${itemSprite}.png`} alt={itemSprite} /> */}
            <p>Item: {itemSprite}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneDisplay;
