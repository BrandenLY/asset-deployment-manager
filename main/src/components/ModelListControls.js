import { Box } from '@mui/material';
import React, { useContext } from 'react'
import CreateObjectsButton from './CreateObjectsButton';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';
import { backendApiContext } from '../context';
import { create } from '@mui/material/styles/createTransitions';
import { usePermissionCheck } from '../customHooks';

const ModelListControls = props => {

    // Props
    const {model, createObjectsFormLayout, buttonProps} = props;

    // Hooks
    const backend = useContext(backendApiContext);
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);

    // FormattedData
    const viewModelPermissionCode = `view_${model}`;
    const createModelPermissionCode = `add_${model}`;
    const updateModelPermissionCode = `change_${model}`;
    const importModelPermissionCode = `use_import`;
    const exportModelPermissionCode = `use_export`;

    const canView   = checkUserPermission(viewModelPermissionCode);
    const canCreate = checkUserPermission(createModelPermissionCode);
    const canUpdate = checkUserPermission(updateModelPermissionCode);
    const canImport = checkUserPermission(importModelPermissionCode);
    const canExport = checkUserPermission(exportModelPermissionCode);

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