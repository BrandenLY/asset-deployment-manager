import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Typography } from '@mui/material';

import PrimaryNav from './PrimaryNav'

const CustomPage = ({ className, children, view: View, ...props }) => {
  const classList = ['page', className];
  const classNames = classList.join(' ');
  const location = useLocation()
  
  return (
    <Box className={classNames} sx={{padding:2}}>
        <PrimaryNav></PrimaryNav>
        <Box className="page-content" sx={{margin: 1.5}}>
            <Typography variant="h2" sx={{margin: 1}}>Dashboard</Typography>
            <Typography variant="subtitle1" sx={{margin: 1}}></Typography>
            {View ? <View {...props}/> : ""}
        </Box>
    </Box>

)};

export default CustomPage;