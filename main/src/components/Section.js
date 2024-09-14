import React, { useState } from 'react'
import {Box, Paper, IconButton, useTheme, Typography, Divider} from '@mui/material'
import {ExpandLess, ExpandMore} from '@mui/icons-material'

const Section = props => {
    
    const {
        title,
        actions,
        children,
        defaultExpanded=false

    } = props;

    const [expanded, setExpanded] = useState(defaultExpanded);

    const theme = useTheme();

    const toggleExpansion = e => {
        setExpanded(prev => !prev);
    }


  return (
    <Paper className="section" sx={{padding: 1, margin: `${theme.spacing(1)} 0`}}>

        <Box className="section-heading" display="flex" gap={theme.spacing(1)} padding={theme.spacing(1)}>
            <Box className="section-controls" display="flex" gap={theme.spacing(1.5)} flexGrow={1}>
                <IconButton onClick={toggleExpansion}>
                    { expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <Typography variant="h4">{title}</Typography>
            </Box>
            <Box className="section-actions">
                {actions}
            </Box>
        </Box>

        <Divider sx={{marginBottom: theme.spacing(1)}}></Divider>

        <Box classNam="section-content" padding={theme.spacing(1)}>
            { expanded ? children : null}
        </Box>
    </Paper>
  )
}

export default Section