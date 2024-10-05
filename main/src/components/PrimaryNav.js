import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Menu, LocalShipping, Assignment, Close, LibraryBooks, Place, DevicesOther, People, Groups, Group, PersonAdd, Article } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { Divider, useTheme } from '@mui/material';
import { useCurrentUser } from '../customHooks';

const PrimaryNav = props => {

    const [expanded, setExpanded] = useState(false);
    const drawerWidth = "300px";
    const navHeight = "70px";

  return (
    <>
        <Paper
            className="PrimaryNav"
            sx={{
                gridArea: "nav", 
                bgcolor: "primary.dark", 
                padding: 1, 
                display: "flex",
                justifyContent: "space-between", 
                alignItems: "center",
                height: navHeight,
                zIndex: 2000,
                boxShadow: "none",
            }}
            elevation={16}
            color="primary"
        >
            <NavLogo />
            <IconButton onClick={() => setExpanded(!expanded)} size="large">
                {expanded ? 
                <Close fontSize="inherit"></Close>
                :
                <Menu fontSize="inherit"></Menu>
                }
            </IconButton>
        </Paper>
        <NavDrawer expanded={expanded} drawerWidth={drawerWidth} navHeight={navHeight} onClose={() => setExpanded(false)}/>
    </>
  );

}

const NavLogo = props => {
    return (
        <Box sx={{height: "50px", marginLeft: "25px", display: "flex", alignItems: "center", gap:"2px"}}>
            <img src="/static/main/images/icons/Logo-v2.svg" alt="Brand logo" style={{height: "100%"}}/>
            <Typography variant="h2" sx={{fontWeight:"bold", color:"#E6E7E8"}}>
                onfigView
            </Typography>
        </Box>
    );
}

const PageLinks = [
    {
        groupHeading: 'Track & Manage',
        links: [
            // Link Format: Link Button Text, Icon element, linkto url, required permission.
            ['Shipments', <LocalShipping /> ,'/shipments', 'view_shipment'],
            ['Assets', <DevicesOther/> ,'/assets', 'view_asset'],
            ['Locations', <Place /> ,'/location', 'view_location']
        ]
    },
    {
        groupHeading: 'Admin Tools',
        links: [
            ['Staffing', <Groups /> ,'/staffing', 'view_shipment'],
            ['Groups & Permissions', <Group /> ,'/permissions', 'view_asset'],
            ['Users', <PersonAdd /> ,'/users', 'view_location'],
            ['Admin Logs', <Article /> ,'/logs', 'view_location']
        ]
    }
]

// Primary Component
const NavDrawer = props =>{

    const {expanded, navHeight, drawerWidth, onClose} = props;
    
    // Hooks
    const theme = useTheme();
    const navigate = useNavigate();
    const user = useCurrentUser();

    return (
        <Drawer 
            sx={{
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    padding: 2,
                },
            }}
            width={expanded ? drawerWidth : 0}
            height="100%"
            anchor="right"
            elevation={3}
            open={expanded}
            variant="temporary"
            onClose={onClose}
        >
            <Box width="100%" height="100%" position="relative" paddingTop={navHeight}>
                <Box component="nav">
                    <List>
                        <ListItem sx={{justifyContent: "center", marginTop:2, borderBottom: `3px solid ${theme.palette.divider}`, borderTop: `3px solid ${theme.palette.divider}`}}>
                            <Typography variant="h5" textTransform="uppercase">Track & Manage</Typography>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/shipments')}>
                                <ListItemIcon><LocalShipping /></ListItemIcon>
                                <ListItemText primary="Shipments" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/assets')}>
                                <ListItemIcon><DevicesOther/></ListItemIcon>
                                <ListItemText primary="Assets" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/locations')}>
                                <ListItemIcon><Place /></ListItemIcon>
                                <ListItemText primary="Locations" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem sx={{justifyContent: "center", marginTop:3, borderBottom: `3px solid ${theme.palette.divider}`, borderTop: `3px solid ${theme.palette.divider}`}}>
                            <Typography variant="h5" textTransform="uppercase">Admin</Typography>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/staffing')}>
                                <ListItemIcon><Groups /></ListItemIcon>
                                <ListItemText primary="Staffing" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/permissions')}>
                                <ListItemIcon><Group /></ListItemIcon>
                                <ListItemText primary="Groups &amp; Permissions" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/users')}>
                                <ListItemIcon><PersonAdd /></ListItemIcon>
                                <ListItemText primary="Users" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/logs')}>
                                <ListItemIcon><Article /></ListItemIcon>
                                <ListItemText primary="Admin logs"/>
                            </ListItemButton>
                        </ListItem>

                    </List>
                </Box>
                <Box position="absolute" bottom={0} width="100%" border="1px solid red">
                    <Typography>Test</Typography>
                </Box>
            </Box>
        </Drawer>
    );
}

export default PrimaryNav;
