import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';



const MultyBarGraph = ({ data, title }) => {

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

    // const data = {
    //     labels: labels,
    //     datasets: data

    // };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: '',
            },
        },
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Month', // Your y-axis label
                },
            },
            "left-y-axis": {
                type: "linear",
                position: "left",
                grid: {
                    borderDash: [8, 6],
                    lineWidth: 2
                },
                title: {
                    display: true,
                    text: 'Commission Charge', // Your y-axis label
                },
            },
            "right-y-axis": {
                type: "linear",
                position: "right",
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'No of Projects', // Your y-axis label
                },
                ticks: {
                    precision: 0, // Show only integer values
                },
            }
        },
    };

    return (
        <>
            <Bar options={options} data={data} style={{ height: '100%', width: '100%' }} />
        </>

    );
};

export default MultyBarGraph;
