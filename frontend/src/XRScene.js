import React, { Suspense } from 'react';
import { ARCanvas, DefaultXRControllers, Interactive } from '@react-three/xr';
import { Text } from '@react-three/drei'; // For displaying text in 3D space
// import { Canvas } from '@react-three/fiber'; // Unused import

function Box({ color, size, ...props }) {
  return (
    <mesh {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function ARSceneContent() {
  const [boxColor, setBoxColor] = React.useState('blue');
  const [message, setMessage] = React.useState('Tap the cube!');

  const onSelect = () => {
    const newColor = boxColor === 'blue' ? 'red' : 'blue';
    setBoxColor(newColor);
    setMessage(`Cube is now ${newColor}!`);
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} />

      <Suspense fallback={<Box color="gray" size={[0.2, 0.2, 0.2]} position={[0, 0.5, -1]} />}>
        <Text position={[0, 1, -1]} fontSize={0.1} color="black" anchorX="center" anchorY="middle">
          {message}
        </Text>
      </Suspense>

      {/* Interactive makes the object selectable in AR */}
      <Interactive onSelect={onSelect}>
        <Box color={boxColor} size={[0.2, 0.2, 0.2]} position={[0, 0.5, -1]} />
      </Interactive>
    </>
  );
}


const XRScene = ({ onExit }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
      <ARCanvas sessionInit={{ requiredFeatures: ['hit-test'] }}> {/* hit-test is often required for placing objects */}
        <ARSceneContent />
        <DefaultXRControllers />
      </ARCanvas>
      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          padding: '10px 15px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Exit AR
      </button>
    </div>
  );
};

export default XRScene;
