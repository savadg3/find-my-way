function customRound(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.ceil(value * factor + Number.EPSILON) / factor;
  }