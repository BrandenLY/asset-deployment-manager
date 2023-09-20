import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Menu, LocalShipping, Assignment, Close, LibraryBooks } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { SvgIcon } from '@mui/material';

function PrimaryNav(props) {

    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const drawerWidth = "300px";
    const navHeight = "70px";
    const navigate = useNavigate();

    const drawer = (
        <Drawer 
            sx={{
                gridArea: "sidebar",
                flex: "unset",
                width: expanded ? drawerWidth : "0",
                height: "100%",
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    padding: 1,
                },
            }}
            anchor="right"
            open={expanded}
            variant="persistent"
            onClose={() => setExpanded(false)}
        >
            <nav>
                <List>
                    <ListItem 
                        disablePadding
                    >
                        <ListItemButton onClick={() => setExpanded(false)} sx={{
                            height: navHeight,
                        }}>
                            <ListItemIcon><Close /></ListItemIcon>
                        </ListItemButton>
                    </ListItem>
                    <Divider></Divider>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/tasklist')}>
                            <ListItemIcon><Assignment /></ListItemIcon>
                            <ListItemText primary="Tasklists" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/assets')}>
                            <ListItemIcon><LocalShipping /></ListItemIcon>
                            <ListItemText primary="Assets" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/wiki')}>
                            <ListItemIcon><LibraryBooks /></ListItemIcon>
                            <ListItemText primary="Knowledge Base" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </nav>
        </Drawer>
    );

    const appIcon = (<Box sx={{height: "60px"}}><img src="/static/main/images/icons/AppIcon.svg" alt="brand logo" style={{height: "100%"}}/></Box>)

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
                height: navHeight,
            }}
            color="primary"
        >
            <Box sx={{display: "flex", alignItems: "center"}}>
                {appIcon}
            </Box>
            <IconButton onClick={() => setExpanded(!expanded)}>
                <Menu></Menu>
            </IconButton>
        </Paper> {drawer}
    </>
  );

}

export default PrimaryNav;
