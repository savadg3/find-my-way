import { bringFabricObjectsToFrontByName } from "./bringFabricObjects";
import {navigationPathZoomLevel, tracingLengthZoomLevel} from "./tracingLengthZoomLevel";

const handleMouseWheel = (options, canvas, canZoom = true) => {
    if (!canvas.current) return
    var delta = options?.e?.deltaY || 0;
    // console.log(delta,"sjfsdfshd");
    var pointer = canvas?.current?.getPointer(options.e);

    var zoom = canvas?.current?.getZoom();
    if (delta > 0) {
        zoom /= 1.1;
    } else {
        zoom *= 1.1;
    }
    if (zoom > 30) zoom = 30;
    // if (zoom > 10) zoom = 10;
    // if (zoom < 0.1) zoom = 0.1;
    // console.log(zoom);
    if (canZoom) {
        canvas.current.zoomToPoint(
            { x: options.e.offsetX, y: options.e.offsetY },
            zoom
        );
    }
    // console.log(1 / canvas.current?.getZoom());
    if(zoom < 1) return
    

    const currentZoom = canvas.current.getZoom();
    canvas.current.forEachObject((obj) => {
        const center = obj.getCenterPoint();
        if (
            obj.name != "svg_refImage" &&
            obj.name != "tracing" &&
            obj.name != "boundary" &&
            obj.name != "temp" &&
            // obj.name != "node" &&
            // obj.name != "path" &&
            obj.name != "text"
        ) {
            if (obj.strokeUniform) {
                // if (obj.name == "short_path_node" || obj.name == "highlight_node") { 
                //     obj.set({
                //         fill: "red"
                //     })
                // }
            } else if (obj.name == "path" || obj.name == "short_path" 
                || obj.name == "line_starter_poly"
            ) {
                if(canvas.current?.getZoom() > 0.6) return
                obj.set({
                    ignoreZoom: true,
                    skipAbsolute: true,
                    // strokeWidth: 1 / canvas.current?.getZoom() > 0.5 ? 1 / canvas.current?.getZoom() : 0.5,
                    strokeWidth: zoom <= 0.9 ? 8 : zoom <= 6 ? 3 : zoom <= 13 ? 2 : zoom <= 30 ? 1 : 3,
                    // scaleX: 1 / canvas.current?.getZoom(),
                    // scaleY: 1 / canvas.current?.getZoom()
                });
                // console.log(1 / canvas.current?.getZoom(), 1 / canvas.current?.getZoom() > 1 ? 1 / canvas.current?.getZoom() : 1);
            }else
            if (obj.type == "group" && !obj?.id && obj.name != "text") {
                obj.forEachObject((obj1) => {
                    obj1.set({
                        ignoreZoom: true,
                        skipAbsolute: true,
                        scaleX: 1 / canvas.current?.getZoom(),
                        scaleY: 1 / canvas.current?.getZoom(),
                        strokeWidth: 1
                    });
                });
                obj.setPositionByOrigin(center, "center", "center");
                    
            } else {
                // console.log(1 / canvas.current?.getZoom() );
                obj.set({
                    ignoreZoom: true,
                    skipAbsolute: true,
                    // scaleX: 1 / canvas.current?.getZoom(),
                    // scaleY: 1 / canvas.current?.getZoom()
                    scaleX: 1 / canvas.current?.getZoom() > 0.1 ? 1 / canvas.current?.getZoom() : 0.1,
                    scaleY: 1 / canvas.current?.getZoom() > 0.1 ? 1 / canvas.current?.getZoom() : 0.1
                });
                    
                obj.setPositionByOrigin(center, "center", "center");
            }
        }
        
        // if (obj?.name != "tracing" &&
        //     obj?.types != 'highlight_pin' &&
        //     obj?.name != "svg_refImage" &&
        //     obj?.name != "short_path" &&
        //     obj?.name != "text" &&
        //     obj?.name != "safety" &&
        //     obj?.name != "amenity" &&
        //     obj?.name != "vertical" &&
        //     obj?.name != "boundary" &&
        //     obj?.name != "arrow-head" &&
        //     currentZoom <= 0.35
        // ) {

        //     if (canvas.current.getZoom() <= 0.35 && canvas.current.getZoom() > 0.3) {
        //         obj.set({ opacity: 0.6 })
        //     } else if (canvas.current.getZoom() < 0.3 && canvas.current.getZoom() >= 0.25) {
        //         obj.set({ opacity: 0.3 })
        //     } else if (canvas.current.getZoom() < 0.25 && canvas.current.getZoom() >= 0.2) {
        //         obj.set({ opacity: 0.1 })
        //     } else if (canvas.current.getZoom() < 0.2) {
        //         obj.set({ opacity: 0 })
        //     }
        // } else if (obj?.name != "boundary") {
        //     obj.set({ opacity: 1 })
        // }

    });


    canvas?.current?.forEachObject(function (obj) {
      if (obj.name == "highlight_node" || obj.name == "short_path_node") {
          canvas.current.bringToFront(obj);
      }
    });

    bringFabricObjectsToFrontByName(canvas, "product");
    bringFabricObjectsToFrontByName(canvas, "location");
    bringFabricObjectsToFrontByName(canvas, "beacon");
    bringFabricObjectsToFrontByName(canvas, "amenity");
    bringFabricObjectsToFrontByName(canvas, "safety");
    bringFabricObjectsToFrontByName(canvas, "vertical");

    canvas.current.requestRenderAll();
    canvas.current.renderAll();
    // tracingLengthZoomLevel(canvas, zoom)
    // navigationPathZoomLevel(canvas, zoom)
}

export default handleMouseWheel;


export function triggerMouseWheelManually(canvas, locations) {
    const deltaY =  100; 
  
    const fakeEvent = {
      e: {
        deltaY,
        offsetX: canvas?.current?.width / 2,
        offsetY: canvas?.current?.height / 2,
        preventDefault: () => {}, 
      }
    };

    // setTimeout(() => {        
        handleMouseWheel(fakeEvent, canvas, false);
    // },1000)
  }