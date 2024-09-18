import React, {useState, useEffect, useRef, useCallback} from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';

// Material UI
import { Box, Button, Breadcrumbs, Link, Typography, Snackbar, Alert } from '@mui/material';
import {Home} from '@mui/icons-material';

import PrimaryNav from './PrimaryNav'
import { BackendContextProvider } from '../context';
import { ErrorBoundary } from './ErrorBoundary';

const notificationDisplayDuration = 3 * 1000;

const CustomBreadcrumbs = props => {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <Box className="breadcrumb-container">
            <Breadcrumbs>
            <Link component={RouterLink} to={'/'}>
                <Home/>
                <span>Home</span>
            </Link>

            {pathnames.map( (value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                return last ? (
                    <Typography>
                        <span>{value}</span>
                    </Typography>
                ) : (
                    <Link component={RouterLink} to={to}>
                        <span>{value}</span>
                    </Link>
                );
            })}
            </Breadcrumbs>
        </Box>
    );
}

export const PageError = props => {

    const {message} = props;
    const navigate = useNavigate()

    return (
        <Box
        sx={{height:"100%", display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", gap:2, marginY:"auto"}}>
            <Typography sx={{fontSize:75}}>OOPS!</Typography>
            <Typography sx={{fontSize:100}}>{"(סּ︵סּ)"}</Typography>
            <Typography sx={{fontSize:25}}>An unknown error occurred.</Typography>
            <Button onClick={e => navigate("/")}>Return Home</Button>
        </Box>
    )
}

const CustomPage = props => {
  // PROPS
  const { className, children, view: View, } = props;
  
  // NOTIFICATION STATE
  const notifications = useRef([]);
  const [activeNotification, setActiveNotification] = useState(null);
  
  // CALLBACK FUNCTIONS
  const addNotification = useCallback(notif => {
    let notifElement = (
        <Alert 
            onClose = { closeActiveNotification }
            severity = { notif.severity ? notif.severity : 'success' }
            variant = { notif.variant ? notif.variant : 'filled'}
        >
            {notif.message}
        </Alert>
    );
    notifications.current = [...notifications.current, notifElement];
    if (activeNotification == null){
        setActiveNotification(notifications.current.shift())
    }
  }, [])
  const closeActiveNotification = (e, r) => {
    if (r === 'clickaway'){
        return;
    }
    setActiveNotification(null);
  }

  // HOOKS
  useEffect(() => {
    const upcomingNotification = notifications.current[notifications.current.length - 1]; // Retrieve notification from queue
    if (activeNotification != null && !!upcomingNotification){
        setActiveNotification(upcomingNotification);
    }
  })

  // FORMATTED DATA
  const classNames = ['page', className].join(' ');
  
  return (
    <BackendContextProvider>

        <Box className={classNames} sx={{padding:2}}>
            <PrimaryNav></PrimaryNav>
            <Box className="page-content" sx={{gridArea:"content", padding: 1.5}}>
                {/* Page Title */}
                <Typography variant="h2" sx={{margin: 1}}>{props.title}</Typography>
                {/* Nav Breadcrumbs */}
                <Typography variant="subtitle1" sx={{margin: 1}}> <CustomBreadcrumbs/> </Typography>
                {/* Page Content */}
                <ErrorBoundary fallback={<PageError/>} >
                    { View ? <View addNotif={addNotification} remNotif={closeActiveNotification} {...props}/> : "" }
                </ErrorBoundary>
            </Box>
            <Snackbar 
                open={!!activeNotification}
                autoHideDuration={notificationDisplayDuration}
                onClose={closeActiveNotification}
                anchorOrigin={{vertical:'bottom', horizontal:'right'}}
            >
                {activeNotification}
            </Snackbar>
        </Box>

    </BackendContextProvider>

)};

export default CustomPage;