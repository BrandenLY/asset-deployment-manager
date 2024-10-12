import { Box, Button, Grid } from "@mui/material";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { backendApiContext } from "../context";
import { Assessment, DevicesOther, LocalShipping, QrCodeScanner, Summarize } from "@mui/icons-material";
import DashboardWidget from "../components/DashboardWidget";

const Dashboard = props => {
    return(
        <Box className="Dashboard">

            <Box className="QuickAccess" display="flex" justifyContent="center" flexWrap="wrap" gap={2} margin={2} padding={2}>
                {QuickAccessLinks.map( linkInfo => {  
                    return(<QuickLink {...linkInfo}></QuickLink>)
                })}
            </Box>

            <Grid container>

                <DashboardWidget title="Available Equipment">
                    test
                </DashboardWidget>

            </Grid>

        </Box>
    );
};

const QuickLink = props => {

    // Props Destructuring
    const {linkIcon, linkText, linkRoute, linkPerm} = props;

    const navigate = useNavigate();
    const backend = useContext(backendApiContext);

    const navigateTo = e => {
        navigate(linkRoute);
    }

    // Formatted Data
    const userCanView = backend.auth.user ? backend.auth.user.checkPermission(linkPerm) : linkPerm == undefined;

    return(
        <Button variant="contained" color="secondary" startIcon={linkIcon} onClick={navigateTo} disabled={!userCanView} sx={{paddingY:3, paddingX:3, fontSize: "1.15rem"}}>
            {linkText}
        </Button>
    );
}

const QuickAccessLinks = [
    {
        linkIcon: <Summarize />,
        linkText: "Reserve Equipment",
        linkRoute: "/equipmentholds"
    },
    {
        linkIcon: <QrCodeScanner />,
        linkText: "Scan Tool",
        linkRoute: "/scan",
        linkPerm: "scan_to_parent"
    },
    {
        linkIcon: <LocalShipping />,
        linkText: "View Shipments",
        linkRoute: "/shipments",
        linkPerm: "view_shipment"
    },
    {
        linkIcon: <DevicesOther />,
        linkText: "View Equipment",
        linkRoute: "/assets",
        linkPerm: "view_asset"
    },
    {
        linkIcon: <Assessment />,
        linkText: "Reporting",
        linkRoute: "/reports"
    }
]

export default Dashboard;
