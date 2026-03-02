import React from 'react';
import { useMapContext, DRAW_MODES } from '../contexts/MapContext';

const tools = [
  {
    mode: DRAW_MODES.CIRCLE,
    label: 'Circle',
    title: 'Draw Circle — click & drag',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    mode: DRAW_MODES.RECTANGLE,
    label: 'Rectangle',
    title: 'Draw Rectangle — click & drag',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="1" />
      </svg>
    ),
  },
  {
    mode: DRAW_MODES.POLYGON,
    label: 'Polygon',
    title: 'Draw Polygon — click to add points, double-click to close',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,3 21,9 17,20 7,20 3,9" />
      </svg>
    ),
  },
];

const DrawingToolbar = () => {
  const {
    activeDrawMode,
    setActiveDrawMode,
    selectedShapeId,
    deleteShape,
    clearDrawMode,
  } = useMapContext();

  const handleToolClick = (mode) => {
    if (activeDrawMode === mode) {
      clearDrawMode(); // toggle off
    } else {
      setActiveDrawMode(mode);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        padding: 6,
      }}
    >
      {tools.map(({ mode, label, title, icon }) => (
        <button
          key={mode}
          title={title}
          onClick={() => handleToolClick(mode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            color: activeDrawMode === mode ? '#fff' : '#374151',
            backgroundColor: activeDrawMode === mode ? '#1a73e8' : 'transparent',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (activeDrawMode !== mode) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (activeDrawMode !== mode) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {icon}
          {label}
        </button>
      ))}

      {/* Separator */}
      {selectedShapeId && (
        <>
          <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '2px 0' }} />
          <button
            title="Delete selected shape (or press Delete key)"
            onClick={() => deleteShape(selectedShapeId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              color: '#dc2626',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete Shape
          </button>
        </>
      )}

      {/* Hint for polygon mode */}
      {activeDrawMode === DRAW_MODES.POLYGON && (
        <div
          style={{
            fontSize: 11,
            color: '#6b7280',
            padding: '4px 6px',
            maxWidth: 140,
            lineHeight: 1.4,
          }}
        >
          Click to add points.<br />Double-click to finish.
        </div>
      )}
    </div>
  );
};

export default DrawingToolbar;
