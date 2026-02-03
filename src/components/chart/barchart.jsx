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







const BarGraph = ({ data, title, stacked }) => {

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
                display: false,


            },
            title: {
                display: false,
                text: '',
            },
        },
        scales: {
            x: {
                // stacked: stacked ? true : false,
                type: 'category',
                title: {
                    display: false,
                    text: 'Month', // Your y-axis label
                },
                grid: {
                    display: false,
                    drawBorder: false,
                    lineWidth: 0 // <-- this removes vertical lines between bars
                }
            },
            y:
            {
                stacked: stacked ? true : false,

                // type: 'linear',
                title: {
                    display: false,
                    text: 'No of Customers', // Your y-axis label
                },
                ticks: {
                    precision: 0, // Show only integer values
                },
                grid: {
                    drawBorder: false, // <-- this removes y-axis line
                    // lineWidth: function (context) {
                    //     return context?.index === 0 ? 0 : 1; // <-- this removes the base line
                    // }
                }
            }

        },
        barThickness: 15,


    };

    return (
        <>
            <Bar options={options} data={data} style={{ height: '100%', width: '100%' }} />
        </>

    );
};



export default BarGraph;
