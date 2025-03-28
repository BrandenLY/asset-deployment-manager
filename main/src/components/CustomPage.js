import { Error, Home } from '@mui/icons-material';
import { Alert, Box, Breadcrumbs, Button, Link, Snackbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { BackendContextProvider, notificationContext } from '../context';
import { ErrorBoundary } from './ErrorBoundary';
import PrimaryNav from './PrimaryNav';
import { useResetErrorOnNavigate } from '../customHooks';
import MobileNav from './MobileNav';

const CustomBreadcrumbs = props => {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <Box className="breadcrumb-container">
            <Breadcrumbs>
            <Link component={RouterLink} to={'/'}>
                <Home/>
                <Box component="span">Home</Box>
            </Link>

            {pathnames.map( (value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                return last ? (
                    <Typography>
                        <Box component="span">{value}</Box>
                    </Typography>
                ) : (
                    <Link component={RouterLink} to={to}>
                        <Box component="span">{value}</Box>
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
            <Box>
                <Typography sx={{fontSize:100, lineHeight:"100px", textAlign:"center"}}><Error sx={{fontSize: 'inherit'}}/></Typography>
                <Typography sx={{fontSize:70}}>OOPS!</Typography>
            </Box>
            <Typography sx={{fontSize:25}}>An unknown error occurred.</Typography>
            <Button onClick={e => navigate("/")}>Return Home</Button>
        </Box>
    )
}

const CustomPage = props => {
  
  // PROPS
  const { className, view: View } = props;

  // Hooks
  const theme = useTheme();
  const errorBoundaryRef = useRef();
  const clientIsMobile = useMediaQuery(theme.breakpoints.down("md"));
  const notifications = useContext(notificationContext);
  useResetErrorOnNavigate(() => errorBoundaryRef.current?.resetError());
  
  // CALLBACK FUNCTIONS

  // FORMATTED DATA
  const classNames = ['page', className].join(' ');
  const primaryNavMinWidth = "80px";
  const primaryNavMaxWidth = "280px";

  return (
    <BackendContextProvider>

        <Box className={classNames} sx={{flexDirection: clientIsMobile ? "column" : "unset"}}>
            
            {clientIsMobile ? <MobileNav/> : <PrimaryNav {...{primaryNavMinWidth, primaryNavMaxWidth}} />}

            <Box className="page-content" sx={{gridArea:"content", padding: 3, overflow: 'auto', marginLeft: clientIsMobile ? 0 : primaryNavMinWidth}}>
                {/* Page Title */}
                <Typography variant="h2" sx={{margin: 1}}>
                    <Box display="flex" gap={1} alignItems="center">{props.title}</Box>
                </Typography>
                {/* Nav Breadcrumbs */}
                <Typography variant="subtitle1" sx={{margin: 1}}> <CustomBreadcrumbs/> </Typography>
                {/* Page Content */}
                <ErrorBoundary ref={errorBoundaryRef} fallback={<PageError/>} >
                    { View ? <View addNotif={notifications.add} remNotif={notifications.close}/> : "" }
                </ErrorBoundary>
            </Box>

            <Snackbar 
                open={notifications.active != null}
                autoHideDuration={notifications.displayDuration}
                onClose={notifications.close}
                anchorOrigin={{vertical:'bottom', horizontal:'right'}}
            >
                {notifications.active &&
                <Alert
                    onClose={notifications.close}
                    severity={notifications.active.severity ? notifications.active.severity : 'success'}
                    variant='filled'
                >
                    {notifications.active.message}
                </Alert>
                }
            </Snackbar>
        </Box>

    </BackendContextProvider>

)};

export default CustomPage;