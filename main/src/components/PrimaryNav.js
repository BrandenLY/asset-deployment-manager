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
    const navHeight = "60px";
    const navigate = useNavigate();

    const drawer = (
        <Drawer 
            sx={{
                width: "drawerWidth",
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: "drawerWidth",
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

    const appIcon = (<Box sx={{height: "50px"}}><img src="/static/main/images/icons/appIcon@300ppi.png" alt="brand logo" style={{width: "60px", height: "60px"}}/></Box>)

  return (
    <>
        <Paper 
            sx={{ 
                bgcolor: "primary.dark", 
                padding: 1, display: "flex", 
                justifyContent: "space-between", 
                height: navHeight,
            }}
            color="primary"
        >
            <Box sx={{display: "flex", alignItems: "center"}}>
                {appIcon}
                <Typography variant="navtitle">Config View</Typography>
            </Box>
            <IconButton onClick={() => setExpanded(!expanded)}>
                <Menu></Menu>
            </IconButton>
        </Paper> {drawer}
    </>
  );

}

export default PrimaryNav;
