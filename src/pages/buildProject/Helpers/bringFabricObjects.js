const bringFabricObjectsToFrontByName = (canvas, name) => {
    canvas?.current?.forEachObject(function (obj) {
        if (obj?.name == name) {
            canvas.current?.bringToFront(obj);
        }
    });
};

const bringToFrontPinNameNodes = (canvas, name) => {
    canvas?.current?.forEachObject(function (obj) {
        if (obj.name == 'node' && obj?.id == name) {
            canvas.current.bringToFront(obj);
        }
    });
};

const sendToBackObjects = (canvas, name) => {
    canvas.current.forEachObject(function (obj) {
        if (obj.name == name) {
            canvas.current.sendToBack(obj);
        }
    });
};

const removeFabricObjectsByName = (canvas, name) => {
    canvas?.current?.forEachObject(function (obj) {
        if (obj.name == name) {
            canvas.current.remove(obj);
        }
    });
};

const removeFabricObjectsBId = (canvas, id) => {
    canvas.current.forEachObject(function (obj) {
        if (obj.id == id && obj.id) {
            // console.log(obj, 'remove')
            canvas.current.remove(obj);
        }
    });
};

const removeFabricObjectsEncId = (canvas, id, name) => {
    canvas.current.forEachObject(function (obj) {
        if (obj.enc_id == id && obj?.name == name) {
            canvas.current.remove(obj);
        }
    });
};

const HoverCursorChanger = (canvas, cursor, name) => {
    canvas.current?.forEachObject((obj) => {
        if (obj.name == name && obj?.types !== "text_field") {
            obj.hoverCursor = cursor;
        }
    });
};

const changeSelectionAllObjs = (canvas, value, name) => {
    canvas.current?.forEachObject(function (o) {
        if (o.name == name) {
            o.selectable = value;
        }
    });
};

const changeFabricObjectSelectionByName = (canvas, name, state) => {
    canvas.current.forEachObject(function (obj) {
        if (obj.name == name) {
            obj.selectable = state;
            obj.hasBorders = false;
            obj.hasControls = false;
        }
    });
    canvas.current.renderAll();
};

const changePropertyById = (value, property, id, canvas) => {

    canvas.current?.forEachObject(function (o) {
        if (o.id == id) {
            o[property] = value;
        }
    });
};

const getFabricObject = (value, type, canvas) => {
    let obj;
    canvas.current?.forEachObject(function (o) {
        if (o[type] == value) {
            obj = o;
        }
    });
    return obj;
};

const findObjectById = (id, canvas, objectArray) => {
    let foundObject = null;
    canvas.current?.forEachObject(function (o) {
        if (o.id == id) {
            foundObject = o;
            return;
        }
    });
    return foundObject;
};

const findPinNameGroup = (canvas, id, name) => {
    let foundObject = null;
    canvas.current?.forEachObject(function (o) {
        if (o?.types == 'text_field' && o?.enc_id == id && o?.name === name) {
            foundObject = o;
            return;
        }
    });
    return foundObject;
};

const findObjectByEnc_id = (id, name, canvas) => {
    let foundObject = null;
    canvas.current?.forEachObject(function (o) {
        if (o.enc_id == id && o?.name == name) {
            foundObject = o;
            return;
        }
    });
    return foundObject;
};

const reinitializeFabricCanvas = (canvas) => {
    removeFabricObjectsByName(canvas, "tracing");
    removeFabricObjectsByName(canvas, "text");
    removeFabricObjectsByName(canvas, "product");
    removeFabricObjectsByName(canvas, "location");
    removeFabricObjectsByName(canvas, "boundary");
    removeFabricObjectsByName(canvas, "amenity");
    removeFabricObjectsByName(canvas, "beacon");
    removeFabricObjectsByName(canvas, "safety");
    removeFabricObjectsByName(canvas, "safety");
    removeFabricObjectsByName(canvas, "vertical");
    removeFabricObjectsBId(canvas, "short_path");
    localStorage.removeItem("shortestPath")
};

const changeSelectionById = (value, id, canvas) => {
    canvas.current?.forEachObject(function (o) {
        if (o.id == id) {
            o.selectable = value;
        }
    });
    canvas.current.renderAll()
};

export {
    bringFabricObjectsToFrontByName,
    bringToFrontPinNameNodes,
    sendToBackObjects,
    removeFabricObjectsByName,
    removeFabricObjectsBId,
    HoverCursorChanger,
    changeSelectionAllObjs,
    changeFabricObjectSelectionByName,
    removeFabricObjectsEncId,
    reinitializeFabricCanvas,
    changePropertyById,
    getFabricObject,
    findObjectById,
    findPinNameGroup,
    changeSelectionById,
    findObjectByEnc_id
};