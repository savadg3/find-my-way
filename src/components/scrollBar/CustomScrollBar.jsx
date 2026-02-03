import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import { fabric } from "fabric";

const CustomScrollBar = ({
  zoom,
  divWidth,
  canvas,
  onScrollBarMove,
  canvasCenter
}) => {
  const divRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [thumbWidth, setThumbWidth] = useState(divWidth / zoom);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - divRef.current.offsetLeft,
      y: e.clientY - divRef.current.offsetTop
    });
  };

  const handleMouseMove = (e) => {
    console.log(e, "eeeee");
    if (!isDragging) return;
    console.log(e.clientX, "e.clientX");
    const newX = e.clientX - dragStart.x;
    console.log(newX, "newX");
    //   const newY = e.clientY - dragStart.y;
    if (newX > 0&&newX<=divWidth) {
        onScrollBarMove({ x: e.movementX*zoom, y: 0 });
      divRef.current.style.left = `${newX}px`;
    }

    //   divRef.current.style.top = `${newY}px`;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (canvasCenter) {
      const zoomLevel = zoom;
      setThumbWidth(divWidth / zoom);
      const center = canvasCenter;
      const zoomPosition = new fabric.Point(
        center.left * zoomLevel,
        center.top * zoomLevel
      );
      console.log(zoomPosition, divWidth);
    }
  }, [zoom, divWidth, canvasCenter]);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        zIndex: 999,
      }}
    >
      <div
        style={{
          height: 20,
          position: "relative",
          backgroundColor: "green",
          bottom: 0
        }}
      >
        <div
          ref={divRef}
          style={{
            width: thumbWidth,
            height: 20,
            position: "absolute",
            top: 0,
            backgroundColor: "red"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default CustomScrollBar;
