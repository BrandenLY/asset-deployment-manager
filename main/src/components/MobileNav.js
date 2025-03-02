import { Box, Drawer, IconButton, Link, List, useTheme } from '@mui/material';
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Close, Menu } from '@mui/icons-material';
import { backendApiContext } from '../context';
import { usePermissionCheck } from '../customHooks';
import { CustomLinkGroup, NavLogoExtended, PageLinks } from './PrimaryNav';

// Constant Variables

const MobileNav = props => {

    // Hooks
    const theme = useTheme();

    // State
    const [expanded, setExpanded] = useState(false);

    // Formatted Data
    const navHeight = "80px"
    const drawerWidth = "260px"

  return (
    <React.Fragment>
        <Box
            className="PrimaryNav"
            sx={{
                gridArea: "nav", 
                padding: 2,
                display: "flex",
                justifyContent: "space-between", 
                alignItems: "center",
                height: navHeight,
                zIndex: 2000,
                boxShadow: "none",
                borderBottom: `2px solid ${theme.palette.divider}`,
                background: theme.palette.background.default
            }}
        >
            <NavLogoExtended />
            <IconButton onClick={() => setExpanded(!expanded)} size="large" sx={{color: theme.palette.primary.contrastText}}>
                {expanded ? 
                <Close fontSize="inherit"></Close>
                : <Menu/>}
            </IconButton>
        </Box>
        <NavDrawer expanded={expanded} drawerWidth={drawerWidth} navHeight={navHeight} onClose={() => setExpanded(false)}/>
    </React.Fragment>
  )
}


// Secondary Component
const NavDrawer = props =>{

    // Props Destructuring
    const {expanded, navHeight, drawerWidth, onClose} = props;

    // Hooks
    const theme = useTheme();
    const navigate = useNavigate();
    const backend = useContext(backendApiContext);
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);
    
    return (
        <Drawer
            sx={{
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    backgroundColor: theme.palette.background.default,
                    backgroundImage: "none",
                    borderRight: `2px solid ${theme.palette.divider}`
                },
            }}
            width={expanded ? drawerWidth : 0}
            height="100%"
            anchor="left"
            elevation={3}
            open={expanded}
            variant="temporary"
            onClose={onClose}
        >
            <Box width="100%" height="100%" position="relative" paddingTop={navHeight}>
                <Box component="nav" maxHeight="calc(100% - 36px)" sx={{overflowY: 'auto'}}>
                    <List>
                        { PageLinks.map( (linkGroup, i) => <CustomLinkGroup linkGroupObj={linkGroup} expanded={true}/> )}
                    </List>
                </Box>
                <Box position="absolute" bottom={0} width="100%" padding={1}>
                    <Link href="/logout" color="error">Logout</Link>
                </Box>
            </Box>
        </Drawer>
    );
}

export default MobileNav