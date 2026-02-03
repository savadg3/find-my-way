// import React, { useState, useEffect, useRef } from 'react';
// import { fabric } from 'fabric';

// function DrawingCanvas() {
//   const canvasRef = useRef(null);
//   const [canvas, setCanvas] = useState(null);
//   const [drawingMode, setDrawingMode] = useState('polyline');
//   const [lines, setLines] = useState([]);
//   const [currentLine, setCurrentLine] = useState(null);

//   useEffect(() => {t
//     if (!canvas) {
//       const newCanvas = new fabric.Canvas(canvasRef.current, { objectCaching: false });
//       setCanvas(newCanvas);
//     }

//     if (canvas) {
//       canvas.isDrawingMode = drawingMode === 'freehand';

//       canvas.on('mouse:down', (event) => {
//         if (drawingMode === 'polyline') {
//           const { offsetX, offsetY } = event.pointer;
//           const newPoint = { x: offsetX, y: offsetY };

//           if (!currentLine) {
//             // Create a new polyline
//             const line = new fabric.Polyline([newPoint, newPoint], {
//               objectCaching: false,
//               fill: 'red',
//               stroke: 'black',
//               strokeWidth: 2,
//               selectable: false,
//             });

//             setCurrentLine(line);
//             canvas.add(line);
//           } else {
//             // Extend the current polyline
//             const updatedPoints = currentLine.get('points').concat([newPoint]);
//             currentLine.set({ points: updatedPoints });
//             canvas.renderAll();
//           }
//         }
//       });

//       canvas.on('mouse:up', () => {
//         if (drawingMode === 'polyline' && currentLine) {
//           setLines([...lines, currentLine]);
//           setCurrentLine(null);
//         }
//       });
//     }
//   }, [canvas, drawingMode, lines, currentLine]);

//   const clearCanvas = () => {
//     canvas.clear();
//     setLines([]);
//     setCurrentLine(null);
//   };

//   return (
//     <div>
//       <div>
//         <button onClick={() => setDrawingMode('polyline')}>Polyline</button>
//         <button onClick={clearCanvas}>Clear</button>
//       </div>
//       <canvas
//         ref={canvasRef}
//         className="canvas-element"
//         style={{ border: '1px solid black' }}
//       ></canvas>
//     </div>
//   );
// }

// export default DrawingCanvas;
/* 50% ok */
import React, { useState, useEffect, useRef } from 'react';
import { fabric } from "fabric";

function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [drawingMode, setDrawingMode] = useState('polyline');

  useEffect(() => {
    if (!canvas) {
      const newCanvas = new fabric.Canvas(canvasRef.current, { objectCaching: false });
      setCanvas(newCanvas);
    }

    if (canvas) {
      canvas.isDrawingMode = drawingMode === 'freehand';

      canvas.on('mouse:down', (e) => {
          if (drawingMode === 'polyline' && !isDrawing) {
            console.log(e)
          setIsDrawing(true);
          const { offsetX, offsetY } = e.e;
          const newMousePt = { x: offsetX, y: offsetY };
          setPoints([newMousePt]); // Start a new set of points
        }
      });

      canvas.on('mouse:move', (e) => {
        if (drawingMode === 'polyline' && isDrawing) {
          const { offsetX, offsetY } = e.e;
          const updatedPoints = [...points, { x: offsetX, y: offsetY }];
          setPoints(updatedPoints);
          canvas.clear(); // Clear the canvas on each move
          const newPolyline = new fabric.Polyline(updatedPoints, {
            objectCaching: false,
            name: 'temp',
            fill: '',
            stroke: 'black',
            strokeWidth: 2,
          });
          canvas.add(newPolyline);
        }
      });

      canvas.on('mouse:up', () => {
        if (drawingMode === 'polyline' && isDrawing) {
          setIsDrawing(false);
        }
      });
    }
  }, [canvas, drawingMode, isDrawing]);

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      setPoints([]);
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setDrawingMode('polyline')}>Polyline</button>
        <button onClick={() => setDrawingMode('freehand')}>Freehand</button>
        <button onClick={clearCanvas}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        className="canvas-element"
        style={{ border: '1px solid black' }}
      ></canvas>
    </div>
  );
}

export default DrawingCanvas;