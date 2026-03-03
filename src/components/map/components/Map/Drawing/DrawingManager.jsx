import { useSelector } from 'react-redux';
import useDrawingManager from './useDrawingManager';

export default function DrawingManager() {
  const activeTool  = useSelector((s) => s.drawingToolbar.activeTool);
  const activeShape = useSelector((s) => s.drawingToolbar.activeShape);
  const strokeColor = useSelector((s) => s.drawingToolbar.strokeColor);
  const strokeWidth = useSelector((s) => s.drawingToolbar.strokeWidth);
  const fillColor   = useSelector((s) => s.drawingToolbar.fillColor);
  const fontFamily  = useSelector((s) => s.drawingToolbar.fontFamily);
  const fontSize    = useSelector((s) => s.drawingToolbar.fontSize);
  const bold        = useSelector((s) => s.drawingToolbar.bold);
  const textAlign   = useSelector((s) => s.drawingToolbar.textAlign);

  useDrawingManager({
    activeTool, activeShape,
    strokeColor, strokeWidth, fillColor,
    fontFamily, fontSize, bold, textAlign,
  });

  return null;
}