import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Menu, LocalShipping, Close, Place, DevicesOther, Group, PersonAdd, Article, DeviceUnknown, Logout, Home, Summarize, Assessment, QrCodeScanner, ExpandMore, ExpandLess } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { Avatar, Button, Link, ListItemAvatar, ListSubheader, Popover, useTheme } from '@mui/material';
import { backendApiContext } from '../context';
import { useCurrentUser, usePermissionCheck } from '../customHooks';

// Constant Variables
const PageLinks = [
    {
        groupHeading: 'Manage',
        links: [
            // Link Format: Link Button Text, Icon element, linkto url, required permission.
            ['Dashboard', Home ,'/'],
            ['Scan', QrCodeScanner, '/scan', 'scan_asset_to_parent'],
            ['Reserve Equipment', Summarize , '/reserve', 'add_equipmenthold']
        ]
    },
    {
        groupHeading: 'Track',
        links: [
            // Link Format: Link Button Text, Icon element, linkto url, required permission.
            ['Shipments', LocalShipping ,'/shipments', 'view_shipment'],
            ['Locations', Place ,'/locations', 'view_location'],
            ['Equipment', DevicesOther ,'/assets', 'view_asset'],
            ['Models', DeviceUnknown, '/models', 'view_model'],
            ['Equipment Holds', Summarize, '/equipmentholds', 'view_equipmenthold']
        ]
    },
    {
        groupHeading: 'Admin Tools',
        links: [
            // Link Format: Link Button Text, Icon element, linkto url, required permission.
            ['Reporting', Assessment ,'/reports'],
            ['Users', PersonAdd ,'/users', 'view_location'],
            ['Groups & Permissions', Group ,'/permissions', 'view_asset', "---DELETE-THIS-ARRAY-STRING-TO-ENABLE-LINK"],
            ['Admin Logs', Article ,'/logs', 'IsAdminUser']
        ]
    }
]

// Primary Component
const PrimaryNav = props => {

    // Props Destructuring
    const {minNavWidth="80px", maxNavWidth="280px"} = props;

    // Hooks
    const theme = useTheme();
    const location = useLocation();

    // State
    const [expanded, setExpanded] = useState(false);

    // Effects
    useEffect(() => {
        if(expanded){
            setExpanded(false);
        }
    },[location]);

    // Callback Functions
    const toggleExpanded = useCallback((e) => {
        setExpanded(prev => !prev);
    },[setExpanded])

    // Formatted Data
    const dividerColor = theme.palette.divider;
    const borderValue = `2px solid ${dividerColor}`;

    const navWidthValue = new Number(minNavWidth.match(/[0-9]+/g)[0]);
    const navWidthUnit = minNavWidth.match(/[A-Za-z]+/g)[0];
    const logoColor = theme.palette.text.primary;
    
  return (
    <Box height="100vh" position="fixed" bgcolor={theme.palette.background.default} zIndex={theme.zIndex.appBar}>

        <Box 
            display="flex"
            flexDirection="column"
            position="sticky"
            top={0}
            left={0}
            height="100vh"
            borderRight={`2px solid ${dividerColor}`}
        >
            
            {/* SITE LOGO */}
            <Box display="flex" justifyContent="center" padding={2} gap={2} alignItems="center">

                <Box width={expanded ? '70px' : '50px'} height={expanded ? '70px' : '50px'}>
                    <svg id="Logo-v2" style={{objectFit:'contain'}} data-name="Logo-v2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 257.66 256.71">
                        <g id="logo" data-name="logo">
                            <path fill={logoColor} d="m257.66,174c-4.14,26.43-17.2,46.82-39.19,61.18-21.99,14.36-51.22,21.54-87.69,21.54-39.53,0-71.22-10.58-95.04-31.75C11.91,203.81,0,175.49,0,140.03v-24.02c0-23.22,5.55-43.64,16.66-61.26,11.11-17.62,26.85-31.15,47.23-40.58C84.27,4.72,107.87,0,134.69,0c35.55,0,64.05,7.41,85.5,22.22,21.45,14.82,33.94,35.32,37.46,61.52h-44.36c-3.83-19.96-12.15-34.42-24.94-43.37-12.8-8.95-30.68-13.43-53.67-13.43-28.2,0-50.3,7.79-66.31,23.36-16.01,15.57-24.02,37.73-24.02,66.46v24.22c0,27.14,7.58,48.72,22.75,64.75,15.17,16.03,36.39,24.04,63.67,24.04,24.51,0,43.33-4.15,56.43-12.44,13.1-8.29,21.8-22.74,26.09-43.33h44.36Z"/>
                            <rect fill={logoColor} x="171.6" y="66.98" width="17.42" height="59.54" rx="8.71" ry="8.71"/>
                            <rect fill={logoColor} x="171.59" y="126.52" width="17.42" height="59.54" rx="8.71" ry="8.71"/>
                            <rect fill={logoColor} x="210.08" y="96.76" width="17.42" height="59.54" rx="8.71" ry="8.71" transform="translate(345.31 -92.26) rotate(90)"/>
                            <rect fill={logoColor} x="133.12" y="96.76" width="17.42" height="59.54" rx="8.71" ry="8.71" transform="translate(268.36 -15.31) rotate(90)"/>
                        </g>
                    </svg>
                </Box>

                { expanded ?
                    <Box>
                        <Typography variant="brandFont1">Catapult</Typography><br/>
                        <Typography variant="brandFont2">Inventory Management</Typography>
                    </Box>
                :
                    null
                }

            </Box>

            {/* NAVIGATION LINKS */}
            <Box flexGrow={2} sx={{overflow: 'auto'}}>
                <Box component="nav">
                
                    { PageLinks.map( (linkGroup, i) => <CustomLinkGroup linkGroupObj={linkGroup} expanded={expanded}/> )}

                </Box>
            </Box>
            
            {/* OPEN/CLOSE NAVIGATION BUTTON */}
            <Box display="flex" justifyContent={expanded ? 'space-between' : 'center'} paddingX={expanded ? 1 : 0} alignItems="center">
                <IconButton sx={{margin: "10px 0", marginLeft: expanded ? '19px' : 'unset'}} onClick={toggleExpanded}>
                    { expanded ? 
                        <ExpandLess sx={{transform:"rotate(-90deg)"}} />
                        :
                        <ExpandMore sx={{transform:"rotate(-90deg)"}} />
                    }
                </IconButton>
                {expanded ?
                    <Link href="/logout" color="error">Logout</Link>
                :
                    null
                }
            </Box>

        </Box>

    </Box> 
  );

}

const CustomLinkGroup = props => {
    
    const {linkGroupObj, expanded} = props;

    return(
        <List
            sx={{padding: 0}}
            subheader={<ListSubheader>{expanded ? linkGroupObj.groupHeading : ''}</ListSubheader>}
        >
            {linkGroupObj.links.map( linkDetails => {
                return(
                    <CustomNavLink linkOptions={linkDetails} expanded={expanded} />
                )
            })}
        </List>
    );
}

const CustomNavLink = props => {

    // Props Destructuring
    const {linkOptions, expanded} = props;
    const [linkText, LinkIcon, linkLocation, linkPerm, linkDisbled] = linkOptions;

    // Hooks
    const theme = useTheme();
    const location = useLocation();
    const backend = useContext(backendApiContext);
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);
    const navigate = useNavigate();

    const ListItemButtonElement = useRef(null);

    // State
    const [displayPopover, setDisplayPopover] = useState(false);

    // Effects
    useEffect(() => {
        const handleFocusHover = e => {
            switch(e.type){
                case 'mouseenter':
                    setDisplayPopover(true)
                    break;
                case 'mouseleave':
                    setDisplayPopover(false)
                    break;
            }
            e.preventDefault();
        }

        if (ListItemButtonElement.current){
            ListItemButtonElement.current.addEventListener('mouseenter', handleFocusHover);
            ListItemButtonElement.current.addEventListener('mouseleave', handleFocusHover);
        }

        return () => {
            if(ListItemButtonElement.current){
                ListItemButtonElement.current.removeEventListener('mouseenter', handleFocusHover);
                ListItemButtonElement.current.removeEventListener('mouseleave', handleFocusHover);
            }
        }
    },[ListItemButtonElement.current]);

    useEffect(() => {
        if(displayPopover){
            setDisplayPopover(false);
        }
    }, [location]);

    // Callback Functions
    const handleLinkClick = useCallback((e) => {
        
        navigate(linkLocation);

    }, [linkLocation, navigate]);

    // Formatted Data
    let linkIsCurrentPage = false;

    if( linkLocation == '/'){
        linkIsCurrentPage = location.pathname == linkLocation;
    }
    else{
        linkIsCurrentPage = location.pathname.startsWith(linkLocation);
    }

    let userCanViewLink = false;

    if(linkPerm){
        userCanViewLink = checkUserPermission(linkPerm);
    }
    else{
        userCanViewLink = true;
    }

    return(
        <React.Fragment>

            <ListItemButton
                ref={ListItemButtonElement}
                selected={linkIsCurrentPage}
                onClick={handleLinkClick}
                sx={{
                    justifyContent: expanded ? 'initial' : 'center',
                    display: userCanViewLink ? 'flex' : 'none',
                    margin:'auto',
                }}
                disabled={linkDisbled}
            >
                <ListItemAvatar sx={{minWidth:"unset"}}>
                    <Avatar sx={{backgroundColor: 'transparent', color: theme.palette.text.primary}}>
                        <LinkIcon fontSize={expanded ? 'small' : 'medium'}/>
                    </Avatar>
                </ListItemAvatar>

                { expanded ? 
                    <ListItemText primary={linkText}/>
                :
                    null
                }
            </ListItemButton>

            <Popover
                id={`${linkText}NavLinkPopover`}
                sx={{ pointerEvents: 'none' }}
                open={expanded ? false : displayPopover}
                anchorEl={displayPopover ? ListItemButtonElement.current : null}
                anchorOrigin={{horizontal:'right', vertical:'center'}}
                transformOrigin={{horizontal:'left', vertical:'center'}}
                onClose={() => setDisplayPopover(false)}
                disableRestoreFocus
            >
                <Typography sx={{padding: 0.5}}>
                    {linkText}
                </Typography>
            </Popover>

        </React.Fragment>
    );
}

export default PrimaryNav;
