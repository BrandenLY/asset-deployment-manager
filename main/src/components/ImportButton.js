import { AttachFile, Loop, Upload } from '@mui/icons-material';
import { Box, Button, FormControl, FormHelperText, InputLabel, Link, OutlinedInput, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { backendApiContext, notificationContext } from '../context';
import { useModelOptions } from '../customHooks';
import ActionButton from './ActionButton';
import CustomDialog from './CustomDialog';
import SortingGrid from './SortingGrid';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Primary Component
function ImportButton(props) {

    // Props destructuring
    const { model } = props;

    // Hooks
    const theme = useTheme();
    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);
    const modelOptions = useModelOptions(model);

    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    const [importFile, setImportFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [fileErrors, setFileErrors] = useState([]);
    const [payloadData, setPayloadData] = useState(null);

    // Mutations
    const api = useMutation({
        mutationFn: async ( data ) => {
            const updateUrl = new URL(
              `${backend.api.baseUrl}/${model}/${data.id ? `${data.id}/` : ""}`
            );
            const requestHeaders = new Headers();
            requestHeaders.set("Content-Type", "application/json");
            requestHeaders.set("X-CSRFToken", backend.api.csrftoken);
          
            return fetch(updateUrl, {
              method: data.hasOwnProperty('id') ? 'PUT' : 'POST',
              headers: requestHeaders,
              body: JSON.stringify(data),
            });
        },
        onSettled: (res, error, vars) => {
            if (error){
                notifications.add({message:'Import has failed; an unexpected error occurred.', severity:"error"})
                console.log(error)
                return;
            }

            res.json().then( resData => {

                if (!res.ok){
                    notifications.add({message:`Error: ${JSON.stringify(resData.details ? resData.details : resData)}`, severity:"error"})
                    return
                }

                notifications.add({message: `Successfully imported ${model} data.`});

                queryClient.invalidateQueries()
            })
        }
    })

    // Effects 
    useEffect(() => {
        
        if (importFile == null){
            // Escape Hatch
            return;
        }

        if (modelOptions.data == undefined){
            // Escape Hatch
            return;
        }
        
        // Read File Object
        const parseFile = async () => {
            const fileData = await importFile.arrayBuffer()
            return XLSX.read(fileData);
        }
        // Validate File Object
        const validateFile = async (wb) => {

            // Get the worksheet from within the workbook
            let ws = wb.Sheets[wb.SheetNames[0]]

            // Parse worksheet rows to json
            const wsRows = XLSX.utils.sheet_to_json(ws);
            
            // Load writable fields from model options
            const writableFields = Object.entries(modelOptions.data.model_fields)
            .filter( ([fieldName, fieldDetails]) => !fieldDetails.read_only);

            // Load required fields from model options
            const requiredFields = writableFields.filter( ([fieldName, fieldDetails]) => fieldDetails.required);
            
            // Perform basic frontend validation.
            let uploadErrors = [];
            wsRows.forEach((row, index) => {
                let missingRequiredFields = [];

                requiredFields.forEach( ([fieldName, fieldDetails]) => {
                    
                    if( !row.hasOwnProperty(fieldDetails.label) ){
                        missingRequiredFields.push(fieldName);
                    }

                });

                if(missingRequiredFields.length > 0){
                    uploadErrors.push(`Row ${index + 2} is missing required fields: '${missingRequiredFields.join("', '")}'`);
                }

            })

            // Skip Backend Validation if frontend validation resulted in errors.
            if(uploadErrors.length > 0){
                setFileErrors(uploadErrors);
                return;
            }
            
            // Rename object keys
            // import files use friendly field names but these need to be converted to real database fieldnames.
            const payload = wsRows.map( (obj) => {
                let rowData = {};
                Object.entries(obj).map( ([fieldName, fieldData]) => {

                    const backendFieldName = Object.keys(modelOptions.data.model_fields)
                    .find( (field) => {
                        return fieldName == modelOptions.data.model_fields[field].label
                    })

                    rowData[backendFieldName] = fieldData;

                })
                return rowData;
            })

            // Perform advanced backend validation.
            const updateUrl = new URL(`${backend.baseUrl}/${model}/validate/`);
            
            const requestHeaders = new Headers();
            requestHeaders.set("Content-Type", "application/json");
            requestHeaders.set("X-CSRFToken", backend.csrftoken);

            const res = await fetch(updateUrl, {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify(payload),
            });

            if (!res.ok){
                const data = await res.json();
                const fieldErrors = Object.entries(data['errors'])
                .map( ([fieldName, errors]) => `${fieldName}: ${errors.join(', ')}`);

                const errorMessage = `Row ${data['row']}: ${fieldErrors}`;

                uploadErrors.push(errorMessage);
            }

            // Update error state and end execution
            if(uploadErrors.length > 0){
                setFileErrors(uploadErrors);
                return;
            }

            return payload;

        }

        // Execute async functions
        const parseAndValidate = async () => {

            // Set loading state
            setIsParsing(true);

            // Parse and validate files
            const wb = await parseFile();
            const validatedData = await validateFile(wb);

            // Update state
            setIsParsing(false);
            setPayloadData(validatedData);

        }

        parseAndValidate();

    }, [modelOptions.data, importFile]);

    useEffect(() => {
        if(!queryClient.isMutating()){

            queryClient.refetchQueries({queryKey:[model], type:'active'});

        }
    }, [api.isSuccess])

    // Callback Functions
    const openDialog = e => {
        setDialogIsOpen(true);
    };

    const onDialogClose = e => {
        setDialogIsOpen(false);

        setTimeout(() => {
            setImportFile(null);
            setFileErrors([]);
            setPayloadData(null);   
        }, 5);
    };

    const updateFile = useCallback(e => {

        // Save file to state
        if(e.target.files.length > 0){

            setImportFile(e.target.files[0]);

        }

    }, []);

    const getTemplate = useCallback(e => {
        
        if(modelOptions.data == undefined){
            alert('Page is still loading, please wait and try again.')
            return;
        }

        let columnHeaders = Object.entries(modelOptions.data.model_fields)
        .filter( ([fieldName, fieldDetails]) => !fieldDetails.read_only || fieldName == 'id')
        .map( ([_, fieldDetails]) => fieldDetails.label );
        

        let ws = XLSX.utils.aoa_to_sheet([columnHeaders]);
        let wb = XLSX.utils.book_new(ws, `${model}s`);

        XLSX.writeFile(wb, `${model}-import-template.xlsx`);

    }, [modelOptions.data])

    const saveObjectsToBackend = e => {

        payloadData.forEach( objRow => {
            api.mutate(objRow);
        })

        onDialogClose();
    }

    // Formatted Data
    const inputLabelText = "Import file";
    const htmlInputId = `upload-${model}-import`;
    const inputDescriptionId = `${htmlInputId}-help-text`;
    const initialHelpText = "Accepts *.xlsx"
    const importStepProps = {
        className:'import-step',
        component:'li',
        marginBottom:2,
        paddingY:1,
        fontSize: theme.typography.h5.fontSize
    }
    const hasFileErrors = fileErrors.length > 0;
    const writableColumnName = modelOptions.data ? Object.entries(modelOptions.data.model_fields)
    .filter( ([fieldName, fieldDetails]) => !fieldDetails.read_only )
    .map( ([fieldName, fieldDetails]) => fieldName) : [];
    const dialogSubtitle = (<Box component="span">
        <Box component={React.Fragment}>
            {`Upload ${model} data using an excel spreadsheet.`}
            <Typography sx={{marginBottom:1}} size="small" variant='caption'>
                <Link underline='hover' onClick={getTemplate} sx={{marginLeft:1, cursor:'pointer'}}>Download template</Link>
            </Typography>
        </Box>
    </Box>)

    // JSX
    return (
        <React.Fragment>

            <ActionButton elementProps={{ startIcon: <Upload />, variant: "contained" }} callbackFn={openDialog} popoverText={`Import ${model} data from a spreadsheet`}>
                Import
            </ActionButton>

            <CustomDialog
                open={dialogIsOpen}
                title={`Import`}
                subtitle={dialogSubtitle}
                onClose={onDialogClose}
                actions={payloadData ? [
                    <Button onClick={saveObjectsToBackend} variant='outlined'>Confirm & Upload</Button>
                ] : null}
            >

                <Box component='ol' paddingY={1} paddingX={3} marginY='unset'>

                    <Box {...importStepProps}>
                        <Typography variant='h5'>Select a file to import</Typography>
                        <Box marginTop={2}>
                            <FormControl disabled={isParsing}>

                                <InputLabel shrink htmlFor={htmlInputId}>
                                    {inputLabelText}
                                </InputLabel>

                                <OutlinedInput
                                    type="file"
                                    id={htmlInputId}
                                    notched={true}
                                    required={true}
                                    onChange={updateFile}
                                    label={inputLabelText}
                                    inputProps={{accept:".xlsx"}}
                                    endAdornment={<AttachFile/>}
                                    aria-describedby={inputDescriptionId}
                                    fullWidth
                                />

                                <FormHelperText id={inputDescriptionId}>
                                    {initialHelpText}
                                </FormHelperText>

                            </FormControl>
                        </Box>
                    </Box>


                    { isParsing ?
                    <Box {...importStepProps}>
                        <Typography variant='h5' sx={{display: "flex", alignItems: "center", gap: theme.spacing(1)}}>
                            Loading.<Loop sx={{animation: 'rotate 2s linear infinite'}}/>
                        </Typography>
                    </Box>
                    : null
                    }
                    
                    { hasFileErrors ?
                    <Box {...importStepProps}>
                        <Typography variant='h5'>Import failed. Please address the following issues and try again.</Typography>
                        <Box component="ul">
                            {fileErrors.map( e => (
                                <Box component="li">
                                    <Typography color="error">{e}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    : null
                    }

                    { payloadData ?
                    <Box {...importStepProps}>
                        <Typography variant="h5">Preview and confirm your upload.</Typography>
                        
                            <SortingGrid
                                modelName={model}
                                data={payloadData.slice(0,5)}
                                initialColumns={writableColumnName}
                                disableControls={true}
                            />
                    </Box>
                    : null
                    }

                </Box>

            </CustomDialog>
        </React.Fragment>
    );
}

export default ImportButton