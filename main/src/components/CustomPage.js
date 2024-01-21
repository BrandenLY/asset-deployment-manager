import React, {useState, useEffect} from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';

import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import {Home} from '@mui/icons-material';

import PrimaryNav from './PrimaryNav'
import { BackendContextProvider } from '../context';

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

const CustomPage = ({ className, children, view: View, ...props }) => {
  const classNames = ['page', className].join(' ');
  
  return (
    <BackendContextProvider>

        <Box className={classNames} sx={{padding:2}}>
            <PrimaryNav></PrimaryNav>
            <Box className="page-content" sx={{gridArea:"content", margin: 1.5}}>
                {/* Page Title */}
                <Typography variant="h2" sx={{margin: 1}}>{props.title}</Typography>
                {/* Nav Breadcrumbs */}
                <Typography variant="subtitle1" sx={{margin: 1}}> <CustomBreadcrumbs/> </Typography>
                {/* Page Content */}
                { View ? <View {...props}/> : "" }
            </Box>
        </Box>

    </BackendContextProvider>

)};

export default CustomPage;