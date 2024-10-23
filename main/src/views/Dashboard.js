import { Box, Button, Grid, IconButton, useMediaQuery, useTheme } from "@mui/material";
import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendApiContext } from "../context";
import { Assessment, DevicesOther, LocalShipping, QrCodeScanner, Summarize } from "@mui/icons-material";
import DashboardWidget from "../components/DashboardWidget";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import SortingGrid from "../components/SortingGrid";
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

// Register required chart.js modules
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Default Layout
const STATICGRIDLAYOUT = [
    { i: 'equipmentAvailable', x: 0, y: 0, w: 4, h: 11 },
    { i: 'futureShipments', x: 4, y: 0, w: 8, h: 11 },
  ];

// Available Equipment Bar Chart state reducer
const equipmentAvailableReducer = (prev, action) => {
    
    // Declare state var
    let newState = {};

    if (prev){ // Start with previous state

        newState = {...prev};
    }

    // Perform Data manipulations
    switch(action.type){

        case 'getInitialState':
            return({
                data: {
                    labels: [],
                    datasets:[]
                },
                options: {
                    indexAxis: 'y', // Horizontal chart
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                        }
                    }
                }
            })
        
        case 'setLabels':
            newState.data.labels = action.value;
            return newState;

        case 'addDataset':
            newState.data.datasets.push(action.value);
            return newState;
    }
}

const Dashboard = props => {
    
    // Hooks
    const theme = useTheme();
    const backend = useContext(backendApiContext);

    // State
    const dashboardElement = useRef(undefined);
    const [dashboardWidth, setDashboardWidth] = useState(window.innerWidth * 0.80);
    const [dashboardLayout, setDashboardLayout] = useState(STATICGRIDLAYOUT); 
    const [equipmentAvailableChart, dispatchEquipmentAvailable] = useReducer(equipmentAvailableReducer, equipmentAvailableReducer(null, {type:'getInitialState'}));

    // Queries
    const models = useInfiniteQuery({queryKey: ['model']});
    const shipments = useInfiniteQuery({queryKey: ['shipment']});

    const allLoadedModels = models.data?.pages.map(p => p.results).flat();
    const allModelsAreLoaded = models.isSuccess && !models.hasNextPage;

    const modelAssetQueries = useQueries({
        queries: allModelsAreLoaded ? 
        allLoadedModels.map( model => {
            return({
                queryKey: ['asset', 'by-model', model.id],
                queryFn: async () => {

                    console.log('executing query')

                    const formattedUrl = new URL(`${backend.api.baseUrl}/asset/`);
                
                    formattedUrl.searchParams.set('model', model.id);

                    const res = await fetch(formattedUrl);
                    const data = await res.json();

                    return data;

                  }
            })
        })
        : [],
    });

    // Effects
    useEffect(() => {

        window.addEventListener('resize', onResize);
        return( () => {
            window.removeEventListener('resize', onResize);
        })

    }, []) // Setup window resize event listener
    
    useEffect(() => {
        if(dashboardElement.current){
            const containerRect = dashboardElement.current.getBoundingClientRect();
            setDashboardWidth(containerRect.width);
        }
    }, [dashboardElement.current]) // Update dashboard width when component loads.
    
    useEffect(() => {
        if(!models.isFetching && models.hasNextPage){
            models.fetchNextPage();
        }
    },[models.isFetching]) // Load all models

    useEffect(() => {
        if (allModelsAreLoaded && modelAssetQueries.map(Q => Q.isSuccess).every(Q => Q)){
            const counts = modelAssetQueries.map( Q => Q.data?.results.length);
            const backgroundColors = [...counts].map(c => theme.palette.primary.light);

            dispatchEquipmentAvailable({type: 'addDataset', value: {label:'In warehouse', data:counts, backgroundColor:backgroundColors, borderColor:backgroundColors}})
        }
    }, [...modelAssetQueries.map(Q => Q.isSuccess)]) // 

    useEffect(() => {
        if(allModelsAreLoaded && equipmentAvailableChart.data.labels.length == 0){
            dispatchEquipmentAvailable({type: 'setLabels', value: allLoadedModels.map(m => m.label)})
        }
    }, [allModelsAreLoaded])

    // Callback Functions
    const onLayoutChange = (newLayout) => {
        setDashboardLayout(newLayout);
    }; // Update layout state on update

    const onResize = event => {
        if(dashboardElement.current){
            const containerRect = dashboardElement.current.getBoundingClientRect();
            setDashboardWidth(containerRect.width);
        }
    }; // Update react-grid-layout width

    // Formatted Data
    const hideMargin = useMediaQuery("(max-width: 750px");

    
    return(
        <Box className="Dashboard" ref={dashboardElement}>

            <Box className="QuickAccess" display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} margin={hideMargin ? 0 : 2} padding={2}>
                {QuickAccessLinks.map( linkInfo => {  
                    return(<QuickLink {...linkInfo}></QuickLink>)
                })}
            </Box>

            <GridLayout 
                className="layout"
                layout={dashboardLayout}
                onLayoutChange={onLayoutChange}
                cols={12} 
                rowHeight={30}
                width={dashboardWidth}
                preventCollision={true}
            >

                <div key="equipmentAvailable">
                    <DashboardWidget
                        title="Available Equipment"
                        description=""
                    >

                        { equipmentAvailableChart?.data.datasets.length > 0 ?
                        <Bar data={equipmentAvailableChart.data} options={equipmentAvailableChart.options} />
                        : null
                        }

                    </DashboardWidget>
                </div>

                <div key="futureShipments">
                    <DashboardWidget
                        title="Scheduled Shipments"
                        description=""
                    >
                        <SortingGrid
                            modelName="shipment"
                            data={shipments.isSuccess ? shipments.data.pages[0].results : []}
                            count={shipments.isSuccess ? shipments.data.pages[0].results.length : 0}
                            initialColumns={['id', 'label', 'departure_date']}
                            maxRowsPerPage={10}
                            paperProps={{sx:{minHeight: "100%", border:"none !important", padding: "none !important", margin: "none !important"}, variant:"outlined"}}
                            disableControls={true}
                        />
                    </DashboardWidget>
                </div>

            </GridLayout>

        </Box>
    );
};

const QuickLink = props => {

    // Props Destructuring
    const {linkIcon, linkText, linkRoute, linkPerm} = props;

    const theme = useTheme();
    const navigate = useNavigate();
    const backend = useContext(backendApiContext);

    const navigateTo = e => {
        navigate(linkRoute);
    }

    // Formatted Data
    const userCanView = backend.auth.user ? backend.auth.user.checkPermission(linkPerm) : linkPerm == undefined;
    const shrinkQuicklinks = useMediaQuery("(max-width:1265px");
    const displayQuicklinks = useMediaQuery("(min-width:981px)");
    const displayIconQuicklinks = useMediaQuery("(max-width:630px)");

    if (displayIconQuicklinks){ // Return Mobile friendly components
        return(
            <Button 
                variant="contained"
                color="secondary"
                onClick={navigateTo}
                disabled={!userCanView}
                sx={{
                    flexGrow: 1,
                }}
            >
                {linkIcon}
            </Button>
        )
    }

    return(
        <Button 
            variant="contained"
            color="secondary"
            startIcon={linkIcon}
            onClick={navigateTo}
            disabled={!userCanView}
            sx={{
                flexGrow: 1,
            }}
        >
            {linkText}
        </Button>
    );
}

const QuickAccessLinks = [
    {
        linkIcon: <QrCodeScanner />,
        linkText: "Scan",
        linkRoute: "/scan",
        linkPerm: "scan_to_parent"
    },
    {
        linkIcon: <LocalShipping />,
        linkText: "Shipments",
        linkRoute: "/shipments",
        linkPerm: "view_shipment"
    },
    {
        linkIcon: <DevicesOther />,
        linkText: "Equipment",
        linkRoute: "/assets",
        linkPerm: "view_asset"
    },
    {
        linkIcon: <Assessment />,
        linkText: "Reports",
        linkRoute: "/reports"
    }
]

export default Dashboard;
