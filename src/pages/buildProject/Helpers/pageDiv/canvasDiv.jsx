import CustomScrollBar from "../../../../components/scrollBar/CustomScrollBar";

const CanvasDiv = (
    {
        mapDivSize,
        canvas,
        onScrollBarMove,
        canvasCenter,
        currentZoom
    }
) => {
    return (
        <div
            className="tracing-cont"
            style={{
                right: 0,
                left: 0,
                width: "100%",
                height: mapDivSize.height - 60,
                position: "absolute",
                zIndex: 10,
            }}
        >
            <canvas
                ref={canvas}
                id="canvas"
            ></canvas>
            <CustomScrollBar
                onScrollBarMove={onScrollBarMove}
                canvasCenter={canvasCenter}
                zoom={currentZoom}
                divWidth={mapDivSize.width}
                canvas={canvas}
            />
        </div>
    )
}
export default CanvasDiv;