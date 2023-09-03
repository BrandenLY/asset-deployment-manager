import React, {useState, useEffect} from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';

import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import {Home} from '@mui/icons-material';

import PrimaryNav from './PrimaryNav'

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
  const classList = ['page', className];
  const classNames = classList.join(' ');
  
  return (
    <Box className={classNames} sx={{padding:2}}>
        <PrimaryNav></PrimaryNav>
        <Box className="page-content" sx={{gridArea:"content",margin: 1.5}}>
            <Typography variant="h2" sx={{margin: 1}}>{props.title}</Typography>
            <Typography variant="subtitle1" sx={{margin: 1}}><CustomBreadcrumbs></CustomBreadcrumbs></Typography>
            {View ? <View {...props}/> : ""}
        </Box>
    </Box>

)};

export default CustomPage;