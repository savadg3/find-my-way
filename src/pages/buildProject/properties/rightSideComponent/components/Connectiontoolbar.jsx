import { useState } from "react";
import './connection.css'

const PenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const HighlighterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.232 5.232l3.536 3.536-7.071 7.07-3.536-3.535z"/>
    <path d="M9.5 19.5l-3-3 1-4 3 3z"/>
    <line x1="3" y1="21" x2="9.5" y2="19.5"/>
  </svg>
);

const SelectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l14 9-7 1-4 7z"/>
  </svg>
); 

const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
); 

export default function ConnectionToolbar() {
  const [activeTool,  setActiveTool]  = useState("pen"); 
  const [activePath,  setActivePath]  = useState("main");

  const tools = [
    { id: "pen",         icon: <PenIcon />,         label: "Pen" },
    { id: "highlighter", icon: <HighlighterIcon />,  label: "Highlighter" },
    { id: "select",      icon: <SelectIcon />,       label: "Select" },
  ];

  const showSubBar = activeTool === "pen"  

  return (
    <div className="ct-wrapper-body mt-2">
      <div className="ct-wrapper"> 
        <div className="ct-bar"> 
          <div className="ct-tools">
            {tools.map(t => (
              <button
                key={t.id}
                className={`ct-tool-btn ${activeTool === t.id ? "active" : ""}`}
                onClick={() => setActiveTool(t.id)}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <div className="ct-divider" />
 
          <button className="ct-auto-btn">
            <BoltIcon />
            Auto Generate Connections
          </button>
        </div>
 
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>  
 
          {showSubBar && (<div className="ct-path-toggle">
            <button
              className={`ct-path-btn ${activePath === "main" ? "active" : ""}`}
              onClick={() => setActivePath("main")}
            >
              Main Path
            </button>
            <button
              className={`ct-path-btn ${activePath === "subpath" ? "active" : ""}`}
              onClick={() => setActivePath("subpath")}
            >
              Subpath
            </button>
          </div>)}
        </div>
      </div>
    </div>
  );
}