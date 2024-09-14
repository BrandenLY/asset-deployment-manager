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
import { Menu, LocalShipping, Assignment, Close, LibraryBooks, Place, DevicesOther } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { Divider, useTheme } from '@mui/material';

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

const NavDrawer = props =>{

    const {expanded, navHeight, drawerWidth, onClose} = props;
    
    // Hooks
    const navigate = useNavigate();
    const theme = useTheme();

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
                <Box display="flex" justifyContent="center" padding={1} borderBottom={`${theme.spacing(0.25)} solid ${theme.palette.divider}`}>
                    <Typography variant="h5" textTransform="uppercase">Pages</Typography>
                </Box>
                <Box component="nav">
                    <List>

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
