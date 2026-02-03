import { getPolygonVertices } from "./calculateDistance";

const updateText = (canvas, setTexts, postTexts, enc_id) => {
    let tempTexts = [];
    canvas.current.forEachObject(function (obj1) {
        if (obj1.name == "text") {
            let coords = obj1.getCoords();
            tempTexts.push({
                left: obj1.left,
                top: obj1.top,
                text: obj1.text,
                scaleX: obj1.scaleX,
                scaleY: obj1.scaleY,
                angle: obj1.angle,
                fontFamily: obj1.fontFamily,
                fill: obj1.fill,
                fontSize: obj1.fontSize,
                fontWeight: obj1.fontWeight,
                textAlign: obj1.textAlign,
                height: obj1.height,
                width: obj1.width
            });
            // obj1.setCoords();
            // let coords = obj1.getCoords();
            // console.log(coords, 'getCoords')
            // console.log({ x: obj1.left, y: obj1.top }, 'getCoords')
        }
    });
    console.log('updateText')
    setTexts(tempTexts);
    postTexts(tempTexts, enc_id);
};

const updateTracing = (canvas, setTracings, setTracingIntialValue, postTrasing, enc_id) => {
    let tmpTracings = [];
    canvas?.current?.forEachObject(function (obj1) {
        if (obj1.name == "tracing" && obj1.type === 'polygon') {
            var translatedPoints = getPolygonVertices(obj1);
            // console.log(translatedPoints, obj1)
            tmpTracings.push({
                vertices: translatedPoints,
                fill_color: obj1.fill,
                border_color: obj1.stroke,
                border_thick: obj1.strokeWidth
            });
        }
    });
    let activeObj = canvas?.current?.getActiveObject();
    if (activeObj?.name === 'tracing') {
        setTracingIntialValue({
            fill_color: activeObj?.fill,
            border_color: activeObj?.stroke,
            border_thick: activeObj?.strokeWidth
        });
    } else {
        // setTracingIntialValue(projectSettings);
    }
    console.log('updateTracing')
    setTracings(tmpTracings);
    // const BringToFrontInApp = tmpTracings.reverse()
    postTrasing(tmpTracings, enc_id);
};

const updateTracingCircle = (canvas, setTracingCircle, setTracingIntialValue, postTrasingCircle, enc_id) => {
    const tmpTracings = [];
    canvas?.current?.forEachObject(function (obj1) {
        if (obj1.name == "tracing" && obj1.type === 'circle') {
            var translatedPoints = { x: obj1.left, y: obj1.top };

            var radius = obj1.width / 2;
            console.log(obj1.scaleX, 'radius')
            tmpTracings.push({
                vertices: translatedPoints,
                fill_color: obj1.fill,
                border_color: obj1.stroke,
                border_thick: obj1.strokeWidth,
                radius: radius,
                scaleX: obj1?.scaleX ?? 1,
                scaleY: obj1?.scaleY ?? 1
            });
        }
    });
    let activeObj = canvas?.current?.getActiveObject();
    if (activeObj?.name === 'tracing') {
        setTracingIntialValue({
            fill_color: activeObj?.fill,
            border_color: activeObj?.stroke,
            border_thick: activeObj?.strokeWidth
        });
    } else {
        // setTracingIntialValue(projectSettings);
    }
    console.log('updateTracingCircle')
    setTracingCircle(tmpTracings);
    postTrasingCircle(tmpTracings, enc_id);
};

export { updateText, updateTracing, updateTracingCircle };
