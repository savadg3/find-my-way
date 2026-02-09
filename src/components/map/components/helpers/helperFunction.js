 
export const extractPolygonsFromSVG = async (svgFile) => {
  const defaultOptions = {
    scaleX: 0.001, 
    scaleY: 0.001, 
    offsetX: 75.7804, 
    offsetY: 11.2588, 
    flipY: true, 
    precision: 8,
    floorId: 0,
    defaultFill: '#dbeafe', 
    defaultStroke: '#3b82f6' 
  };

  const opts = { ...defaultOptions };
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const svgString = event.target.result;
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        
        if (svgElement.tagName.toLowerCase() !== 'svg') {
          reject(new Error('Invalid SVG file'));
          return;
        }
 
        const viewBox = svgElement.getAttribute('viewBox');
        let svgWidth, svgHeight, svgX, svgY;
        
        if (viewBox) {
          [svgX, svgY, svgWidth, svgHeight] = viewBox.split(' ').map(parseFloat);
        } else {
          svgX = 0;
          svgY = 0;
          svgWidth = parseFloat(svgElement.getAttribute('width')) || 1000;
          svgHeight = parseFloat(svgElement.getAttribute('height')) || 1000;
        } 
        const features = [];
        let featureIndex = 0;
         
        const groupElements = svgDoc.querySelectorAll('g');
        groupElements.forEach((group) => {
          const groupFeatures = parseGroupElement(group, svgX, svgY, svgWidth, svgHeight, opts, featureIndex);
          features.push(...groupFeatures);
          featureIndex += groupFeatures.length;
        });
 
        const elementsOutsideGroups = Array.from(svgElement.children).filter(el => el.tagName.toLowerCase() !== 'g');
        
        elementsOutsideGroups.forEach((element) => {
          const feature = parseSVGElement(element, svgX, svgY, svgWidth, svgHeight, opts, featureIndex);
          if (feature) {
            features.push(feature);
            featureIndex++;
          }
        }); 

        const geoJSON = {
          type: 'FeatureCollection',
          features: features
        }; 
        resolve(geoJSON);
        
      } catch (error) {
        console.error('Error extracting features from SVG:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read SVG file'));
    reader.readAsText(svgFile);
  });
};
 
const parseSVGElement = (element, svgX, svgY, svgWidth, svgHeight, options, index) => {
  const tagName = element.tagName.toLowerCase();
  
  switch (tagName) {
    case 'polygon':
      return parsePolygonElement(element, svgX, svgY, svgWidth, svgHeight, options, index);
    case 'rect':
      return parseRectAsPolygon(element, svgX, svgY, svgWidth, svgHeight, options, index);
    case 'circle':
      return parseCircleElement(element, svgX, svgY, svgWidth, svgHeight, options, index);
    case 'ellipse':
      return parseEllipseElement(element, svgX, svgY, svgWidth, svgHeight, options, index);
    case 'path':
      return parsePathElement(element, svgX, svgY, svgWidth, svgHeight, options, index);
    case 'line':
      return parseLineElement(element, svgX, svgY, svgWidth, svgHeight, options, index);
    case 'polyline':
      return parsePolylineElement(element, svgX, svgY, svgWidth, svgHeight, options, index);
    case 'text':
      return parseTextElement(element, svgX, svgY, svgWidth, svgHeight, options, index);
    default:
      return null;
  }
};
 
const parseGroupElement = (group, svgX, svgY, svgWidth, svgHeight, options, startIndex) => {
  const features = [];
  let index = startIndex;
   
  const groupTransform = group.getAttribute('transform') || '';
  const groupFill = group.getAttribute('fill');
  const groupStroke = group.getAttribute('stroke');
  const groupOpacity = group.getAttribute('opacity');
   
  Array.from(group.children).forEach((child) => {
    if (child.tagName.toLowerCase() === 'g') { 
      const childFeatures = parseGroupElement(child, svgX, svgY, svgWidth, svgHeight, options, index);
      features.push(...childFeatures);
      index += childFeatures.length;
    } else {
      const feature = parseSVGElement(child, svgX, svgY, svgWidth, svgHeight, options, index);
      if (feature) { 
        if (groupFill && !child.getAttribute('fill')) {
          feature.properties.fill = groupFill;
        }
        if (groupStroke && !child.getAttribute('stroke')) {
          feature.properties.stroke = groupStroke;
        }
        if (groupOpacity && !child.getAttribute('opacity')) {
          feature.properties.opacity = parseFloat(groupOpacity);
        }
         
        feature.properties.groupTransform = groupTransform;
        feature.properties.groupId = group.getAttribute('id') || `group_${index}`;
        
        features.push(feature);
        index++;
      }
    }
  });
  
  return features;
};
 
const parsePolygonElement = (polygon, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const pointsAttr = polygon.getAttribute('points');
    if (!pointsAttr) return null;
     
    const points = pointsAttr.trim().split(/\s+/).map(pair => {
      const [x, y] = pair.split(',').map(parseFloat);
      return [x, y];
    });
    
    if (points.length < 3) return null;
 
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      points.push([firstPoint[0], firstPoint[1]]);
    }
 
    const coordinates = points.map(([x, y]) => {
      return convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);
    });
 
    const fill = polygon.getAttribute('fill') || options.defaultFill;
    const stroke = polygon.getAttribute('stroke') || options.defaultStroke;
    const strokeWidth = parseFloat(polygon.getAttribute('stroke-width')) || 2;
    const opacity = parseFloat(polygon.getAttribute('opacity')) || parseFloat(polygon.getAttribute('fill-opacity')) || 0.5;

    return {
      type: 'Feature',
      properties: {
        id: `polygon_${index}_${Date.now()}`,
        type: 'room',
        category: 'polygon',
        name: polygon.getAttribute('id') || polygon.getAttribute('class') || `Polygon ${index}`,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        opacity: opacity,
        floor: options.floorId,
        source: 'svg_polygon',
        vertices: points.length
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  } catch (error) {
    console.warn(`Error parsing polygon ${index}:`, error);
    return null;
  }
};
 
const parseCircleElement = (circle, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const cx = parseFloat(circle.getAttribute('cx')) || 0;
    const cy = parseFloat(circle.getAttribute('cy')) || 0;
    const r = parseFloat(circle.getAttribute('r')) || 0;
    
    if (r === 0) return null;
     
    const segments = 32;
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      points.push([x, y]);
    }
 
    const coordinates = points.map(([x, y]) => {
      return convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);
    });

    const fill = circle.getAttribute('fill') || options.defaultFill;
    const stroke = circle.getAttribute('stroke') || options.defaultStroke;
    const strokeWidth = parseFloat(circle.getAttribute('stroke-width')) || 2;

    return {
      type: 'Feature',
      properties: {
        id: `circle_${index}_${Date.now()}`,
        type: 'circle',
        category: 'circle',
        name: circle.getAttribute('id') || `Circle ${index}`,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        radius: r,
        center: convertSVGToGeo(cx, cy, svgX, svgY, svgWidth, svgHeight, options),
        floor: options.floorId,
        source: 'svg_circle'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  } catch (error) {
    console.warn(`Error parsing circle ${index}:`, error);
    return null;
  }
};
 
const parseEllipseElement = (ellipse, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const cx = parseFloat(ellipse.getAttribute('cx')) || 0;
    const cy = parseFloat(ellipse.getAttribute('cy')) || 0;
    const rx = parseFloat(ellipse.getAttribute('rx')) || 0;
    const ry = parseFloat(ellipse.getAttribute('ry')) || 0;
    
    if (rx === 0 || ry === 0) return null;
     
    const segments = 32;
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = cx + Math.cos(angle) * rx;
      const y = cy + Math.sin(angle) * ry;
      points.push([x, y]);
    }

    const coordinates = points.map(([x, y]) => {
      return convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);
    });

    const fill = ellipse.getAttribute('fill') || options.defaultFill;
    const stroke = ellipse.getAttribute('stroke') || options.defaultStroke;
    const strokeWidth = parseFloat(ellipse.getAttribute('stroke-width')) || 2;

    return {
      type: 'Feature',
      properties: {
        id: `ellipse_${index}_${Date.now()}`,
        type: 'ellipse',
        category: 'ellipse',
        name: ellipse.getAttribute('id') || `Ellipse ${index}`,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        radiusX: rx,
        radiusY: ry,
        center: convertSVGToGeo(cx, cy, svgX, svgY, svgWidth, svgHeight, options),
        floor: options.floorId,
        source: 'svg_ellipse'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  } catch (error) {
    console.warn(`Error parsing ellipse ${index}:`, error);
    return null;
  }
};
 
const parsePathElement = (path, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const d = path.getAttribute('d');
    if (!d) return null;
     
    const isClosed = d.trim().endsWith('Z') || d.trim().endsWith('z');
    if (!isClosed) return null;
     
    const points = extractSimplePathPoints(d);
    if (points.length < 3) return null;
 
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      points.push([firstPoint[0], firstPoint[1]]);
    }

    const coordinates = points.map(([x, y]) => {
      return convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);
    });

    const fill = path.getAttribute('fill') || options.defaultFill;
    const stroke = path.getAttribute('stroke') || options.defaultStroke;
    const strokeWidth = parseFloat(path.getAttribute('stroke-width')) || 2;

    return {
      type: 'Feature',
      properties: {
        id: `path_${index}_${Date.now()}`,
        type: 'room',
        category: 'path',
        name: path.getAttribute('id') || `Path ${index}`,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        floor: options.floorId,
        source: 'svg_path',
        originalD: d
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  } catch (error) {
    console.warn(`Error parsing path ${index}:`, error);
    return null;
  }
};
 
const parseLineElement = (line, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const x1 = parseFloat(line.getAttribute('x1')) || 0;
    const y1 = parseFloat(line.getAttribute('y1')) || 0;
    const x2 = parseFloat(line.getAttribute('x2')) || 0;
    const y2 = parseFloat(line.getAttribute('y2')) || 0;
    
    const points = [
      [x1, y1],
      [x2, y2]
    ];

    const coordinates = points.map(([x, y]) => {
      return convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);
    });

    const stroke = line.getAttribute('stroke') || options.defaultStroke;
    const strokeWidth = parseFloat(line.getAttribute('stroke-width')) || 2;

    return {
      type: 'Feature',
      properties: {
        id: `line_${index}_${Date.now()}`,
        type: 'wall',
        category: 'line',
        name: line.getAttribute('id') || `Line ${index}`,
        stroke: stroke,
        strokeWidth: strokeWidth,
        floor: options.floorId,
        source: 'svg_line'
      },
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    };
  } catch (error) {
    console.warn(`Error parsing line ${index}:`, error);
    return null;
  }
};
 
const parsePolylineElement = (polyline, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const pointsAttr = polyline.getAttribute('points');
    if (!pointsAttr) return null;
    
    const points = pointsAttr.trim().split(/\s+/).map(pair => {
      const [x, y] = pair.split(',').map(parseFloat);
      return [x, y];
    });
    
    if (points.length < 2) return null;

    const coordinates = points.map(([x, y]) => {
      return convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);
    });

    const stroke = polyline.getAttribute('stroke') || options.defaultStroke;
    const strokeWidth = parseFloat(polyline.getAttribute('stroke-width')) || 2;
    const fill = polyline.getAttribute('fill') || 'none';

    return {
      type: 'Feature',
      properties: {
        id: `polyline_${index}_${Date.now()}`,
        type: 'line',
        category: 'polyline',
        name: polyline.getAttribute('id') || `Polyline ${index}`,
        stroke: stroke,
        strokeWidth: strokeWidth,
        fill: fill,
        floor: options.floorId,
        source: 'svg_polyline'
      },
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    };
  } catch (error) {
    console.warn(`Error parsing polyline ${index}:`, error);
    return null;
  }
};
 
const parseTextElement = (text, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const x = parseFloat(text.getAttribute('x')) || 0;
    const y = parseFloat(text.getAttribute('y')) || 0;
    const textContent = text.textContent || '';
    
    if (!textContent.trim()) return null;

    const coordinate = convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);

    const fill = text.getAttribute('fill') || '#000000';
    const fontSize = parseFloat(text.getAttribute('font-size')) || 12;

    return {
      type: 'Feature',
      properties: {
        id: `text_${index}_${Date.now()}`,
        type: 'label',
        category: 'text',
        title: textContent.trim(),
        name: text.getAttribute('id') || `Text ${index}`,
        fill: fill,
        fontSize: fontSize,
        fontFamily: text.getAttribute('font-family') || 'Arial',
        floor: options.floorId,
        source: 'svg_text'
      },
      geometry: {
        type: 'Point',
        coordinates: coordinate
      }
    };
  } catch (error) {
    console.warn(`Error parsing text ${index}:`, error);
    return null;
  }
};
 
const convertSVGToGeo = (x, y, svgX, svgY, svgWidth, svgHeight, options) => {
  const normalizedX = (x - svgX) / svgWidth;
  const normalizedY = (y - svgY) / svgHeight;
  
  const finalY = options.flipY ? (1 - normalizedY) : normalizedY;
  
  const geoX = options.offsetX + (normalizedX - 0.5) * options.scaleX;
  const geoY = options.offsetY + (finalY - 0.5) * options.scaleY;
  
  return [
    parseFloat(geoX.toFixed(options.precision)),
    parseFloat(geoY.toFixed(options.precision))
  ];
};

const extractSimplePathPoints = (d) => {
  if (!d) return [];
  
  const points = [];
  const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/gi) || [];
  
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  
  commands.forEach(cmd => {
    const command = cmd[0];
    const isRelative = command === command.toLowerCase();
    const commandUpper = command.toUpperCase();
    
    const argsString = cmd.slice(1).trim();
    const args = argsString
      .replace(/,/g, ' ')
      .replace(/-/g, ' -')
      .split(/\s+/)
      .filter(Boolean)
      .map(parseFloat);
    
    switch (commandUpper) {
      case 'M':
        if (isRelative) {
          currentX += args[0] || 0;
          currentY += args[1] || 0;
        } else {
          currentX = args[0] || 0;
          currentY = args[1] || 0;
        }
        startX = currentX;
        startY = currentY;
        points.push([currentX, currentY]);
        
        for (let i = 2; i < args.length; i += 2) {
          if (isRelative) {
            currentX += args[i] || 0;
            currentY += args[i + 1] || 0;
          } else {
            currentX = args[i] || 0;
            currentY = args[i + 1] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'L': 
        for (let i = 0; i < args.length; i += 2) {
          if (isRelative) {
            currentX += args[i] || 0;
            currentY += args[i + 1] || 0;
          } else {
            currentX = args[i] || 0;
            currentY = args[i + 1] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'H':
        for (let i = 0; i < args.length; i++) {
          if (isRelative) {
            currentX += args[i] || 0;
          } else {
            currentX = args[i] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'V':
        for (let i = 0; i < args.length; i++) {
          if (isRelative) {
            currentY += args[i] || 0;
          } else {
            currentY = args[i] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'C':
        for (let i = 0; i < args.length; i += 6) {
          if (isRelative) {
            currentX += args[i + 4] || 0;
            currentY += args[i + 5] || 0;
          } else {
            currentX = args[i + 4] || 0;
            currentY = args[i + 5] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'S':
        for (let i = 0; i < args.length; i += 4) {
          if (isRelative) {
            currentX += args[i + 2] || 0;
            currentY += args[i + 3] || 0;
          } else {
            currentX = args[i + 2] || 0;
            currentY = args[i + 3] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'Q':
        for (let i = 0; i < args.length; i += 4) {
          if (isRelative) {
            currentX += args[i + 2] || 0;
            currentY += args[i + 3] || 0;
          } else {
            currentX = args[i + 2] || 0;
            currentY = args[i + 3] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'T':
        for (let i = 0; i < args.length; i += 2) {
          if (isRelative) {
            currentX += args[i] || 0;
            currentY += args[i + 1] || 0;
          } else {
            currentX = args[i] || 0;
            currentY = args[i + 1] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'A':
        for (let i = 0; i < args.length; i += 7) {
          if (isRelative) {
            currentX += args[i + 5] || 0;
            currentY += args[i + 6] || 0;
          } else {
            currentX = args[i + 5] || 0;
            currentY = args[i + 6] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'Z':
        if (points.length > 0) {
          if (currentX !== startX || currentY !== startY) {
            points.push([startX, startY]);
            currentX = startX;
            currentY = startY;
          }
        }
        break;
    }
  });
  
  return points;
};

const extractPathPointsWithCurves = (d, curveSegments = 10) => {
  if (!d) return [];
  
  const points = [];
  const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/gi) || [];
  
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  let lastControlX = 0;
  let lastControlY = 0;
  
  const cubicBezier = (t, p0, p1, p2, p3) => {
    const oneMinusT = 1 - t;
    return (
      Math.pow(oneMinusT, 3) * p0 +
      3 * Math.pow(oneMinusT, 2) * t * p1 +
      3 * oneMinusT * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3
    );
  };
  
  commands.forEach(cmd => {
    const command = cmd[0];
    const isRelative = command === command.toLowerCase();
    const commandUpper = command.toUpperCase();
    
    const argsString = cmd.slice(1).trim();
    const args = argsString
      .replace(/,/g, ' ')
      .replace(/-/g, ' -')
      .split(/\s+/)
      .filter(Boolean)
      .map(parseFloat);
    
    switch (commandUpper) {
      case 'M':
        if (isRelative) {
          currentX += args[0] || 0;
          currentY += args[1] || 0;
        } else {
          currentX = args[0] || 0;
          currentY = args[1] || 0;
        }
        startX = currentX;
        startY = currentY;
        points.push([currentX, currentY]);
        
        for (let i = 2; i < args.length; i += 2) {
          if (isRelative) {
            currentX += args[i] || 0;
            currentY += args[i + 1] || 0;
          } else {
            currentX = args[i] || 0;
            currentY = args[i + 1] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'L':
        for (let i = 0; i < args.length; i += 2) {
          if (isRelative) {
            currentX += args[i] || 0;
            currentY += args[i + 1] || 0;
          } else {
            currentX = args[i] || 0;
            currentY = args[i + 1] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'H':
        for (let i = 0; i < args.length; i++) {
          if (isRelative) {
            currentX += args[i] || 0;
          } else {
            currentX = args[i] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'V':
        for (let i = 0; i < args.length; i++) {
          if (isRelative) {
            currentY += args[i] || 0;
          } else {
            currentY = args[i] || 0;
          }
          points.push([currentX, currentY]);
        }
        break;
        
      case 'C': 
        for (let i = 0; i < args.length; i += 6) {
          const x1 = isRelative ? currentX + (args[i] || 0) : (args[i] || 0);
          const y1 = isRelative ? currentY + (args[i + 1] || 0) : (args[i + 1] || 0);
          const x2 = isRelative ? currentX + (args[i + 2] || 0) : (args[i + 2] || 0);
          const y2 = isRelative ? currentY + (args[i + 3] || 0) : (args[i + 3] || 0);
          const x = isRelative ? currentX + (args[i + 4] || 0) : (args[i + 4] || 0);
          const y = isRelative ? currentY + (args[i + 5] || 0) : (args[i + 5] || 0);
          
          for (let j = 1; j <= curveSegments; j++) {
            const t = j / curveSegments;
            const px = cubicBezier(t, currentX, x1, x2, x);
            const py = cubicBezier(t, currentY, y1, y2, y);
            points.push([px, py]);
          }
          
          lastControlX = x2;
          lastControlY = y2;
          currentX = x;
          currentY = y;
        }
        break;
        
      case 'S':
        for (let i = 0; i < args.length; i += 4) {
          const x2 = isRelative ? currentX + (args[i] || 0) : (args[i] || 0);
          const y2 = isRelative ? currentY + (args[i + 1] || 0) : (args[i + 1] || 0);
          const x = isRelative ? currentX + (args[i + 2] || 0) : (args[i + 2] || 0);
          const y = isRelative ? currentY + (args[i + 3] || 0) : (args[i + 3] || 0);
          
          const x1 = 2 * currentX - lastControlX;
          const y1 = 2 * currentY - lastControlY;
          
          for (let j = 1; j <= curveSegments; j++) {
            const t = j / curveSegments;
            const px = cubicBezier(t, currentX, x1, x2, x);
            const py = cubicBezier(t, currentY, y1, y2, y);
            points.push([px, py]);
          }
          
          lastControlX = x2;
          lastControlY = y2;
          currentX = x;
          currentY = y;
        }
        break;
        
      case 'Z':
        if (points.length > 0 && (currentX !== startX || currentY !== startY)) {
          points.push([startX, startY]);
          currentX = startX;
          currentY = startY;
        }
        break;
    }
  });
  
  return points;
};

const getFeatureBounds = (feature) => {
  if (feature.geometry.type === 'Polygon') {
    const coords = feature.geometry.coordinates[0];
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats)
    };
  } else if (feature.geometry.type === 'LineString') {
    const coords = feature.geometry.coordinates;
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats)
    };
  }
  return null;
};

const getGeoJSONBounds = (geoJSON) => {
  const allCoords = geoJSON.features.flatMap(feature => {
    if (feature.geometry.type === 'Polygon') {
      return feature.geometry.coordinates[0];
    } else if (feature.geometry.type === 'LineString') {
      return feature.geometry.coordinates;
    } else if (feature.geometry.type === 'Point') {
      return [feature.geometry.coordinates];
    }
    return [];
  });
  
  if (allCoords.length === 0) return null;
  
  const lngs = allCoords.map(c => c[0]);
  const lats = allCoords.map(c => c[1]);
  
  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    center: [
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
      (Math.min(...lats) + Math.max(...lats)) / 2
    ]
  };
};
 
const parsePathAsPolygon = (path, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const d = path.getAttribute('d');
    if (!d) return null;
    
    const isClosed = d.trim().endsWith('Z') || d.trim().endsWith('z');
    if (!isClosed) {
      return null;
    }
    
    const points = extractPointsFromPath(d);
    
    if (points.length < 3) {
      console.warn(`Path ${index} has less than 3 points`);
      return null;
    }

    const coordinates = points.map(([x, y]) => {
      return convertSVGToGeo(x, y, svgX, svgY, svgWidth, svgHeight, options);
    });

    return {
      type: 'Feature',
      properties: {
        id: `path_polygon_${index}_${Date.now()}`,
        type: 'room',
        category: 'path',
        name: path.getAttribute('id') || `Path ${index}`,
        fill: path.getAttribute('fill') || '#dbeafe80',
        stroke: path.getAttribute('stroke') || '#3b82f6',
        strokeWidth: parseFloat(path.getAttribute('stroke-width')) || 2,
        floor: options.floorId,
        source: 'svg_path',
        originalD: d
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  } catch (error) {
    console.warn(`Error parsing path ${index}:`, error);
    return null;
  }
};

const parseRectAsPolygon = (rect, svgX, svgY, svgWidth, svgHeight, options, index) => {
  try {
    const x = parseFloat(rect.getAttribute('x')) || 0;
    const y = parseFloat(rect.getAttribute('y')) || 0;
    const width = parseFloat(rect.getAttribute('width')) || 0;
    const height = parseFloat(rect.getAttribute('height')) || 0;
    
    if (width === 0 || height === 0) {
      console.warn(`Rect ${index} has zero width or height`);
      return null;
    }
    
    const points = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
      [x, y]
    ];
    
    const coordinates = points.map(([px, py]) => {
      return convertSVGToGeo(px, py, svgX, svgY, svgWidth, svgHeight, options);
    });

    return {
      type: 'Feature',
      properties: {
        id: `rect_polygon_${index}_${Date.now()}`,
        type: 'room',
        category: 'rectangle',
        name: rect.getAttribute('id') || `Rectangle ${index}`,
        fill: rect.getAttribute('fill') || '#dbeafe80',
        stroke: rect.getAttribute('stroke') || '#3b82f6',
        strokeWidth: parseFloat(rect.getAttribute('stroke-width')) || 2,
        floor: options.floorId,
        source: 'svg_rect',
        width: width,
        height: height
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };
  } catch (error) {
    console.warn(`Error parsing rect ${index}:`, error);
    return null;
  }
};
 
const extractPointsFromPath = (d) => {
  const points = [];
  const commands = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
  
  commands.forEach(cmd => {
    const command = cmd[0].toUpperCase();
    const args = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat);
    
    switch (command) {
      case 'M':
      case 'L':
        for (let i = 0; i < args.length; i += 2) {
          if (!isNaN(args[i]) && !isNaN(args[i + 1])) {
            points.push([args[i], args[i + 1]]);
          }
        }
        break;
        
      case 'H':
        if (points.length > 0) {
          const lastY = points[points.length - 1][1];
          points.push([args[0], lastY]);
        }
        break;
        
      case 'V':
        if (points.length > 0) {
          const lastX = points[points.length - 1][0];
          points.push([lastX, args[0]]);
        }
        break;
        
      case 'Z':
        if (points.length > 0) {
          points.push([points[0][0], points[0][1]]);
        }
        break;
    }
  });
  
  return points;
};