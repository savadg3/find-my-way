import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'; 
// import { Line } from 'react-chartjs-2';

const LineChart = ({ data }) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
      title: {
        display: false,
        text: 'Chart.js Line Chart',
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
      },
      y: {
        grid: {
          drawBorder: false, // Hide horizontal grid lines
        },
        beginAtZero: true,
        ticks: {
          precision: 0, // Set precision to 0 to restrict to integers
        },
      },
    },
  };


  // const data = {
  //   labels: ['January', 'February', 'March', 'April', 'May'],
  //   datasets: [
  //     {
  //       data: [500, 300, 415, 100, 200], // Replace with actual data
  //       borderColor: '#26a3db',
  //       backgroundColor: '#26a3db',
  //       borderWidth:4
  //     },
  //     // {
  //     //   label: 'Dataset 2',
  //     //   data: [900, 1100, 1000, 850, 950], // Replace with actual data
  //     //   borderColor: 'rgb(53, 162, 235)',
  //     //   backgroundColor: 'rgba(53, 162, 235, 0.5)',
  //     // },
  //   ],
  // };


  return <Line options={options} data={data} height={350} />;
};

export default LineChart;
