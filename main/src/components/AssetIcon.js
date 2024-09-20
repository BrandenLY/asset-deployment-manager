import { DevicesOther } from '@mui/icons-material';
import { Box, Paper } from '@mui/material'
import React, { useEffect, useState } from 'react'

const AssetIcon = props => {

    const {iconName="DevicesOther"} = props;
    const [IconElement, setIconElement] = useState(null);

    const icon = import(`@mui/icons-material/${iconName}.js`)
    .then(val => {
        if (IconElement != val.default){
            setIconElement(val.default);
        }
    });

    return(
        <Paper 
            sx={{
                padding: 1.25,
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                border: "1px solid rgba(0,0,0,0.06)",
                backgroundColor: "info.main",
            }}

        >
            {IconElement != null ? <IconElement /> : <DevicesOther />}
        </Paper>
    );

}

export default AssetIcon;