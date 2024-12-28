import { Box } from '@mui/material';
import React, { useContext } from 'react'
import CreateObjectsButton from './CreateObjectsButton';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';
import { backendApiContext } from '../context';
import { create } from '@mui/material/styles/createTransitions';

const ModelListControls = props => {

    // Props
    const {model, createObjectsFormLayout, buttonProps} = props;

    // Hooks
    const backend = useContext(backendApiContext);

    // FormattedData
    const viewModelPermissionCode = `view_${model}`;
    const createModelPermissionCode = `add_${model}`;
    const updateModelPermissionCode = `change_${model}`;
    const importModelPermissionCode = `use_import`;
    const exportModelPermissionCode = `use_export`;

    const canView   = backend.auth.user ? backend.auth.user.checkPermission(viewModelPermissionCode)   : false;
    const canCreate = backend.auth.user ? backend.auth.user.checkPermission(createModelPermissionCode) : false;
    const canUpdate = backend.auth.user ? backend.auth.user.checkPermission(updateModelPermissionCode) : false;
    const canImport = backend.auth.user ? backend.auth.user.checkPermission(importModelPermissionCode) : false;
    const canExport = backend.auth.user ? backend.auth.user.checkPermission(exportModelPermissionCode) : false;

    return(
        <Box display="flex" justifyContent="flex-end" flexWrap="wrap" gap={1} paddingY={1}>

            {canCreate ? 
                <CreateObjectsButton 
                    model={model}
                    formLayout={createObjectsFormLayout}
                    buttonProps={buttonProps}
                    buttonIcon={undefined}
                />
            :
                null
            }

            <Box display="flex" gap={1}>
                
                {canCreate && canUpdate && canImport ?
                    <ImportButton model={model} {...buttonProps}/>
                :
                    null
                }

                {canView && canExport ?
                    <ExportButton model={model} {...buttonProps}/>
                :
                    null
                }
                
            </Box>
        </Box>
    )
}

export default ModelListControls