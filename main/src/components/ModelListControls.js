import { Box } from '@mui/material';
import React from 'react'
import CreateObjectsButton from './CreateObjectsButton';

const ModelListControls = props => {

    // Props
    const {model, createObjectsFormLayout} = props;

    // Hooks
    return(
        <Box display="flex" justifyContent="flex-end" gap={1} paddingY={1} >
            <CreateObjectsButton model={model} formLayout={createObjectsFormLayout} buttonProps={undefined} buttonIcon={undefined}/>
        </Box>
    )
}

export default ModelListControls