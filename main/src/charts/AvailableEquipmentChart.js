import React, { useContext, useEffect, useReducer } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Box, useTheme } from "@mui/material";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { backendApiContext } from "../context";

// Register required chart.js modules
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Available Equipment Bar Chart state reducer
const equipmentAvailableReducer = (prev, action) => {
  // Declare state var
  let newState = {};

  if (prev) {
    // Start with previous state

    newState = { ...prev };
  }

  // Perform Data manipulations
  switch (action.type) {
    case "getInitialState":
      return {
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          indexAxis: "y", // Horizontal chart
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            x: {
              suggestedMax:5,
              beginAtZero: true,
              ticks:{
                stepSize: 1,
              }
            },
          },
        },
      };

    case "setLabels":
      newState.data.labels = action.value;
      return newState;

    case "addDataset":
      newState.data.datasets.push(action.value);
      return newState;
  }
};

const AvailableEquipmentChart = (props) => {

    // Hooks
    const theme = useTheme();
    const backend = useContext(backendApiContext);

    // State
    const [equipmentAvailableChart, dispatchEquipmentAvailable] = useReducer(
        equipmentAvailableReducer,
        equipmentAvailableReducer(null, { type: "getInitialState" })
    );

    // Queries
    const models = useInfiniteQuery({queryKey: ['model']});

    const allModelsAreLoaded = models.isFetched && models.isSuccess && !models.hasNextPage;
    const allModels = models.data?.pages.map(p => p.results).flat();
    const modelAssetQueries = useQueries({
        queries: allModelsAreLoaded ? 
        allModels.map( model => {
            return({
                queryKey: ['asset', 'by-model', model.id],
                queryFn: async () => {

                    const formattedUrl = new URL(`${backend.api.baseUrl}/asset/`);
                
                    formattedUrl.searchParams.set('model', model.id);
                    formattedUrl.searchParams.set('location__is_warehouse', true)

                    const res = await fetch(formattedUrl);
                    const data = await res.json();

                    return data;

                  }
            })
        })
        : [],
    });

    // Effect: Ensure all models are loaded (not just first page)
    useEffect(() => {
        if(!models.isFetching && models.hasNextPage){
            models.fetchNextPage();
        }
    },[models.isFetching])
    // Effect: Update chart state to include equipment counts
    useEffect(() => {
        if (allModelsAreLoaded && modelAssetQueries.map(Q => Q.isSuccess).every(Q => Q)){
            const counts = modelAssetQueries.map( Q => Q.data?.results.length);
            const backgroundColors = [...counts].map(c => theme.palette.secondary.main);

            dispatchEquipmentAvailable({type: 'addDataset', value: {label:'In warehouse', data:counts, backgroundColor:backgroundColors, borderColor:backgroundColors}})
        }
    }, [...modelAssetQueries.map(Q => Q.isSuccess)])
    // Effect: Update chart state to include labels
    useEffect(() => {
        if(allModelsAreLoaded && equipmentAvailableChart.data.labels.length == 0){
            dispatchEquipmentAvailable({type: 'setLabels', value: allModels.map(m => m.label)})
        }
    }, [allModelsAreLoaded])

    return( 
        <Box width="100%" height="100%">
            { equipmentAvailableChart?.data.datasets.length > 0 ?
            <Bar data={equipmentAvailableChart.data} options={equipmentAvailableChart.options} />
            : null
            }
        </Box>
    )

};

export default AvailableEquipmentChart;
