import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { useModelOptions } from '../customHooks';
import CustomDialog from './CustomDialog';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import ModelForm from './ModelForm';
import ActionButton from './ActionButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendApiContext, notificationContext } from '../context';

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
                tmpFormState1[fieldName] = {...fieldOptions};
                tmpFormState1[fieldName].current = undefined;
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

        case 'updateFormFieldErrors':
            // Update a form field's current value within a single form data object.
            // requries action to have properties: index<integer>, fieldName<string>, errors<any>
            
            let tmpFormState3 = prev[action.index];
            tmpFormState3[action.fieldName].errors = action.errors;
            newPayload[action.index] = tmpFormState3;
            
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
    const queryClient = useQueryClient();
    const modelOptions = useModelOptions(model);
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // State
    const [displayDialog, setDisplayDialog] = useState(false);
    const [creationForms, dispatch] = useReducer(objectFormReducer, new Array());

    const backendObj = useMutation({
        mutationFn: async (vars) => {
            const { payload, method = "PUT" } = vars;

            const updateUrl = new URL(`${backend.api.baseUrl}/${model}/${payload.id ? payload.id + "/" : ""}`);
            const requestHeaders = backend.api.getRequestHeaders(updateUrl);
        
            return fetch( updateUrl, {
                method:method,
                headers:requestHeaders,
                body: JSON.stringify(payload)
            })
            
        },
        onSettled: async (res, error, vars, ctx) => {

            if (error){
                notifications.add({message: error, severity: "error"})
                return;
            }

            const formNumber = vars.formIndex + 1;
            const data = await res.json();

            if (!res.ok){

                // Invalid post data
                if(res.status == 400){
                    
                    // Assumed Non-field error
                    if (data.hasOwnProperty('detail')){
                        notifications.add({message: data['detail'], severity:"error"});
                        return;
                    }

                    // Assumed Field error
                    Object.entries(data).forEach(([fieldName, fieldErrors]) => {
                        dispatch({
                            type:'updateFormFieldErrors',
                            index: vars.formIndex, 
                            fieldName: fieldName,
                            errors: fieldErrors
                        })
                    })

                    // Add failure notification
                    notifications.add({message: `Failed to create shipment ${formNumber}`, severity: "error"})
                    return;

                }
                
                // Unknown error
                else{
                    const errorMsg = data.detail ? new String(data.detail) : new String(data);
                    notifications.add({message: errorMsg, severity: "error"})
                    return;
                }

            }

            dispatch({type: 'deleteFormInstance', index: vars.formIndex});
            notifications.add({message: `Successfully created shipment ${formNumber}`});
            queryClient.invalidateQueries({queryKey:[model]});
            onDialogClose();

        }
    })

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
        creationForms.forEach( (shipmentFormObj, i) => {
            // Parse state data into proper POST data.
            let postData = {};

            Object.entries(shipmentFormObj).forEach( ([fieldName,fieldData], _index) => {

                if ( fieldData.type == 'related object'){
                    postData[fieldName] = fieldData.current?.id;
                }
                else{
                    postData[fieldName] = fieldData.current;
                }
            })

            mutations[i] = backendObj.mutate({payload:postData, method:"POST", formIndex:i});
        });


    }, [creationForms]);

    const onDialogClose = useCallback(e => {
        
        setDisplayDialog(false);
        setTimeout(() => {
            dispatch({type:"resetToInitialState"});
        }, 5);

    }, []);

    const openDialog = useCallback(e => {
        setDisplayDialog(true);
    }, []);

    // Formatted Data
    const multipleFormsExist = creationForms?.length > 1;
    const submitActionText = multipleFormsExist ? `Submit ${creationForms?.length} records` : 'Submit';

  return (
    
    <React.Fragment>

        <ActionButton elementProps={{startIcon:<Add/>, variant:"contained", color:"secondary", ...props.buttonProps}} callbackFn={openDialog} popoverText={`Create new ${model}s by entering their data manually`}>
            New {model}
        </ActionButton>

        <CustomDialog
            open={displayDialog}
            title={`Create ${model}(s)`}
            subtitle={`Setup new ${model}s by manually entering their details below.`}
            onClose = {onDialogClose}
            actions={[
                <Button onClick={createNewObjects} variant='outlined'>{submitActionText}</Button>
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

    </React.Fragment>
  )
}

export default CreateObjectsButton