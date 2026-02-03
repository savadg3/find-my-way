import Pencil from "../../../assets/icons/pencil.png";
import Eraser from "../../../assets/icons/erase-cursor-large.svg";
import PaintBucket from "../../../assets/icons/paint-cursor-large.svg";
import { HoverCursorChanger } from "./bringFabricObjects";

// const PaintBucket =
//   "data:image/svg+xml;base64," +
//   btoa(
//     `<svg id="b" xmlns="http://www.w3.org/2000/svg" width="11.436" height="11.3194" viewBox="0 0 11.436 11.3194"><defs><style>.d{stroke-miterlimit:10;}.d,.e{fill:none;}.d,.e,.f{stroke:#6a6d73;stroke-width:.25px;}.e{stroke-linecap:round;}.e,.f{stroke-miterlimit:10;}.g{fill:#fff;}.g,.h{stroke-width:0px;}.h,.f{fill:#a8abaf;}</style></defs><g id="c"><path class="g" d="M6.17.663l4.9187,4.9503c.2108.2121.2108.556,0,.7681l-3.7743,3.7986c-.2108.2121-.5525.2121-.7632,0L1.6325,5.2297c-.2108-.2121-.2108-.556,0-.7681L5.4067.663c.2108-.2121.5525-.2121.7632,0Z"/><rect class="h" x="7.3442" y="-.2496" width="1.4265" height="7.9824" transform="translate(-.2857 6.7933) rotate(-45)"/><rect class="h" x="6.405" y="1.0374" width=".7133" height="7.9824" transform="translate(-1.5753 6.254) rotate(-45)"/><rect class="d" x="3.2054" y="1.3474" width="6.3747" height="8.1468" rx=".521" ry=".521" transform="translate(-1.9607 6.108) rotate(-45)"/><line class="e" x1="5.9292" y1="2.7832" x2="8.5873" y2=".125"/><path class="f" d="M1.2583,7.5691c-.2059.3056-.6789,1.0317-.9625,1.6465-.2009.4355-.2997,1.2256.1379,1.6621.2656.2649.5822.3733,1.0526.2883.6042-.1092.9119-.6765.8422-1.1462-.0351-.2369-.1369-.4359-.3356-.7282-.6334-.9315-.5752-1.959-.7346-1.7225h0Z"/></g></svg>`
//   );
// const Eraser =
//   "data:image/svg+xml;base64," +
//   btoa(
//     `<svg id="b" xmlns="http://www.w3.org/2000/svg" width="11.8785" height="11.2763" viewBox="0 0 11.8785 11.2763"><defs><style>.d{fill:#f03528;}.d,.e{stroke-width:0px;}.e,.f{fill:#fff;}.f{stroke:#6a6d73;stroke-miterlimit:10;stroke-width:.25px;}</style></defs><g id="c"><path class="f" d="M6.5099,5.5497L.6467.2069C.4464.0244.1247.1668.125.4378l.0104,7.9323c.0003.2573.2945.4034.4997.2483l1.7533-1.3253,1.491,3.3698c.062.1402.2259.2036.3661.1415l1.3014-.5758c.1402-.062.2036-.2259.1415-.3661l-1.491-3.3698,2.16-.4061c.2528-.0475.3425-.3635.1524-.5368h0Z"/><circle class="d" cx="9.3491" cy="8.7469" r="2.5288"/><path class="e" d="M9.344,8.9888l1.0068,1.0047c.0249.0361.065.0559.1203.0592.0553.0034.0983-.0134.1288-.0503.0305-.0369.0457-.0785.0457-.1249,0-.0463-.015-.0875-.045-.1236l-1.0024-1.0116,1.0024-1.0193c.0248-.0249.0385-.0618.0412-.1108.0026-.049-.0114-.0902-.0419-.1237s-.0721-.0502-.1248-.0502c-.0528,0-.0942.015-.1243.045l-1.0024,1.0137-1.009-1.0137c-.0249-.03-.0637-.045-.1165-.045s-.0944.0167-.1249.0502-.0457.0738-.0457.1209.015.0858.0451.1158l1.0113,1.0216-1.0113,1.0047c-.0301.0308-.0451.0711-.0451.1208,0,.0498.0152.0914.0457.1249.0305.0387.0708.058.121.058.0501,0,.0902-.0206.1203-.0619,0,0,1.0045-1.0047,1.0045-1.0047Z"/></g></svg>`
//   );

const handleCursor = (activeTab, toolActive, canvas, panToolVariabl) => {
  if (panToolVariabl && activeTab === "floorDetails") {
    canvas.current.upperCanvasEl.hoverCursor = 'grab';
    canvas.current.upperCanvasEl.style.cursor = 'grab';
    canvas.current.renderAll();
    canvas.current.forEachObject(function (obj) {
      obj.hoverCursor = 'grab';
    });
    return;
  }
  if (activeTab === "floorDetails" && toolActive === "Draw") {
    canvas.current.upperCanvasEl.hoverCursor = `url(${Pencil}) 1 17, auto`;
    canvas.current.upperCanvasEl.style.cursor = `url(${Pencil}) 1 17, auto`;
    // canvas.current.defaultCursor = `url(${Pencil}) 1 17, auto`;
    canvas.current.renderAll();
  } else if (activeTab === "floorDetails" && toolActive === "Text") {
    canvas.current.upperCanvasEl.hoverCursor = "text";
    canvas.current.upperCanvasEl.style.cursor = "text";
    canvas.current.renderAll();
  } else if (activeTab === "floorDetails" && toolActive === "Fill") {
    canvas.current.upperCanvasEl.hoverCursor = `url(${PaintBucket}) 1 17, auto`;
    canvas.current.upperCanvasEl.style.cursor = `url(${PaintBucket}) 1 17, auto`;
    canvas.current.renderAll();
  } else if (activeTab === "floorDetails" && toolActive === "Erase") {
    canvas.current.upperCanvasEl.hoverCursor = `url(${Eraser}) 1 8, auto`;
    canvas.current.upperCanvasEl.style.cursor = `url(${Eraser}) 1 8, auto`;
    canvas.current.renderAll();
  } else if (
    activeTab === "floorDetails" &&
    ["Rectangle", "Circle", "Triangle"].includes(toolActive)
  ) {
    canvas.current.upperCanvasEl.hoverCursor = "crosshair";
    canvas.current.upperCanvasEl.style.cursor = "crosshair";
    canvas.current.renderAll();
  }
  else {
    canvas.current.hoverCursor = "auto";
  }
  canvas.current.forEachObject(function (obj) {
    if (activeTab === "floorDetails" && toolActive === "Draw") {
      obj.hoverCursor = `url(${Pencil}) 1 17, auto`;
    } else if (activeTab === "floorDetails" && toolActive === "Text") {
      obj.hoverCursor = "text";
    } else if (activeTab === "floorDetails" && toolActive === "Select") {
      obj.hoverCursor = "default";
    } else if (activeTab === "floorDetails" && toolActive === "Fill") {
      obj.hoverCursor = `url(${PaintBucket}) 1 17, auto`;
    } else if (activeTab === "floorDetails" && toolActive === "Erase") {
      obj.hoverCursor = `url(${Eraser}) 1 8, auto`;
    } else if (activeTab === "traversable" && toolActive === "Erase") {
      obj.hoverCursor = `url(${Eraser}) 1 8, auto`;
    }
  });
  if (activeTab === "traversable" && (toolActive === "Draw" || toolActive === 'sub_path')) {
    HoverCursorChanger(canvas, "grab", "product");
    HoverCursorChanger(canvas, "grab", "location");
    HoverCursorChanger(canvas, "grab", "beacon");
    HoverCursorChanger(canvas, "grab", "amenity");
    HoverCursorChanger(canvas, "grab", "safety");
    HoverCursorChanger(canvas, "grab", "vertical");
    HoverCursorChanger(canvas, "default", "tracing");
    HoverCursorChanger(canvas, "default", "text");
    HoverCursorChanger(canvas, "grab", "path");
    HoverCursorChanger(canvas, "grab", "node");
    HoverCursorChanger(canvas, "default", "boundary");
  } else if (activeTab === "traversable" && toolActive === "Select") {
    HoverCursorChanger(canvas, "grab", "path");
    HoverCursorChanger(canvas, "grab", "node");
  }
};
export default handleCursor;
