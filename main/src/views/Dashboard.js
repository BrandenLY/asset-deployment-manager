import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendApiContext } from "../context";
import { Assessment, DevicesOther, LocalShipping, QrCodeScanner, Summarize } from "@mui/icons-material";
import DashboardWidget from "../components/DashboardWidget";
import { useInfiniteQuery } from "@tanstack/react-query";
import SortingGrid from "../components/SortingGrid";
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import AvailableEquipmentChart from "../charts/AvailableEquipmentChart";
import { usePermissionCheck } from "../customHooks";

// Default Layout
const DEFAULTGRIDLAYOUT = [
    { i: "equipmentAvailable", x: 0, y: 0, w: 12, h: 10 },
    { i: "futureShipments", x: 0, y: 10, w: 12, h: 10 },
  ];
const SAVEDLAYOUT = localStorage.getItem("DashboardLayout");

const Dashboard = props => {

    // State
    const dashboardElement = useRef(undefined);
    const [dashboardWidth, setDashboardWidth] = useState(window.innerWidth * 0.80);
    const [dashboardLayout, setDashboardLayout] = useState(SAVEDLAYOUT ? JSON.parse(SAVEDLAYOUT) : DEFAULTGRIDLAYOUT); 

    const shipments = useInfiniteQuery({queryKey: ['shipment']});

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
        const layoutJson = JSON.stringify(dashboardLayout);
        if(layoutJson != SAVEDLAYOUT){
            localStorage.setItem('DashboardLayout', layoutJson);
        }
    }, [dashboardLayout])
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
                        <AvailableEquipmentChart />
                    </DashboardWidget>
                </div>

                <div key="futureShipments">
                    <DashboardWidget
                        title="Scheduled Shipments"
                        description=""
                    >
                        <SortingGrid
                            modelName="shipment"
                            dataQuery={shipments}
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

    const navigate = useNavigate();
    const backend = useContext(backendApiContext);
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);

    const navigateTo = e => {
        navigate(linkRoute);
    }

    // Formatted Data
    const userCanView = checkUserPermission(linkPerm);
    const displayIconQuicklinks = useMediaQuery("(max-width:630px)");

    if (displayIconQuicklinks){ // Return Mobile friendly components
        return(
            <Button 
                variant="contained"
                color='inherit'
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
            color='inherit'
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
        linkPerm: "scan_asset_to_parent"
    },
    {
        linkIcon: <Summarize />,
        linkText: "Reserve",
        linkRoute: "/reserve",
        linkPerm: "add_equipmenthold"
    },
    {
        linkIcon: <LocalShipping />,
        linkText: "Shipments",
        linkRoute: "/shipments",
        linkPerm: "view_shipment"
    },
    {
        linkIcon: <Assessment />,
        linkText: "Reports",
        linkRoute: "/reports"
    }
]

export default Dashboard;
