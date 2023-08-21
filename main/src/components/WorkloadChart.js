import React, { useContext, useState, useEffect } from "react";

import { GenericContext } from "../context";
import { Paper } from "@mui/material";
import { Bar } from 'react-chartjs-2';

const WorkloadChart = props =>{
    const ctx = useContext(GenericContext);
    const projectsDataset = {
        label: 'projects',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
    }
    const tasksDataset = {
        label: 'tasks',
        data: [10, 20, 5, 5, 11, 15],
        borderWidth: 1
    }
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
    const today = new Date()
    const labels = months.slice(today.getMonth() - 2, today.getMonth() + 3)


    return(
        <Paper>
            <Bar
            data = {{labels: labels, datasets:[projectsDataset, tasksDataset]}}
            options = {{
                scales: {
                  y: {
                    beginAtZero: true
                  },
                  linear: null,
                }
              }}
            ></Bar>
            {console.log(labels)}
        </Paper>
    )
}

export default WorkloadChart;