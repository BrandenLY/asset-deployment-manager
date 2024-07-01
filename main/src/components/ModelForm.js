import React, {useEffect} from 'react'
import DynamicInput from './DynamicInput';
import { Box, Grid, Typography } from '@mui/material';

const ModelForm = props => {
    
    // State Variables
    const {index, modelOptions, onChange:externalOnChange, layout, formState, excludeReadOnly} = props;

    // Effects
    useEffect(() => { // Configure initial data based on model options.

        if(modelOptions.isLoading || formState[index]){
            // We do not want to run this effect if we
            // have not received the model options from the backend.
            return;
        }

        // Instantiate initial values
        const initialFieldValues = {};
        Object.entries(modelOptions.data.model_fields)
            .forEach(
            ([fieldName, fieldDetails], index) => {

                // Skip non required fields
                if(fieldDetails.read_only && excludeReadOnly){
                    return;
                }

                // Add initial field values
                initialFieldValues[fieldName] = {...fieldDetails, current:null, errors:[]}
            }
        )

        // Update state with initial values
        externalOnChange(index, initialFieldValues);

    }, [modelOptions])

    // Callback Functions
    const updateFieldData = (fieldName, value) => {
        externalOnChange(index, value, fieldName=fieldName);
        return;
    } 

    // Formatted Data
    const formStateExists = typeof formState[index] != 'undefined';
    const erroneousFormFields = formStateExists ? Object.entries(formState[index]).filter(([fieldName, fieldData]) => fieldData.errors.length > 0) : [];

    if(layout != undefined){
        return(
            <Grid container spacing={1} sx={{padding:0, margin:0, maxWidth: "100%"}}>
                {formStateExists &&
                    layout.map( row => {
                        const colSpan = 12 / row.length;
                        return ( row.map( cell => {

                            if(cell == null){
                                return(<Grid item xs={colSpan} />)
                            }

                            else{
                                const _field = formState[index][cell];
                                const htmlInputId = `${modelOptions.data.model}-form-${index}-field-${cell}`;
                                return(
                                    <Grid item xs={colSpan}> 
                                        <DynamicInput fieldName={cell} fieldDetails={_field} {...{updateFieldData, htmlInputId}}/>
                                    </Grid>
                                )
                            }
                        }))
                    })
                }
            </Grid>
        )
    }

    else{
        return (
            <Grid container spacing={2} sx={{padding:0, margin:0, maxWidth: "100%"}}>
                {formStateExists &&
                    Object.entries(formState[index]).map(([fieldName, fieldInfo], fieldIndex) => {
                        const htmlInputId = `${modelOptions.data.model}-form-${index}-field-${fieldName}`;
                        return(
                            <Grid item xs={6}> 
                                <DynamicInput {...{fieldName, fieldDetails:fieldInfo, updateFieldData, htmlInputId}}/>
                            </Grid>
                        )
                    })
                }
            </Grid>
          )
    }
}

export default ModelForm;