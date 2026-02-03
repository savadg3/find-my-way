const canvasBackGroundColor = (color, canvas) => {
    // const rgbColor = color ? hexToRgb(color) : '#F6F7F3';
    const rgbColor = color ?? '#F6F7F3';
    canvas.current.backgroundColor = rgbColor;
    // canvas.current.hoverCursor = `url(${Pencil}) 1 17, auto`;
    canvas.current.renderAll();
}

export default canvasBackGroundColor;