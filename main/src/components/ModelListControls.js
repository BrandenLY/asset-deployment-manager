import { Box } from '@mui/material';
import React from 'react'
import CreateObjectsButton from './CreateObjectsButton';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';

const ModelListControls = props => {

    // Props
    const {model, createObjectsFormLayout, buttonProps} = props;

    // Hooks
    return(
        <Box display="flex" justifyContent="flex-end" flexWrap="wrap" gap={1} paddingY={1}>
            <CreateObjectsButton model={model} formLayout={createObjectsFormLayout} buttonProps={buttonProps} buttonIcon={undefined}/>
            <Box display="flex" gap={1}>
                <ImportButton model={model} {...buttonProps}/>
                <ExportButton model={model} {...buttonProps}/>
            </Box>
        </Box>
    )
}

export default ModelListControls