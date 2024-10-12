import { Box, Grid, Paper } from '@mui/material'
import React, { useState } from 'react'

const DashboardWidget = props => {

    // Props destructuring
    const { title, children, size=3} = props;

    // Hooks
    const [selectedShipment, setSelectedShipment] = useState(null);
    
    return (
        <Grid sx={size}>
            <Paper sx={{padding:2}}>
                <Box>{title}</Box>
                <Box>
                    {children}
                </Box>
            </Paper>
        </Grid>
    )
}

export default DashboardWidget