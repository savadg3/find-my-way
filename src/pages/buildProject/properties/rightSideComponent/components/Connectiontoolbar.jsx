// Connectiontoolbar.jsx
// Navigation toolbar: pen / select / highlighter tools + main/sub path toggle.
// All state lives in Redux navigationSlice so NavigationManager can read it.

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setNavActiveTool,
  setNavActivePath,
  clearNavSelection,
  clearAllNavPaths,
} from '../../../../../store/slices/navigationSlice';
import {
  useAutoGenerateSubPaths,
} from '../../../../../components/map/components/Map/Navigation/useNavigationManager'; 
import './connection.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const PenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const SelectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l14 9-7 1-4 7z"/>
  </svg>
);
const HighlighterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.232 5.232l3.536 3.536-7.071 7.07-3.536-3.535z"/>
    <path d="M9.5 19.5l-3-3 1-4 3 3z"/>
    <line x1="3" y1="21" x2="9.5" y2="19.5"/>
  </svg>
);
const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const PdfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9"  y1="15" x2="15" y2="15"/>
  </svg>
);

export default function ConnectionToolbar() {
  const dispatch   = useDispatch();
  const activeTool = useSelector((s) => s.navigation.activeTool);
  const activePath = useSelector((s) => s.navigation.activePath);

  const autoGenerate = useAutoGenerateSubPaths();

  const tools = [
    { id: 'pen',         icon: <PenIcon />,        label: 'Draw path'           },
    { id: 'select',      icon: <SelectIcon />,      label: 'Select / move nodes' },
    { id: 'highlighter', icon: <HighlighterIcon />, label: 'Select path'         },
  ];

  const showPathToggle = activeTool === 'pen';

  // Activate pen by default when toolbar mounts; deactivate on unmount
  useEffect(() => {
    dispatch(setNavActiveTool('pen'));
    return () => {
      dispatch(setNavActiveTool(null));
      dispatch(clearNavSelection());
    };
  }, [dispatch]);

  return (
    <div className="ct-wrapper-body mt-2">
      <div className="ct-wrapper">
        {/* ── Main bar ─────────────────────────────────────────────────── */}
        <div className="ct-bar">
          <div className="ct-tools">
            {tools.map((t) => (
              <button
                key={t.id}
                className={`ct-tool-btn ${activeTool === t.id ? 'active' : ''}`}
                onClick={() => dispatch(setNavActiveTool(t.id))}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <div className="ct-divider" />

          <button
            className="ct-auto-btn"
            onClick={autoGenerate}
            title="Auto-connect all pins to nearest main path"
          >
            <BoltIcon />
            Auto Generate Connections
          </button>

          <div className="ct-divider" />

          <button
            className="ct-tool-btn"
            title="Clear all paths"
            style={{ color: '#e03131' }}
            onClick={() => {
              if (window.confirm('Clear all navigation paths?')) {
                dispatch(clearAllNavPaths());
              }
            }}
          >
            <TrashIcon />
          </button>

        </div>

        {/* ── Path-type toggle (pen only) ───────────────────────────────── */}
        {showPathToggle && (
          <div className="ct-path-toggle">
            <button
              className={`ct-path-btn ${activePath === 'main' ? 'active' : ''}`}
              onClick={() => dispatch(setNavActivePath('main'))}
            >
              Main Path
            </button>
            <button
              className={`ct-path-btn ${activePath === 'sub' ? 'active' : ''}`}
              onClick={() => dispatch(setNavActivePath('sub'))}
            >
              Subpath
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
