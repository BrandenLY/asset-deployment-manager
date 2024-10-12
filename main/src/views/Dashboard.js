import { Box, Button, Grid, IconButton, useMediaQuery, useTheme } from "@mui/material";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { backendApiContext } from "../context";
import { Assessment, DevicesOther, LocalShipping, QrCodeScanner, Summarize } from "@mui/icons-material";
import DashboardWidget from "../components/DashboardWidget";

const Dashboard = props => {
    
    // Formatted Data
    const hideMargin = useMediaQuery("(max-width: 750px")

    return(
        <Box className="Dashboard">

            <Box className="QuickAccess" display="flex" justifyContent="space-evenly" flexWrap="wrap" rowGap={2} margin={hideMargin ? 0 : 2} padding={2}>
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
    const displayIconQuicklinks = useMediaQuery("(max-width:998px)");

    if (displayIconQuicklinks){ // Return Mobile friendly components
        return(
            <IconButton
                color="secondary"
                onClick={navigateTo}
                disabled={!userCanView}
                size="large"
                sx={{
                    border: `3px solid ${theme.palette.secondary.dark}`,
                    padding: `clamp(${theme.spacing(0.25)}, "unset", ${theme.spacing(3)})`,
                    fontSize: `clamp(${theme.spacing(0.25)}, "unset" , ${theme.spacing(3)})`
                }}
            >
                {linkIcon}
            </IconButton>
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
                paddingY: `clamp(${theme.spacing(1.66)}, ${theme.spacing(3)}, ${theme.spacing(3)})`,
                paddingX: `clamp(${theme.spacing(1.33)}, ${theme.spacing(3)}, ${theme.spacing(3)})`,
                fontSize: "clamp(0.90rem, 1.15rem)"
            }}
        >
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
