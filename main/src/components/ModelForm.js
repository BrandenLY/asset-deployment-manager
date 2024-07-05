import React, {useEffect} from 'react'
import DynamicInput from './DynamicInput';
import { Box, Grid, Typography } from '@mui/material';

const ModelForm = props => {
    
    // State Variables
    const {
        disabled,
        excludeReadOnly,
        onChange:externalOnChange,
        formState,
        index,
        initialValue,
        layout,
        modelOptions
    } = props;

    // Effects
    useEffect(() => { // Configure initial data based on model options.

        if(modelOptions.isLoading || formStateExists){
            // We do not want to run this effect if we
            // have not received the model options from the backend or,
            // the initial data is already loaded.
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

                // Ensure choices fields are populated with their display_name
                if('choices' in fieldDetails && initialValue){

                    const currentChoice = fieldDetails.choices.find(
                        choice => choice.value == initialValue[fieldName]
                    );
                    
                    initialFieldValues[fieldName] = {
                        ...fieldDetails, 
                        errors:[], 
                        current:currentChoice
                    };

                    return;

                }

                // Add initial field values
                initialFieldValues[fieldName] = {
                    ...fieldDetails, 
                    errors:[], 
                    current: initialValue ? initialValue[fieldName] : null
                }
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
    const formStateExists = (
        typeof index == 'number' ? 
        typeof formState[index] != 'undefined' && formState.length > 0 : 
        typeof formState != 'undefined'
    );

    let formData = {};
    if(formStateExists){
        formData = typeof index == 'number' ? formState[index] : formState;
    }

    if(layout != undefined){
        return(
            <Grid container spacing={1} sx={{padding:0, paddingRight:1, margin:0, maxWidth: "100%"}}>
                {formStateExists &&
                    layout.map( row => {

                        const colSpan = 12 / row.length;
                        return ( row.map( cell => {

                            // Add whitespace
                            if(cell == null){
                                return(<Grid item xs={colSpan} />)
                            }

                            // Add Form Field
                            else{

                                const _field = formData[cell]; 
                                const htmlInputId = `${modelOptions.data.model}-form-${index}-field-${cell}`;
                                return(
                                    <Grid item xs={colSpan}> 
                                        <DynamicInput disabled={disabled} fieldName={cell} fieldDetails={_field} {...{updateFieldData, htmlInputId}}/>
                                    </Grid>
                                )
                            }

                        }));

                    })
                }
            </Grid>
        )
    }

    else{
        return (
            <Grid container spacing={2} sx={{padding:0, margin:0, maxWidth: "100%"}}>
                {formStateExists &&
                    Object.entries(formData).map(([fieldName, fieldInfo], fieldIndex) => {

                        const htmlInputId = `${modelOptions.data.model}-form-${index ? index : 'generic'}-field-${fieldName}`;
                        return(
                            <Grid item xs={6}> 
                                <DynamicInput disabled={disabled} fieldName={fieldName} fieldDetails={fieldInfo} {...{ updateFieldData, htmlInputId}}/>
                            </Grid>
                        )
                    })
                }
            </Grid>
          )
    }
}

export default ModelForm;