export const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// export const normalizeValue = (value, max, minRange, maxRange) => {
//     const minZoom = 0.1;
//     const maxZoom = 10;
//     const minLevel = 10;
//     const maxLevel = 1000;

//     const normalizedZoom = ((value - minLevel) / (maxLevel - minLevel)) * (maxZoom - minZoom) + minZoom;
//     return normalizedZoom.toFixed(2);
// };
export const normalizeValue = (zoomLevel) => {
    const minZoom = 0.1;
    const maxZoom = 10;
    const minLevel = 0; // Minimum zoom level (0%)
    const maxLevel = 1000; // Maximum zoom level (1000%)

    // Calculate the scaling factor to map zoomLevel to normalizedZoom
    const scaleFactor = (maxZoom - minZoom) / (maxLevel - minLevel);

    // Calculate the normalizedZoom
    const normalizedZoom = minZoom + ((zoomLevel - minLevel) * scaleFactor);

    return normalizedZoom.toFixed(2); // Fixed to two decimal places
};

export const isInsideRadius = (point1, point2, radius = 5) => {
    const dx = point1?.x - point2?.x;
    const dy = point1?.y - point2?.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius;
};

export const getPolygonVertices = (polygon) => {
    let matrix = [];
    matrix = polygon.calcTransformMatrix();

    let translatedPoints = polygon.get("points").map(function (p) {
        return {
            x: p.x - polygon.pathOffset?.x,
            y: p.y - polygon.pathOffset?.y
        };
    });
    for (var i = 0; i < translatedPoints.length; i++) {
        translatedPoints[i].x =
            matrix[0] * translatedPoints[i].x +
            matrix[2] * translatedPoints[i].y +
            matrix[4];
        translatedPoints[i].y =
            matrix[1] * translatedPoints[i].x +
            matrix[3] * translatedPoints[i].y +
            matrix[5];
    }
    return translatedPoints;
};

export const removeDuplicatePoints = (points) => {
    const uniquePoints = points.filter((point, index, self) =>
        index === self.findIndex((p) => (
            p.x === point.x && p.y === point.y
        ))
    );
    return uniquePoints;
}

export const getRectangleVertices = (polyObj, obj, resizeScale) => {
    const width = polyObj.width;
    const height = polyObj.height;
    const strokeWidth = polyObj.strokeWidth ?? 0;

    // Compute the rectangle's transformation matrix
    const transformMatrix = polyObj.calcTransformMatrix();

    // Apply the transformation matrix to determine the new position
    const transformedLeft = transformMatrix[4] + obj.width / 2;
    const transformedTop = transformMatrix[5] + obj.height / 2;

    const angle = fabric.util.degreesToRadians(polyObj.angle || 0);

    // Center of the rectangle (considering transformations)
    const centerX = transformedLeft + width / 2;
    const centerY = transformedTop + height / 2;

    // Vertices relative to the center
    const rectPoints = [
        { x: -width / 2, y: -height / 2 },
        { x: width / 2, y: -height / 2 },
        { x: width / 2, y: height / 2 },
        { x: -width / 2, y: height / 2 }
    ];

    // Rotate and translate each vertex using the transformation matrix
    const rotatedPoints = rectPoints.map(point => {
        const x = point.x;
        const y = point.y;
        const transformedX = x * transformMatrix[0] + y * transformMatrix[2] + transformMatrix[4];
        const transformedY = x * transformMatrix[1] + y * transformMatrix[3] + transformMatrix[5];
        return {
            x: parseFloat((transformedX + strokeWidth / 2)),
            y: parseFloat((transformedY + strokeWidth / 2))
        };
    });

    return rotatedPoints;
};

export const scaleVertices = (vertices, scale) => {
    return vertices.map(vertex => ({
        x: vertex.x * scale,
        y: vertex.y * scale
    }));
};

export const getSquareCoordinates = (centerX, centerY, sideLength) => {
    const halfSide = sideLength / 2;

    const topLeftX = centerX - halfSide;
    const topLeftY = centerY - halfSide;

    const topRightX = centerX + halfSide;
    const topRightY = centerY - halfSide;

    const bottomLeftX = centerX - halfSide;
    const bottomLeftY = centerY + halfSide;

    const bottomRightX = centerX + halfSide;
    const bottomRightY = centerY + halfSide;
    return [
        { x: topLeftX, y: topLeftY },
        { x: topRightX, y: topRightY },
        { x: bottomRightX, y: bottomRightY },
        { x: bottomLeftX, y: bottomLeftY }
    ];
}

export const hexToRgb = (hex) => {
    hex = hex?.replace(/^#/, "");
    const r = parseInt(hex?.slice(0, 2), 16);
    const g = parseInt(hex?.slice(2, 4), 16);
    const b = parseInt(hex?.slice(4, 6), 16);
    const a = hex?.slice(6, 8);
    if (a) {
        var o = parseInt(hex?.slice(6, 8), 16) / 255;
    }
    return `rgba(${r}, ${g}, ${b}, ${o ? o.toFixed(2) : 0.4})`;
};

export const getObjectSizeWithStroke = (object) => {
    var stroke = new fabric.Point(
        object.strokeUniform ? 1 / object.scaleX : 1,
        object.strokeUniform ? 1 / object.scaleY : 1
    ).multiply(object.strokeWidth);
    return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
}

export const hasDuplicates = (obj) => {
    const values = Object.values(obj); // Extract the values from the object
    const uniqueValues = new Set(values); // Create a set from the values
    return values.length !== uniqueValues.size; // Compare the size of the set to the array length
}

export const getTypeByName = (obj) => {
    switch (obj?.name) {
        case 'location':
            return 1;
        case 'product':
            return 2;
        case 'beacon':
            return 3;
        case 'amenity':
            return 4;
        case 'safety':
            return 5;
        case 'vertical':
            return 6;
        default:
            return null;
    }
}
export const getLineVertices = (line) => {
     // Get the line's start and end points
     let startPoint = new fabric.Point(line.x1, line.y1);
     let endPoint = new fabric.Point(line.x2, line.y2);
 
     // Compose the transformation matrix manually using Fabric.js utilities
     let matrix = fabric.util.composeMatrix({
         translateX: line.left,
         translateY: line.top,
         scaleX: line.scaleX,
         scaleY: line.scaleY,
         angle: line.angle,
         skewX: line.skewX,
         skewY: line.skewY,
         originX: line.originX,
         originY: line.originY
     });
 
     // If the line is added to a canvas, multiply by the canvas transformation matrix
     if (line.canvas) {
         matrix = fabric.util.multiplyTransformMatrices(line.canvas.viewportTransform, matrix);
     }
 
     // Apply the transformation matrix to the start and end points
     let transformedStart = fabric.util.transformPoint(startPoint, matrix);
     let transformedEnd = fabric.util.transformPoint(endPoint, matrix);
 
     // Return an array with the transformed start and end points
     return [transformedStart, transformedEnd];
};

export const adjustPositionIfNeeded =  (positions, newPosition, pointA, pointB) => {
    // Threshold distance to detect overlap
    const threshold = 1;
  
    // Filter positions to exclude keys with underscores
    const filteredPositions = Object.entries(positions).filter(([key]) => !key.includes("_"));
  
    let adjustedPosition = { ...newPosition };
  
    // Function to calculate distance between two points
    const getDistance = (pos1, pos2) => {
      return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    };
  
    // Function to project a point onto the line between pointA and pointB
    const projectToLine = (point, pointA, pointB) => {
      const dx = pointB.x - pointA.x;
      const dy = pointB.y - pointA.y;
      const t = ((point.x - pointA.x) * dx + (point.y - pointA.y) * dy) / (dx * dx + dy * dy);
      
      // t represents the interpolation factor along the line. Clamp it to stay within pointA and pointB.
        const clampedT = Math.max(0, Math.min(1, t));
        const pointItem = {
            x: pointA.x + clampedT * dx,
            y: pointA.y + clampedT * dy
            };
  
      const projectedPoint = {
        x: pointA.x + clampedT * dx,
        y: pointA.y + clampedT * dy
        };
        
       
  
      // Check if the projected point is equal to the input point, if so, adjust slightly
      if (getDistance(point, projectedPoint) < threshold) {
  
        const directionVector = {
          x: pointB.x - pointA.x,
          y: pointB.y - pointA.y
        };
        const length = getDistance(pointA, pointB);
  
        // Normalize the direction vector
        const normalizedDirection = {
          x: directionVector.x / length,
          y: directionVector.y / length
        };
          
        let addedAdjustment = {
            x: pointA.x + clampedT * dx,
            y: pointA.y + clampedT * dy
         };
        let substractededAdjustment = {
            x: pointA.x + clampedT * dx,
            y: pointA.y + clampedT * dy
         };
      
  
        // Adjust the position slightly along the line
        
        // projectedPoint.x += normalizedDirection.x * (threshold + 0.1);
          // projectedPoint.y += normalizedDirection.y * (threshold + 0.1);
          
          
        addedAdjustment.x += normalizedDirection.x * (threshold + 1);
        addedAdjustment.y += normalizedDirection.y * (threshold + 1);
        
        substractededAdjustment.x -= normalizedDirection.x * (threshold + 1);
        substractededAdjustment.y -= normalizedDirection.y * (threshold + 1);

          if (pointItem.x > addedAdjustment.x && pointItem.y > addedAdjustment.y) {
            projectedPoint.x = addedAdjustment.x;
            projectedPoint.y = addedAdjustment.y;
        } else if(pointB.x < addedAdjustment.x && pointB.y < addedAdjustment.y){
            projectedPoint.x = substractededAdjustment.x;
            projectedPoint.y = substractededAdjustment.y;
        } else {
            projectedPoint.x = addedAdjustment.x;
            projectedPoint.y = addedAdjustment.y;
        }
          
        // console.log(pointA,pointB,projectedPoint,addedAdjustment,substractededAdjustment,"Position overlaps, adjusting it slightly.");
          
      }
//   console.log(point,projectedPoint,"point")
      return projectedPoint;
    };
  
    // Project the initial newPosition onto the line
    adjustedPosition = projectToLine(newPosition, pointA, pointB);
  
    let overlapDetected = true;
    let iterations = 0; // Safeguard for potential infinite loops
    const maxIterations = 100; // Maximum allowed iterations to prevent infinite loop
  
    // Keep adjusting the position until no overlap is detected
    while (overlapDetected && iterations < maxIterations) {
      overlapDetected = false; // Reset the flag
      iterations++; // Increment the iteration counter
  
      for (const [key, pos] of filteredPositions) {
        const distance = getDistance(pos, adjustedPosition);
  
        // If the adjusted position is within the threshold distance, adjust it
        if (distance < threshold) {
          overlapDetected = true; // Mark that an overlap was detected
  
          // Project the position onto the line and adjust it slightly if necessary
          adjustedPosition = projectToLine(adjustedPosition, pointA, pointB);
  
          break; // Exit the inner loop to check for overlaps again with the new adjusted position
        }
      }
    }
  
    // If max iterations were reached, log an error (optional)
    if (iterations >= maxIterations) {
      console.error("Max iterations reached. Could not find a non-overlapping position.");
    }
  
    // If no more overlap is detected, return the adjusted position
    return adjustedPosition;
  };