import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { useModelOptions } from '../customHooks';
import CustomDialog from './CustomDialog';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import ModelForm from './ModelForm';

const objectFormReducer = (prev, action) => {
    
    let newPayload = [];

    if (prev != undefined) {
        newPayload = [...prev];
    }

    switch(action.type){
        case 'addAdditionalForm':
            // Add a form data object to the state array.
            // Requires action to have properties: use<ModelOptions>,
            let tmpFormState1 = {};

            Object.entries(action.use.model_fields)
            .forEach( ([fieldName, fieldOptions]) => {
                tmpFormState1[fieldName] = fieldOptions;
                tmpFormState1[fieldName].current = null;
                tmpFormState1[fieldName].errors = [];
            })

            newPayload.push(tmpFormState1);

            return newPayload;

        case 'updateFormFieldState':
            // Update a form field's current value within a single form data object.
            // requries action to have properties: index<integer>, fieldName<string>, value<any>
            
            let tmpFormState2 = prev[action.index];
            tmpFormState2[action.fieldName].current = action.value;
            newPayload[action.index] = tmpFormState2;
            
            return newPayload;

        case 'deleteFormInstance':
            // Remove a single form from the form array.
            // requries action to have properties: index<integer>
            let tmpFormStateArray = []

            newPayload.forEach( (formStateObj, index) => {
                if (action.index == index){
                    return;
                }
                else {
                    tmpFormStateArray.push(formStateObj);
                }
            })

            return tmpFormStateArray;

        case 'resetToInitialState':

            return [];
    }

}

const CreateObjectsButton = props => {

    // Props Destructuring 
    const {model} = props;

    // Hooks
    const [creationForms, dispatch] = useReducer(objectFormReducer, new Array());
    const modelOptions = useModelOptions(model);

    // Effects
    useEffect(() => {
        if(modelOptions.data != undefined && creationForms != undefined){
            // Ensure data and state are loaded

            if(creationForms.length === 0){
                // If the form state is empty, add a form.
                dispatch({type: 'addAdditionalForm', use: modelOptions.data, });
            }

        }
    }, [modelOptions.data, creationForms]);


    // Callback Functions
    const closeSingleForm = useCallback(formIndex => {
        dispatch({type:"deleteFormInstance", index: formIndex});
    }, []);

    const updateObjFormsData = useCallback((formIndex, fieldName, data) => {

        // Update Shipment Form Data
        dispatch({ type:'updateFormFieldState', index: formIndex, fieldName: fieldName, value:data });

    }, []);

    const increaseFormCount = useCallback(e => {
        dispatch({type:"addAdditionalForm", use: modelOptions.data})
    }, [modelOptions.data]);

    const createNewObjects = useCallback(e => {

        let mutations = []
        forms.forEach( (shipmentFormObj, i) => {
            // Parse state data into proper POST data.
            let postData = {};

            Object.entries(shipmentFormObj).forEach( ([fieldName,fieldData], _index) => {

                if ( fieldData.type == 'choice' ){
                    postData[fieldName] = fieldData.current?.value;
                }
                else if ( fieldData.type == 'related object'){
                    postData[fieldName] = fieldData.current?.id;
                }
                else{
                    postData[fieldName] = fieldData.current;
                }
            })

            mutations[i] = addShipmentMutation.mutate({formIndex:i, postData});
        });


    }, []);

    const onDialogClose = useCallback(e => {
        dispatch({type:"resetToInitialState"});
    }, []);

    // Formatted Data
    const multipleFormsExist = creationForms?.length > 1;
    const submitActionText = multipleFormsExist ? `Submit ${creationForms?.length} records` : 'Submit';

  return (
    <CustomDialog
        title={`Create ${model}(s)`}
        subtitle={`Setup and create new ${model}s`}
        openDialogButtonText={`New ${model}`}
        openDialogButtonIcon={<Add/>}
        onClose = {onDialogClose}
        actions={[
            { buttonText : submitActionText, onClickFn : createNewObjects },
        ]}
    >
        { creationForms && // Display Each Form using material ui and the ModelForm component.

            creationForms.map((form, index) => {

                const formRequiresBackground = index % 2;

                return(
                    <Paper key={index} sx={{background:formRequiresBackground ? null : "none", boxShadow:"none", padding:1, boxSizing:'border-box'}}>
                        
                        <Box display="flex" justifyContent="space-between" paddingX={1}>
                            <Typography textTransform="capitalize" variant="h5">
                                {model} {multipleFormsExist ? index + 1 : null}
                            </Typography>
                            <IconButton disabled={index == 0} size={'small'} onClick={() => {closeSingleForm(index)}}>
                                <Close/>
                            </IconButton>
                        </Box>

                        <ModelForm 
                            index={index}
                            model={model}
                            formState={form}
                            layout={props.formLayout ? props.formLayout : undefined} 
                            excludeReadOnly
                            onChange={updateObjFormsData}
                        />

                    </Paper>
                )
            })

        }
        
        <Box sx={{marginY:1}}>
            <Button startIcon={<Add/>} color={'success'} onClick={increaseFormCount}>
                Add {model}
            </Button>
        </Box>

    </CustomDialog>
  )
}

export default CreateObjectsButton