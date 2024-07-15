import { DevicesOther } from '@mui/icons-material';
import { Box, Paper } from '@mui/material'
import React, { useEffect, useState } from 'react'

const AssetIcon = props => {
    const {iconName} = props;
    const [IconElement, setIconElement] = useState(null);

    const importMaterialIcon = async (iconName) => {
        const {default: icon} = await import(`@mui/icons-material/${iconName}.js`);
        return icon;
    }

    const icon = importMaterialIcon(iconName);

    icon.then(val => {
        setIconElement(val);
    });

    return(
        <Box>
            <Paper 
                sx={{
                    width: "40px", 
                    height: "40px", 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center",
                    border: "1px solid rgba(0,0,0,0.06)",
                    backgroundColor: "info.main",
                }}

            >
                {IconElement != null ? <IconElement /> : <DevicesOther />}
            </Paper>
        </Box>
    );

}

export default AssetIcon;