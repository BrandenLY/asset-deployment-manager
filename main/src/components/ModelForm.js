import React, {useEffect} from 'react'
import DynamicInput from './DynamicInput';
import { Grid } from '@mui/material';
import { useModelOptions } from '../customHooks';

const GridStyles = {padding:0, paddingRight:1, margin:0, maxWidth: "100%"};

const ModelForm = props => {

    // Renders all of the html input fields required to manipulate, and 
    
    // State Variables
    const {
        index,
        model,
        formState,
        layout,
        disabled = false,
        excludeReadOnly = false,
        onChange:externalOnChange = () => {}
    } = props;

    if(formState == undefined){
        throw new Error('Modelform did not receive any formState.')
    }

    if(model == undefined){
        throw new Error('Modelform did not receive any model.')
    }

    // Callback Functions
    
    const updateFieldData = (fieldName, value) => {

        externalOnChange(index, fieldName, value);

    }

    return(
        <Grid container spacing={1} sx={GridStyles}>
            {
                layout != undefined ?
                layout.map( row => {
                    const colSpan = 12 / row.length;
                    return (
                        row.map( cell => {
                            if(cell === null){
                                // Insert intentional whitespace into the grid layout.
                                return <Grid item xs={colSpan}/> 
                            }
                            else{
                                // Render input field
                                const field = formState[cell]
                                const htmlInputId = `${model}-form-${index}-field-${cell}`;
                                return (
                                    <Grid item xs={colSpan}> 
                                        <DynamicInput 
                                            fieldName={cell}
                                            fieldDetails={field}
                                            {...{disabled, updateFieldData, htmlInputId}}
                                        />
                                    </Grid>
                                )
                            }
                        })
                    )
                }) :
                Object.entries(formState).map(([fieldName, fieldDetails]) => {
                    const htmlInputId = `${model}-form-${index}-field-${fieldName}`;
                    return (
                        <Grid item xs={6}> 
                            <DynamicInput 
                                fieldName={fieldName}
                                fieldDetails={fieldDetails}
                                {...{disabled, updateFieldData, htmlInputId}}
                            />
                        </Grid>
                    );
                })
            }
        </Grid>
    );
}

export default ModelForm;