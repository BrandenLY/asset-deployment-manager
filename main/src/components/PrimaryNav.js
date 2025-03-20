import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { LocalShipping, Place, DevicesOther, Group, PersonAdd, Article, DeviceUnknown, Home, Summarize, Assessment, QrCodeScanner, ExpandMore, ExpandLess } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { Avatar, Link, ListItemAvatar, ListSubheader, Popover, useTheme } from '@mui/material';
import { backendApiContext } from '../context';
import { usePermissionCheck } from '../customHooks';

// Constant Variables
export const PageLinks = [
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
            ['Users', PersonAdd ,'/users', 'view_user'],
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

                { expanded ?
                    <NavLogoExtended/>
                :
                    <NavLogo/>
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

export const CustomLinkGroup = props => {
    
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

export const CustomNavLink = props => {

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

export const NavLogo = props => {
    return (
        <Box sx={{height: "50px", display: "flex", alignItems: "center", gap:"2px"}}>
            <img src="/static/main/images/icons/Logo-v2.svg" alt="Brand logo" style={{height: "100%"}}/>
        </Box>
    );
}

export const NavLogoExtended = props => {
    return (
        <Box sx={{height: "50px", display: "flex", alignItems: "center", gap:"2px"}}>
            <img src="/static/main/images/icons/Logo-v2.svg" alt="Brand logo" style={{height: "100%"}}/>
            <Typography variant="h2" sx={{fontWeight:"bold", color:"#E6E7E8"}}>
                atapult
            </Typography>
        </Box>
    );
}

export default PrimaryNav;
