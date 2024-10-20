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

            <Box className="QuickAccess" display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} margin={hideMargin ? 0 : 2} padding={2}>
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
