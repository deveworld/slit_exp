import React from 'react';
import { Settings, Activity, Power, RotateCcw } from 'lucide-react';

const ControlRow = ({ label, children }) => (
    <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#888' }}>
            {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {children}
        </div>
    </div>
);

const Slider = ({ value, min, max, step, onChange }) => (
    <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
            width: '100%',
            accentColor: 'var(--accent-primary)',
            background: 'rgba(255,255,255,0.1)',
            cursor: 'pointer'
        }}
    />
);

const Button = ({ onClick, active, children, color = 'var(--accent-primary)' }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            background: active ? color : 'rgba(255,255,255,0.1)',
            color: active ? '#000' : '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            transition: 'all 0.2s'
        }}
    >
        {children}
    </button>
);

const Controls = ({
    frequency, setFrequency,
    slitGap, setSlitGap,
    slitWidth, setSlitWidth,
    screenPos, setScreenPos,
    waveEnabled, setWaveEnabled,
    onReset,
    fps
}) => {
    return (
        <div className="controls-panel" style={{
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '20px',
            width: '250px',
            color: 'var(--text-main)',
            fontFamily: 'monospace'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <Settings size={18} style={{ marginRight: '10px', color: 'var(--accent-secondary)' }} />
                <h3 style={{ margin: 0, fontSize: '14px' }}>PARAMETERS</h3>
            </div>

            <ControlRow label={`Frequency: ${frequency.toFixed(2)}`}>
                <Slider value={frequency} min={0.05} max={0.1} step={0.005} onChange={setFrequency} />
            </ControlRow>

            <ControlRow label={`Slit Gap: ${slitGap}px`}>
                <Slider value={slitGap} min={0} max={200} step={2} onChange={setSlitGap} />
            </ControlRow>

            <ControlRow label={`Slit Width: ${slitWidth}px`}>
                <Slider value={slitWidth} min={2} max={40} step={1} onChange={setSlitWidth} />
            </ControlRow>

            <ControlRow label={`Screen Position: ${screenPos}%`}>
                <Slider value={screenPos} min={55} max={95} step={1} onChange={setScreenPos} />
            </ControlRow>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '15px' }}>
                <Button onClick={() => setWaveEnabled(!waveEnabled)} active={waveEnabled}>
                    <Power size={14} />
                    {waveEnabled ? 'ON' : 'OFF'}
                </Button>
                <Button onClick={onReset} color="#ff6b6b">
                    <RotateCcw size={14} />
                    Reset
                </Button>
            </div>

            <div style={{ fontSize: '10px', color: '#555', display: 'flex', alignItems: 'center' }}>
                <Activity size={12} style={{ marginRight: '5px' }} />
                FPS: {fps}
            </div>
        </div>
    );
};

export default Controls;


