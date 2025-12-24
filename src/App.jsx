import React, { useState, useRef } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import Controls from './components/Controls';
import IntensityGraph from './components/IntensityGraph';
import './index.css';

function App() {
  const [frequency, setFrequency] = useState(0.07);
  const [slitGap, setSlitGap] = useState(50);
  const [slitWidth, setSlitWidth] = useState(15);
  const [fps, setFps] = useState(0);
  const [waveEnabled, setWaveEnabled] = useState(true);
  const [screenPos, setScreenPos] = useState(85); // Screen position as percentage (50-95)

  const gridRef = useRef(null);
  const simRef = useRef(null);
  const [gridInstance, setGridInstance] = useState(null);

  const handleGridInit = (grid) => {
    gridRef.current = grid;
    setGridInstance(grid);
  };

  const handleReset = () => {
    if (simRef.current) {
      simRef.current.reset();
    }
  };

  return (
    <div className="app-container">
      {/* Main Simulation Area */}
      <div className="main-content">
        <SimulationCanvas
          ref={simRef}
          frequency={frequency}
          slitGap={slitGap}
          slitWidth={slitWidth}
          waveEnabled={waveEnabled}
          screenPos={screenPos}
          onFPSUpdate={setFps}
          onGridInit={handleGridInit}
        />

        {/* Floating Controls Overlay */}
        <div className="overlay-ui">
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-primary)', textShadow: '0 0 10px rgba(0,255,157,0.3)', fontFamily: 'Orbitron, sans-serif' }}>
            DOUBLE SLIT
          </h1>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', opacity: 0.7, letterSpacing: '2px' }}>WAVE INTERFERENCE SIMULATOR</p>

          <Controls
            frequency={frequency} setFrequency={setFrequency}
            slitGap={slitGap} setSlitGap={setSlitGap}
            slitWidth={slitWidth} setSlitWidth={setSlitWidth}
            screenPos={screenPos} setScreenPos={setScreenPos}
            waveEnabled={waveEnabled} setWaveEnabled={setWaveEnabled}
            onReset={handleReset}
            fps={fps}
          />
        </div>
      </div>

      {/* Right Sidebar for Graph */}
      <div className="sidebar">
        <div style={{ padding: '15px', fontSize: '12px', color: '#888', borderBottom: '1px solid #333', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Intensity Profile
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {gridInstance && <IntensityGraph grid={gridInstance} width={250} height={window.innerHeight} screenPos={screenPos} />}
        </div>
      </div>
    </div>
  );
}

export default App;


