import React, { useState } from 'react'
import {Box, Paper, IconButton, useTheme, Typography, Divider} from '@mui/material'
import {ExpandLess, ExpandMore} from '@mui/icons-material'
import { ErrorBoundary } from './ErrorBoundary';
import { PageError } from './CustomPage';

const Section = props => {
    
    const {
        title,
        actions,
        children,
        defaultExpanded=false,
        paperProps={}
    } = props;

    const [expanded, setExpanded] = useState(defaultExpanded);

    const theme = useTheme();

    const toggleExpansion = e => {
        setExpanded(prev => !prev);
    }


  return (
    <Paper 
        {...paperProps} 
        className="section" 
        sx={{
            minWidth: "300px",
            padding: 1,
            margin: `${theme.spacing(1)} 0`,
            ...paperProps.sx
        }}
    >
        <Box className="section-heading" display="flex" gap={theme.spacing(1)} padding={theme.spacing(1)} alignItems="center">
            <Box className="section-controls" display="flex" gap={theme.spacing(1.5)} flexGrow={1}>
                <IconButton onClick={toggleExpansion}>
                    { expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <Typography variant="h5">{title}</Typography>
            </Box>
            <Box className="section-actions" display="flex" alignItems="center" gap={theme.spacing(0.5)}>
                {actions}
            </Box>
        </Box>

        { expanded && <Divider sx={{borderBottomWidth: "3px", marginBottom: theme.spacing(1)}} />}

        <ErrorBoundary fallback={<PageError/>}>
            {expanded ?
                <Box className="section-content" padding={theme.spacing(1)} >
                    {children}
                </Box>
            : null}
        </ErrorBoundary>

    </Paper>
  )
}

export default Section