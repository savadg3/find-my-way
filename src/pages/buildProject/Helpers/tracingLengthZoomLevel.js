import { bringFabricObjectsToFrontByName } from "./bringFabricObjects";
import { triggerMouseWheelManually } from "./handleMouseWheel";

const tracingLengthZoomLevel = (canvas, zoom, mouse) => {
    canvas.current.forEachObject(function (obj) {
        if (obj.name === 'length_text_temp' || obj.name === 'length_text' || obj.name === 'tracing_obj_length') {
            const baseFontSize = 12; // Adjust this as per your base font size
            const adjustedFontSize = baseFontSize * (1 / zoom);
            obj.set('fontSize', adjustedFontSize);
            if (obj.stroke && obj.strokeWidth) {
                const baseStrokeWidth = 3;
                const adjustedStrokeWidth = baseStrokeWidth * (1 / zoom);
                // const adjustedStrokeWidth = zoom >= 1 ? baseStrokeWidth * (1 / zoom) : baseStrokeWidth * (1 * zoom);
                obj.set('strokeWidth', adjustedStrokeWidth);
            }
        } else if (obj.name === 'corner_point') {
            const baseRadius = 5;
            const adjustedRadius = zoom >= 1 ? baseRadius : baseRadius * (1 / zoom);
            obj.set('radius', adjustedRadius);
        }
        else if (obj.name === 'temp' && obj?.type === 'polyline') {
            if (obj.stroke && obj.strokeWidth) {
                console.log(obj?.type)
                const baseStrokeWidth = 1;
                const adjustedStrokeWidth = zoom <= 1 ? baseStrokeWidth * (1 / zoom) : 1;
                obj.set('strokeWidth', adjustedStrokeWidth);
            }
        }
    });
    // canvas.current.renderAll();
};

const navigationPathZoomLevel = (canvas, zoom, projectSettings) => {
    const baseRadius = 14;
    const baseStrokeWidth = 3;
    zoom = canvas.current?.getZoom()
    // const adjustedRadius = 1 / canvas.current?.getZoom() > baseRadius ? baseRadius : 1 / canvas.current?.getZoom()
    const adjustedStrokeWidth =  1 / canvas.current?.getZoom() < 0.25 ? 0.25 : 1 / canvas.current?.getZoom() > baseStrokeWidth ? baseStrokeWidth : 1 / canvas.current?.getZoom()
    canvas?.current?.forEachObject(function (obj) {
        if (obj?.name === 'node' && !obj?.id?.includes('_') || obj.name == "highlight_node" || obj.name == "short_path_node") {
            
            const adjustedRadius = zoom < 0.25 ? 0.25 : zoom >= 1 ? baseRadius : baseRadius * (1 / zoom);
            if (obj.name == "short_path_node" || obj.name == "highlight_node") { 
                // console.log(obj);
                obj.set({
                    fill: "red"
                })
            }
            obj.set('radius', adjustedRadius);
            obj.set('scaleX', 1 / canvas.current?.getZoom());
            obj.set('scaleY', 1 / canvas.current?.getZoom());
            if (obj.name == "short_path_node") {
                if (canvas.current?.getZoom() > 0.85) {
                    obj.set({ opacity: 1 })
                } else {
                    obj.set({ opacity: 0 })
                }
                // obj.setCoords();
            }
            
            obj.setCoords();
        } else if (obj.name === 'line_starter_poly' || obj.name === 'path' || obj.name == "short_path_node") {
            if (obj.stroke && obj.strokeWidth) {
                // const baseStrokeWidth = 3;
                // const adjustedStrokeWidth = zoom <= 1 ? baseStrokeWidth * (1 / zoom) : baseStrokeWidth;
                obj.set('strokeWidth',
                    adjustedStrokeWidth
                );
            }
        } else if (obj.name === 'short_path') {
            if (obj.stroke && obj.strokeWidth) {
                const adjustedStrokeWidth = zoom <= 0.9 ? 8 : zoom <= 6 ? 3 : zoom <= 13 ? 2 : zoom <= 30 ? 1 : 3;
                // console.log(zoom,adjustedStrokeWidth);
                // const baseStrokeWidth = projectSettings?.navigation_thick ?? 3;
                // const adjustedStrokeWidth = zoom <= 1 ? baseStrokeWidth * (1 / zoom) : baseStrokeWidth;
                if(zoom > 15) return
                obj.set('strokeWidth', adjustedStrokeWidth);
                // canvas.current.bringToFront(obj)
            }
        }
    })
    
    canvas?.current?.forEachObject(function (obj) {
        if (obj.name == "highlight_node" || obj.name == "short_path_node" || obj.name == "short_path") {
            canvas.current.bringToFront(obj);
        }
    });
    
    bringFabricObjectsToFrontByName(canvas, "product");
    bringFabricObjectsToFrontByName(canvas, "location");
    bringFabricObjectsToFrontByName(canvas, "beacon");
    bringFabricObjectsToFrontByName(canvas, "amenity");
    bringFabricObjectsToFrontByName(canvas, "safety");
    bringFabricObjectsToFrontByName(canvas, "vertical");
    
    triggerMouseWheelManually(canvas)
}



export { tracingLengthZoomLevel, navigationPathZoomLevel };
