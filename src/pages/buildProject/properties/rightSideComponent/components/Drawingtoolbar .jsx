// DrawingToolbar.jsx  (updated — dispatches to drawingToolbarSlice)
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import './toolbar.css';
import {
  setActiveTool, setActiveShape,
  setFillColor, setStrokeColor, setStrokeWidth,
  setFontFamily, setFontSize, setBold, setTextAlign,
} from '../../../../../store/slices/drawingToolbarSlice';
import { removeShapes } from '../../../../../store/slices/drawingSlice';
import { removeItem }   from '../../../../../store/slices/imageOverlaySlice';
import useImageImport from "../../../../../components/map/components/Map/Image/Useimageimport";
// import useImageImport from './useImageImport';

// ── Icons (unchanged) ─────────────────────────────────────────────────────────
const PenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const HighlighterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.232 5.232l3.536 3.536-7.071 7.07-3.536-3.535z"/><path d="M9.5 19.5l-3-3 1-4 3 3z"/><line x1="3" y1="21" x2="9.5" y2="19.5"/>
  </svg>
);
const TextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);
const EraserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l10-10 7 7z"/><path d="M6.0001 13.9999L10 18"/>
  </svg>
);
const SelectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l14 9-7 1-4 7z"/>
  </svg>
);
const ImportSVGIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const FreehandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17c3-3 4-7 8-7s5 4 8 1"/>
  </svg>
);
const RectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="6" width="16" height="12" rx="1"/>
  </svg>
);
const CircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="8"/>
  </svg>
);
const AlignLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
  </svg>
);
const AlignCenterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);
const AlignRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
  </svg>
);

// ── Sub-components (unchanged) ────────────────────────────────────────────────
const ColorSwatch = ({ color, label, onChange }) => {
  const inputRef = useRef(null);
  return (
    <button className="color-swatch" onClick={() => inputRef.current?.click()} title={`Change ${label}`} style={{ "--swatch": color }}>
      <span className="swatch-box" />
      <span className="swatch-hex">{color.toUpperCase()}</span>
      <input ref={inputRef} type="color" value={color} onChange={(e) => onChange(e.target.value)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
    </button>
  );
};

const StrokeControl = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="stroke-btn" onClick={() => setOpen(v => !v)}>
        <span className="stroke-lines-icon">
          {[2, 3, 4].map((w, i) => <span key={i} style={{ height: w, opacity: i === 1 ? 1 : 0.45 }} />)}
        </span>
        <span className="swatch-hex">{value}</span>
      </button>
      {open && (
        <div className="dropdown-panel" style={{ minWidth: 64 }}>
          {[1, 2, 3, 4, 6].map(n => (
            <button key={n} className={`dropdown-item stroke-option ${n === value ? "active" : ""}`}
              onClick={() => { onChange(n); setOpen(false); }}>
              <span style={{ display: "block", height: n, background: "currentColor", borderRadius: 2, width: "100%" }} />
              <span style={{ fontSize: 11, marginTop: 2 }}>{n}px</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FONTS = ["Arial", "Georgia", "Verdana", "Times New Roman", "Courier New", "Trebuchet MS"];
const SIZES = [8, 10, 12, 14, 16, 18, 24, 32, 48, 64];

const FontFamilyPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="text-select" onClick={() => setOpen(v => !v)} style={{ minWidth: 136 }}>
        <span style={{ fontFamily: value }}>{value}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="dropdown-panel" style={{ minWidth: 170 }}>
          {FONTS.map(f => (
            <button key={f} className={`dropdown-item ${f === value ? "active" : ""}`}
              style={{ fontFamily: f }} onClick={() => { onChange(f); setOpen(false); }}>{f}</button>
          ))}
        </div>
      )}
    </div>
  );
};

const FontSizePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="text-select" onClick={() => setOpen(v => !v)} style={{ minWidth: 60 }}>
        <span>{value}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="dropdown-panel" style={{ minWidth: 70 }}>
          {SIZES.map(s => (
            <button key={s} className={`dropdown-item ${s === value ? "active" : ""}`}
              onClick={() => { onChange(s); setOpen(false); }}>{s}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function DrawingToolbar() {
  const dispatch = useDispatch();
  const { openImagePicker, openSVGPicker } = useImageImport();

  // Activate pen by default when entering the floorplan page; deactivate on leave.
  // Mirrors the same pattern used by ConnectionToolbar so DrawingManager no-ops
  // (activeTool === null → no listeners bound) when away from the floorplan page.
  useEffect(() => {
    dispatch(setActiveTool('pen'));
    return () => {
      dispatch(setActiveTool(null));
    };
  }, [dispatch]);

  // Selection state — used to show/hide the delete button
  const selectedIds      = useSelector((s) => s.drawing.selectedIds);
  const selectedImageId  = useSelector((s) => s.imageOverlay.selectedId);
  const hasSelection     = selectedIds.length > 0 || selectedImageId !== null;

  const handleDelete = () => {
    if (selectedIds.length > 0)   dispatch(removeShapes(selectedIds));
    if (selectedImageId !== null) dispatch(removeItem(selectedImageId));
  };

  // Read all toolbar state from Redux
  const activeTool  = useSelector((s) => s.drawingToolbar.activeTool);
  const activeShape = useSelector((s) => s.drawingToolbar.activeShape);
  const fillColor   = useSelector((s) => s.drawingToolbar.fillColor);
  const strokeColor = useSelector((s) => s.drawingToolbar.strokeColor);
  const strokeWidth = useSelector((s) => s.drawingToolbar.strokeWidth);
  const fontFamily  = useSelector((s) => s.drawingToolbar.fontFamily);
  const fontSize    = useSelector((s) => s.drawingToolbar.fontSize);
  const bold        = useSelector((s) => s.drawingToolbar.bold);
  const textAlign   = useSelector((s) => s.drawingToolbar.textAlign);

  const tools = [
    { id: "pen",         icon: <PenIcon />,        label: "Pen"         },
    { id: "highlighter", icon: <HighlighterIcon />, label: "Highlighter" },
    { id: "text",        icon: <TextIcon />,        label: "Text"        },
    { id: "eraser",      icon: <EraserIcon />,      label: "Eraser"      },
    { id: "select",      icon: <SelectIcon />,      label: "Select"      },
  ];

  const showShapeBar = activeTool === "pen";
  const showTextBar  = activeTool === "text";

  return (
    <div className="scene mt-2">
      <div className="toolbar">
        <div className="tools-section">
          <div className="tools-row">
            {tools.map((t) => (
              <button key={t.id} className={`tool-btn ${activeTool === t.id ? "active" : ""}`}
                onClick={() => dispatch(setActiveTool(t.id))} title={t.label}>
                {t.icon}
              </button>
            ))}
          </div>
          <span className="section-label">Tools</span>
        </div>

        <div className="divider" />

        <div className="section">
          <div className="section-inner">
            <ColorSwatch color={fillColor} label="fill" onChange={(c) => dispatch(setFillColor(c))} />
          </div>
          <span className="section-label">Fill</span>
        </div>

        <div className="divider" />

        <div className="section">
          <div className="section-inner">
            <ColorSwatch color={strokeColor} label="stroke" onChange={(c) => dispatch(setStrokeColor(c))} />
            <StrokeControl value={strokeWidth} onChange={(w) => dispatch(setStrokeWidth(w))} />
          </div>
          <span className="section-label">Stroke</span>
        </div>

        <div className="divider" />

        <button className="import-btn" title="Import SVG" onClick={openSVGPicker}>
          <ImportSVGIcon />
          <span>Import SVG</span>
        </button>

        <div className="divider" />

        <button className="ref-btn" title="Add Reference Image" onClick={openImagePicker}>
          <PlusIcon />
          <span>Reference Image</span>
        </button>

        {hasSelection && (
          <>
            <div className="divider" />
            <button
              className="ref-btn"
              title="Delete selected"
              onClick={handleDelete}
              style={{ color: '#e03131' }}
            >
              <TrashIcon />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      {showShapeBar && (
        <div className="sub-toolbar">
          {[
            { id: "freehand", icon: <FreehandIcon />, label: "Freehand"  },
            { id: "rect",     icon: <RectIcon />,     label: "Rectangle" },
            { id: "circle",   icon: <CircleIcon />,   label: "Circle"    },
          ].map((s) => (
            <button key={s.id} className={`shape-btn ${activeShape === s.id ? "active" : ""}`}
              onClick={() => dispatch(setActiveShape(s.id))} title={s.label}>
              {s.icon}
            </button>
          ))}
        </div>
      )}

      {showTextBar && (
        <div className="text-toolbar">
          <FontFamilyPicker value={fontFamily} onChange={(f) => dispatch(setFontFamily(f))} />
          <div className="text-divider" />
          <FontSizePicker value={fontSize} onChange={(s) => dispatch(setFontSize(s))} />
          <div className="text-divider" />
          <button className={`bold-btn ${bold ? "active" : ""}`}
            onClick={() => dispatch(setBold(!bold))} title="Bold">B</button>
          <div className="text-divider" />
          {[
            { id: "left",   icon: <AlignLeftIcon />,   label: "Align left"   },
            { id: "center", icon: <AlignCenterIcon />, label: "Align center" },
            { id: "right",  icon: <AlignRightIcon />,  label: "Align right"  },
          ].map((a) => (
            <button key={a.id} className={`align-btn ${textAlign === a.id ? "active" : ""}`}
              onClick={() => dispatch(setTextAlign(a.id))} title={a.label}>
              {a.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}