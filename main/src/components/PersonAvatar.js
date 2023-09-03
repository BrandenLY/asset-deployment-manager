import React, {useState, useEffect} from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';

import { Avatar, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import {Home} from '@mui/icons-material';

import PrimaryNav from './PrimaryNav'


const PersonAvatar = ({personName=["Anonymous", "User"], backgroundColor=null}) => {
  if (!backgroundColor) {
    let r = Math.floor(Math.random() * 255); 
    let g = Math.floor(Math.random() * 255); 
    let b = Math.floor(Math.random() * 255);
    
    backgroundColor = `rgb(${r},${g},${b})`
  }
  return (
    <Avatar sx={{bgcolor: backgroundColor}}>
        <Box className={PersonAvatar}>
            <Typography variant="personInitial">{personName.map(name => name.slice(0,1))}</Typography>
        </Box>
    </Avatar>

)};

export default PersonAvatar;