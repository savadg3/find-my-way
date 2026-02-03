import { fabric } from 'fabric';

export const anchorWrapper = (anchorIndex, fn) => (eventData, transform, x, y) => {
    const fabricObject = transform.target;
    const absolutePoint = fabric.util.transformPoint(
        {
            x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
            y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y
        },
        fabricObject.calcTransformMatrix()
    );

    const actionPerformed = fn(eventData, transform, x, y);
    const newDim = fabricObject._setPositionDimensions({});
    const polygonBaseSize = getObjectSizeWithStroke(fabricObject);
    const newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x;
    const newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;

    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
    return actionPerformed;
};

function getObjectSizeWithStroke(object) {
    var stroke = new fabric.Point(
        object.strokeUniform ? 1 / object.scaleX : 1,
        object.strokeUniform ? 1 / object.scaleY : 1
    ).multiply(object.strokeWidth);
    return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
}