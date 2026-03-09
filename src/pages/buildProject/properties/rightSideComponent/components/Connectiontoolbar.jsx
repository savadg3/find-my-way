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
import { EraseSvg, PencilSvg, SelectSvg } from '../../../../../components/common/svgIcons';

const PenIcon = () => (
  <PencilSvg fill={'#A8ABAF'}/>
);
const SelectIcon = () => (
  <SelectSvg fill={'#A8ABAF'}/>
);
const HighlighterIcon = () => (
  <EraseSvg fill={'#A8ABAF'}/>
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

export default function ConnectionToolbar() {
  const dispatch    = useDispatch();
  const activeTool  = useSelector((s) => s.navigation.activeTool);
  const activePath  = useSelector((s) => s.navigation.activePath);

  const autoGenerate = useAutoGenerateSubPaths();

  const tools = [
    { id: 'pen',         icon: <PenIcon />,        label: 'Draw path'           },
    { id: 'select',      icon: <SelectIcon />,      label: 'Select / move nodes' },
    { id: 'highlighter', icon: <HighlighterIcon />, label: 'Select path'         },
  ];

  const showPathToggle = activeTool === 'pen';

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
            {/* <BoltIcon /> */}
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
