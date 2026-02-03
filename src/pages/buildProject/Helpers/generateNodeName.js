const generateNodeName = (graph, length) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const points = graph.getPositions();
    const arrOfPoints = Object.keys(points);
    let counter = length !== undefined ? length : arrOfPoints.length + 1;

    while (arrOfPoints.includes(generateNameFromCounter(counter))) {
        counter++;
    }

    return generateNameFromCounter(counter);
};

const generateNameFromCounter = (counter) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const newNodeName = [];

    do {
        newNodeName.unshift(alphabet[counter % 26]);
        counter = Math.floor(counter / 26) - 1;
    } while (counter >= 0);
    return newNodeName.join("");
};

export default generateNodeName;