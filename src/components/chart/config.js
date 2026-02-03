


export const lineChartOptionsAccuracy = {
  legend: {
    display: false,
  },

  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    callbacks: {
      label(tooltipItem) {
        // Append '%' symbol to the tooltip label
        return `${tooltipItem.yLabel}%`;
      }
    }
  },
  plugins: {
    datalabels: {
      display: false,
    },
  },
  scales: {
    yAxes: [
      {
        gridLines: {
          display: true,
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          min: 0,
          max: 100,
          padding: 20,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
  },
};
export const lineChartOptionsSpeed = {
  legend: {
    display: false,
  },

  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false,
    },
  },
  scales: {
    yAxes: [
      {
        gridLines: {
          display: true,
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          min: 0,
          max: 100,
          padding: 20,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
  },
};
export const polarAreaChartOptions = {
  legend: {
    position: 'bottom',
    labels: {
      padding: 30,
      usePointStyle: true,
      fontSize: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scale: {
    ticks: {
      display: false,
    },
  },
  plugins: {
    datalabels: {
      display: false,
    },
  },
};

export const areaChartOptions = {
  legend: {
    display: false,
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: [
      {
        gridLines: {
          display: true,
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 5,
          min: 50,
          max: 70,
          padding: 20,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
  },
};

export const scatterChartOptions = {
  legend: {
    position: 'bottom',
    labels: {
      padding: 30,
      usePointStyle: true,
      fontSize: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: [
      {
        gridLines: {
          display: true,
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 20,
          min: -80,
          max: 80,
          padding: 20,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          display: true,
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
        },
      },
    ],
  },

  // legend: {
  //   position: 'bottom',
  //   labels: {
  //     padding: 30,
  //     usePointStyle: true,
  //     fontSize: 12,
  //   },
  // },
  // responsive: true,
  // maintainAspectRatio: false,
  // scales: {
  //   yAxes: [
  //     {
  //       gridLines: {
  //         display: true,
  //         lineWidth: 1,
  //         color: 'rgba(0,0,0,0.1)',
  //         drawBorder: false,
  //       },
  //       ticks: {
  //         beginAtZero: true,
  //         stepSize: 20,
  //         min: -80,
  //         max: 80,
  //         padding: 20,
  //       },
  //     },
  //   ],
  //   xAxes: [
  //     {
  //       gridLines: {
  //         display: true,
  //         lineWidth: 1,
  //         color: 'rgba(0,0,0,0.1)',
  //       },
  //     },
  //   ],
  // },
};

export const barChartOptions = {
  legend: {
    position: 'bottom',
    labels: {
      padding: 30,
      usePointStyle: true,
      fontSize: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: [
      {
        gridLines: {
          display: true,
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          min: 0,
          max: 100,
          padding: 20,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
  },
};

export const barMultiAxisChartOptions = {
  options: {
    scales: {
      'A': {
        type: 'linear',
        position: 'left'
      },
      'B': {
        type: 'linear',
        position: 'right'
      }
    }
  }
};

export const barChartOptionsSpeed = {
  legend: {
    position: 'bottom',
    labels: {
      padding: 30,
      usePointStyle: true,
      fontSize: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: [
      {
        gridLines: {
          display: true,
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false,
        },
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          // min: 0,
          // max: 100,
          padding: 20,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
  },
  
};

export const radarChartOptions = {
  legend: {
    position: 'bottom',
    labels: {
      padding: 30,
      usePointStyle: true,
      fontSize: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scale: {
    ticks: {
      display: false,
    },
  },
  
};

export const pieChartOptions = {
  legend: {
    position: 'bottom',
    labels: {
      padding: 30,
      usePointStyle: true,
      fontSize: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  title: {
    display: false,
  },
  layout: {
    padding: {
      bottom: 20,
    },
  },
  
};

export const doughnutChartOptions = {
  legend: {
    position: 'bottom',
    display: false,
    labels: {
      padding: 30,
      usePointStyle: true,
      fontSize: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  title: {
    display: false,
  },
  cutoutPercentage: 80,
  layout: {
    padding: {
      bottom: 20,
    },
  },
  
};

export const smallLineChartOptions = {
  layout: {
    padding: {
      left: 5,
      right: 5,
      top: 10,
      bottom: 10,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
        display: false,
      },
    ],
    xAxes: [
      {
        display: false,
      },
    ],
  },
};
