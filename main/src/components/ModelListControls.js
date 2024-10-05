import { Box, Button } from '@mui/material';
import React from 'react'
import CreateObjectsButton from './CreateObjectsButton';
import { ImportExport } from '@mui/icons-material';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';

const ModelListControls = props => {

    // Props
    const {model, createObjectsFormLayout} = props;

    // Hooks
    return(
        <Box display="flex" justifyContent="flex-end" gap={1} paddingY={1}>
            <CreateObjectsButton model={model} formLayout={createObjectsFormLayout} buttonProps={undefined} buttonIcon={undefined}/>
            <ImportButton model={model} />
            <ExportButton model={model} />
        </Box>
    )
}

export default ModelListControls