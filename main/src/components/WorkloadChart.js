import React from "react";
import { Paper, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
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

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


export const WorkloadChart = (props) => {
    const today = new Date();
    const period1 = new Date(today.getFullYear(), today.getMonth() - 2).getMonth();
    const period2 = new Date(today.getFullYear(), today.getMonth() - 1).getMonth();
    const currentPeriod = today.getMonth();
    const period3 = new Date(today.getFullYear(), today.getMonth() + 1).getMonth();
    const period4 = new Date(today.getFullYear(), today.getMonth() + 2).getMonth();
    const theme = useTheme();

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
      );

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        color: [theme.palette.text.primary],
        backgroundColor: [theme.palette.primary.main],
        scales : {
            x : {
                grid: { drawOnChartArea: false },
                ticks: {color: theme.palette.text.primary}
            },
            y : {
                suggestedMax: 20,
                suggestedMin: 0,
                border: { display: false },
                grid: { color: theme.palette.grey[500] },
                ticks: {color: theme.palette.text.primary}
            }
        }
      };

    const barData = {
        labels : [ 
            MONTHS[period1], 
            MONTHS[period2], 
            MONTHS[currentPeriod],
            MONTHS[period3],
            MONTHS[period4] 
        ],
        datasets: [
            {
                label: "Projects",
                data: [
                    props.data?.filter( p => p == period1).length,
                    props.data?.filter( p => p == period2).length,
                    props.data?.filter( p => p == currentPeriod).length,
                    props.data?.filter( p => p == period3).length,
                    props.data?.filter( p => p == period4).length,
                ],
            },
        ]
    }

    return (
        <Paper className={props.className} sx={{padding: 2}} elevation={2}>
            <Typography variant="h4">Workload</Typography>
            <Bar
                options={options}
                data={barData}
            />
        </Paper>
    )
}