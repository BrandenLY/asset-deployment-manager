import { Box, Grid, Paper, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const DashboardWidget = props => {

    // Props destructuring
    const { 
        title,
        children,
    } = props;
    
    const theme = useTheme();

    return (
        <Box 
            component='div'
            flexGrow={1}
            alignSelf="stretch"
            display="flex"
            width="100%"
        >
            <Paper variant="outlined" sx={{padding:2, height:"100%", width:"100%", maxWidth:"100%"}}>
                <Box><Typography variant="widgetTitle">{title}</Typography></Box>
                <Box
                    marginTop={1}
                    paddingBottom={1}
                    height={`calc(100% - ${theme.spacing(3)})`}
                >
                    {children}
                </Box>
            </Paper>
        </Box>
    )
}

export default DashboardWidget