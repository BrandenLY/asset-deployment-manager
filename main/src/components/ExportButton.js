import { Download } from '@mui/icons-material';
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, FormGroup, Grid, TextField, Typography, useTheme } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import * as XLSX from 'xlsx';
import { useModelOptions } from '../customHooks';
import ActionButton from './ActionButton';
import CustomDialog from './CustomDialog';

// Constant Variables
const VALIDEXPORTFILETYPES = [
    '.xlsx',
    '.xls',
    '.csv'
]

// Reducer
const fieldSelectionsReducer = (prev, action) => {

    if (prev == null){
        return prev;
    }

    let newState = {...prev};

    switch (action.type){
        
        case 'setInitialFields':
            return action.value;

        case 'select':
            let tmpFieldObj = {
                ...prev[action.field],
                selected: action.value 
            };
            
            newState[action.field] = tmpFieldObj;
            return newState;

        case 'selectAll':
            Object.keys(prev).forEach( k => {
                newState[k] = {...prev[k], selected:true}
            })
            return newState;

        case 'deselectAll':
            Object.keys(prev).forEach( k => {
                newState[k] = {...prev[k], selected:false}
            })
            return newState;

        case 'resetToInitialState':
            return [];
    }
}

// Primary Component
function ExportButton(props) {

    const { model } = props;

    const theme = useTheme();
    const modelOptions = useModelOptions(model);

    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [exportFields, dispatchExportFields] = useReducer(fieldSelectionsReducer, []);
    const [exportFileType, setExportFileType] = useState(VALIDEXPORTFILETYPES[0]);
    const [userRequestedDownload, setUserRequestedDownload] = useState(false);
    const [isPreparingDownload, setIsPreparingDownload] = useState(false);

    // Queries
    const allModelObjects = useInfiniteQuery({
        queryKey : [model],
    })

    // Effects
    useEffect(() => {
        if(modelOptions.data != undefined && exportFields.length < 1){

            let data = {};

            let fields = Object.entries(modelOptions.data.model_fields)
            fields = fields.filter( ([fieldName, fieldDetails]) => fieldDetails.type != 'computed value')
            fields.forEach( ([fieldName, fieldDetails]) => {
                data[fieldName] = {...fieldDetails, selected:true}
            })
            
            dispatchExportFields({
                type: 'setInitialFields', 
                value: data
            })
        }
    }, [modelOptions.data, exportFields])

    useEffect(() => {

        if (allModelObjects.isFetching){
            // Escape Hatch
            return;
        }

        if(!allModelObjects.hasNextPage){
            // Escape Hatch
            return;
        }

        allModelObjects.fetchNextPage();

    }, [allModelObjects.hasNextPage, allModelObjects.isFetching]);

    useEffect(() => {

        if( userRequestedDownload && !allModelObjects.hasNextPage){
            console.log('prepping download');
            setIsPreparingDownload(true);

            const headerRow = Object.values(exportFields).map( field => field.label);
            const modelObjectsData = allModelObjects.data.pages.map(page => page.results).flat();
            
            let sheetArrays = [
                headerRow
            ]

            modelObjectsData.forEach( modelObj => {
                let objRow = []

                headerRow.forEach(fieldFriendlyName => {
                
                    const [backendFieldName, fieldDetails] = Object.entries(modelOptions.data.model_fields).find( 
                        ([_, fieldDetails]) => fieldDetails.label == fieldFriendlyName 
                    );

                    objRow.push( modelObj[backendFieldName] );

                })

                sheetArrays.push(objRow);

            })

            const ws = XLSX.utils.aoa_to_sheet(sheetArrays);
            const wb = XLSX.utils.book_new(ws, `${model}s`);
            
            XLSX.writeFile(wb, `${model}-export${exportFileType}`)

            setIsPreparingDownload(false);
            onDialogClose();

        }

    }, [userRequestedDownload, allModelObjects.hasNextPage]);

    const openDialog = e => {
        setDialogIsOpen(true);
    };

    const onDialogClose = e => {
        setDialogIsOpen(false);

        setTimeout(() => {
            dispatchExportFields({ type: 'resetToInitialState' });
            setExportFileType(VALIDEXPORTFILETYPES[0]);
            setUserRequestedDownload(false);
            setIsPreparingDownload(false);
        }, 5)
    };

    // Callback Functions
    const selectField = useCallback(e => {
        if (e.target.checked){
            dispatchExportFields({type: 'select', field:e.target.value, value:true})
        }
        else{
            dispatchExportFields({type: 'select', field:e.target.value, value:false})
        }
    },[])

    const selectAllFields = useCallback(e => {
        if (e.target.checked){
            dispatchExportFields({type: 'selectAll'});
        }
        else{
            dispatchExportFields({type: 'deselectAll'});
        }
    },[])

    const selectFileType = useCallback((e, value) => {
        setExportFileType(value);
    },[])

    const requestDownload = useCallback((e, value) => {
        setUserRequestedDownload(true);
    }, [])

    // Formatted Data
    const exportStepProps = {
        className:'import-step',
        component:'li',
        marginBottom:2,
        paddingY:1,
        fontSize: theme.typography.h5.fontSize
    }
    const allChecked = Object.values(exportFields).every( field => field.selected );
    const hasOneOrMoreSelections = Object.values(exportFields).find( field => field.selected );

    return (
        <React.Fragment>

            <ActionButton elementProps={{ startIcon: <Download />, variant: "contained", ...props}} callbackFn={openDialog} popoverText={`Export ${model} data to a spreadsheet`}>
                Export
            </ActionButton>

            <CustomDialog
                open={dialogIsOpen}
                title={`Export`}
                subtitle={`Download ${model} data as a spreadsheet.`}
                onClose={onDialogClose}
                actions={hasOneOrMoreSelections && exportFileType ? [
                    <Button 
                        disabled={userRequestedDownload}
                        startIcon={isPreparingDownload ? <Loop sx={{animation: 'rotate 2s linear infinite'}}/> : undefined}
                        onClick={requestDownload}
                        variant='outlined'
                    >
                        {isPreparingDownload ? "Loading" : "Download"}
                    </Button>
                ]:[]}
            >
                <Box display="flex" flexDirection="column" gap={3} paddingY={1}>

                    <Box component="ol" paddingY={1} paddingX={3} marginY='unset'>

                        <Box {...exportStepProps}>
                            <Typography variant="h5">Select the fields you would like to see in the export</Typography>
                            <Box>
                                <FormGroup>
                                    <FormControlLabel
                                        label='Select all fields' 
                                        control = {
                                            <Checkbox
                                                checked={allChecked}
                                                onChange={selectAllFields}
                                            />
                                        }
                                    />
                                </FormGroup>
                                <FormGroup display="flex" sx={{paddingX:3}}>
                                    <Grid container spacing={1} wrap="wrap">

                                        {exportFields ? Object.entries(exportFields).map(
                                            ([fieldName, fieldDetails]) => {
                                                const inputId = `${model}-field-${fieldName}-checkbox`;
                                                return(
                                                    <Grid item xs={3} minWidth="133px">
                                                        <FormControlLabel
                                                            label={fieldDetails.label}
                                                            control = {
                                                                <Checkbox
                                                                    id = {inputId}
                                                                    checked={fieldDetails.selected}
                                                                    onChange={selectField}
                                                                    value={fieldName}
                                                                />
                                                            }
                                                        />
                                                    </Grid>
                                                );
                                            }) : null }

                                    </Grid>
                                </FormGroup>
                            </Box>
                        </Box>
                        
                        { hasOneOrMoreSelections ?
                            <Box {...exportStepProps}>
                                <Typography variant="h5">Select your preferred file type.</Typography>
                                <Grid container marginTop={2}>
                                    <Grid item xs={4} minWidth="266px">
                                        <Autocomplete
                                            options={VALIDEXPORTFILETYPES}
                                            value={exportFileType}
                                            onInputChange={selectFileType}
                                            renderInput={params => <TextField {...params} label='File format'/> }
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        :null}
                    </Box>

                </Box>

            </CustomDialog>
        </React.Fragment>
    );
}

export default ExportButton;