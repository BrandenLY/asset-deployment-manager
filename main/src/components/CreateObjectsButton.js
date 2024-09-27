import React, { useCallback, useState } from 'react'
import { useModelOptions } from '../customHooks';
import CustomDialog from './CustomDialog';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import ModelForm from './ModelForm';

const CreateObjectsButton = props => {

    // Props Destructuring 
    const {model} = props;

    // Hooks
    const [numExtraObjCreationForms, setNumExtraObjCreationForms] = useState(0);
    const [creationForms, setCreationForms] = useState([]);
    const modelOptions = useModelOptions(model);

    // Callback Functions
    const closeSingleForm = useCallback(formIndex => {

        setCreationForms( previous => {
            const tmp = [...previous];
            tmp.splice(formIndex, 1);
            return tmp;
        })

        setNumExtraObjCreationForms( previous => {
            return previous - 1;
        })
        
    }, [])

    const updateObjFormsData = useCallback((formIndex, data, fieldName=null) => {
        // Update Shipment Form Data
        setCreationForms( previous => {

            let tmp = [...previous];
            if(fieldName === null){

                tmp[formIndex] = {...data}
    
            } else {
    
                tmp[formIndex][fieldName].current = data;
                tmp[formIndex][fieldName].errors = [];
    
            }

            return tmp;
        })
    }, [])

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


    },[])

  return (
    <CustomDialog
        title={`Create ${model}(s)`}
        subtitle={`Setup and create new ${model}s`}
        openDialogButtonText={`New ${model}`}
        openDialogButtonIcon={<Add/>}
        onClose = {() => {setNumExtraObjCreationForms(0); setCreationForms([]);}}
        actions={[
            [numExtraObjCreationForms ? `Submit ${numExtraObjCreationForms+1} records` : 'Submit', {'callbackFn' : createNewObjects}]
        ]}
    >
        <Paper key={0} sx={{background:"none", boxShadow:"none", padding:1, boxSizing:'border-box'}}>

            <Box display="flex" justifyContent="space-between" paddingX={1}>
                <Typography>{model} {numExtraObjCreationForms > 0 ? "1" : null}</Typography>
                <IconButton disabled={true} size={'small'}>
                    <Close/>
                </IconButton>
            </Box>

            <ModelForm 
                index={0}
                modelOptions={modelOptions}
                onChange={updateObjFormsData}
                formState={creationForms}
                layout={props.formLayout ? props.formLayout : undefined}
                excludeReadOnly
            />
        
        </Paper>

        { 
            [...Array(numExtraObjCreationForms)].map((_, i) => {

                const index = i + 1;
                const formRequiresBackground = (i+1) % 2;

                return(
                    <Paper key={index} sx={{background:formRequiresBackground ? null : "none", boxShadow:"none", padding:1, boxSizing:'border-box'}}>
                        
                        <Box display="flex" justifyContent="space-between" paddingX={1}>
                            <Typography>{model} {index + 1}</Typography>
                            <IconButton size={'small'} onClick={() => {closeSingleForm(index)}}>
                                <Close/>
                            </IconButton>
                        </Box>

                        <ModelForm 
                            index={index}
                            modelOptions={modelOptions}
                            onChange={updateObjFormsData}
                            formState={creationForms}
                            layout={props.formLayout ? props.formLayout : undefined} 
                            excludeReadOnly
                        />

                    </Paper>
                )
            })
        }
        
        <Box sx={{marginY:1}}>
            <Button startIcon={<Add/>} color={'success'} onClick={increaseFormFieldComponents}>
                Add {model}
            </Button>
        </Box>

    </CustomDialog>
  )
}

export default CreateObjectsButton