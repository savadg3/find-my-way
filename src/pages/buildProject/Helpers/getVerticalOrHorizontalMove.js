const getVerticalOrHorizontalMove = (prev, current) => {
    const deltaX = Math.abs(prev.x - current.x);
    const deltaY = Math.abs(prev.y - current.y);
    if (deltaX > deltaY) {
        return "horizontal";
    } else {
        return "vertical";
    }
};

// Export the function
export { getVerticalOrHorizontalMove };