import React, {useContext, useState} from 'react';
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
import { Menu, LocalShipping, Assignment, Close, LibraryBooks, Place, DevicesOther, People, Groups, Group, PersonAdd, Article, DeviceUnknown } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { Divider, useTheme } from '@mui/material';
import { useCurrentUser } from '../customHooks';
import { backendApiContext } from '../context';

const PrimaryNav = props => {

    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const drawerWidth = "300px";
    const navHeight = "70px";

  return (
    <>
        <Paper
            className="PrimaryNav"
            sx={{
                gridArea: "nav", 
                backgroundColor: "primary.dark",
                backgroundImage: `linear-gradient(9deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%) !important;`,
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
            <IconButton onClick={() => setExpanded(!expanded)} size="large" sx={{color: theme.palette.primary.contrastText}}>
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
                atapult
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
            ['Models', <DeviceUnknown/>, '/models', 'view_model'],
            ['Locations', <Place /> ,'/locations', 'view_location']
        ]
    },
    {
        groupHeading: 'Admin Tools',
        links: [
            ['Staffing', <Groups /> ,'/staffing', 'view_shipment', "---DELETE-THIS-ARRAY-STRING-TO-ENABLE-LINK"],
            ['Groups & Permissions', <Group /> ,'/permissions', 'view_asset', "---DELETE-THIS-ARRAY-STRING-TO-ENABLE-LINK"],
            ['Users', <PersonAdd /> ,'/users', 'view_location', "---DELETE-THIS-ARRAY-STRING-TO-ENABLE-LINK"],
            ['Admin Logs', <Article /> ,'/logs', 'view_location', "---DELETE-THIS-ARRAY-STRING-TO-ENABLE-LINK"]
        ]
    }
]

// Primary Component
const NavDrawer = props =>{

    const {expanded, navHeight, drawerWidth, onClose} = props;
    
    // Hooks
    const theme = useTheme();
    const navigate = useNavigate();
    const backend = useContext(backendApiContext);

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

                        { PageLinks.map( linkGroup => {

                            return(
                                <Box component={React.Fragment}>
                                    <ListItem sx={{
                                        justifyContent: "center",
                                        marginTop:2,
                                        borderBottom: `3px solid ${theme.palette.divider}`,
                                        borderTop: `3px solid ${theme.palette.divider}`
                                    }}>
                                        <Typography variant="h5" textTransform="uppercase">{linkGroup.groupHeading}</Typography>
                                    </ListItem>

                                    { linkGroup.links.map( ([linkText, linkIcon, linkUrl, linkPermission, linkDisabled]) =>{
                                        
                                        const userCanViewLink = backend.auth.user ? backend.auth.user.checkPermission(linkPermission) : false;
                                        if (!userCanViewLink){
                                            return null;
                                        }
                                        
                                        return(
                                            <ListItem disablePadding>
                                                <ListItemButton disabled={linkDisabled} onClick={() => navigate(linkUrl)}>
                                                    <ListItemIcon>{linkIcon}</ListItemIcon>
                                                    <ListItemText primary={linkText} />
                                                </ListItemButton>
                                            </ListItem>
                                        )    
                                    })}

                                </Box>
                            )

                        }) }
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
