import { Autocomplete, FormControl, FormHelperText, InputLabel, OutlinedInput, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { ModelAutoComplete } from './ModelAutoComplete';


const CustomFormControl = (props) => {
    
    const {helpText,fieldError} = props;

    return(
      <FormControl fullWidth>
  
      {props.children}
  
      {!!props.helpText ? (
        <FormHelperText children={props.helpText} />
      ) : null}
  
      
      {!!props.fieldError ? (
        <FormHelperText children={props.fieldError} sx={{color:"error.main"}}/>
      ) : null}
      </FormControl>
    )
};

const DynamicInput = props => {

    const {fieldName, fieldDetails, updateFieldData, htmlInputId} = props;
    const fieldError = fieldDetails.errors.length > 0;


    const updateValues = (onChangeEvent, newValue) => {
        updateFieldData(fieldName, newValue);
    };

    switch(fieldDetails.type){
        case 'choice':
            return(
                <Autocomplete
                sx={{width:"100%"}}
                id={htmlInputId}
                options={fieldDetails.choices}
                disabled={fieldDetails.read_only}
                required={fieldDetails.required}
                error={fieldError}
                getOptionLabel={option => option.display_name}
                renderInput={(params) => <TextField inputProps={{sx:{width:"100%"}}} sx={{flexGrow:"2"}} {...params} label={fieldName} helperText={fieldDetails.errors.toString()} FormHelperTextProps={{error:fieldError}}/>}
                value={fieldDetails.current}
                onChange={updateValues}
                />  
            );
        case 'computed value':
            return(
                <TextField disabled={fieldDetails.read_only} inputProps={{sx:{width:"100%"}}} sx={{flexGrow:"2"}} label={fieldName} />
            )
        case 'datetime':
            return(
                <CustomFormControl  fieldError={fieldDetails.errors.toString()} helpText={fieldDetails.help_text}>
                <InputLabel shrink variant="outlined" error={fieldError} for={htmlInputId}>
                    {fieldName}
                </InputLabel>
        
                <OutlinedInput
                    id={htmlInputId}
                    type="datetime-local"
                    disabled={fieldDetails.read_only}
                    value={fieldDetails.current}
                    label={fieldName}
                    notched={true}
                    onChange={updateValues}
                    error={fieldError}
                    required={fieldDetails.required}
                    sx={{appearance:"none"}}
                />
                </CustomFormControl>
            );
        case 'related object':
            // Autocomplete/Select Style Input.
            return(
                <ModelAutoComplete
                value={fieldDetails.current}
                field={{fieldName,...fieldDetails}}
                isEditing={true}
                inputId={htmlInputId}
                onChange={updateValues}
                error={fieldError}
                helpText={fieldDetails.errors.toString()}
                />
            );
        default:
            // Standard HTML Input w/ Specified 'Type'
            return(
                <CustomFormControl fieldError={fieldDetails.errors.toString()} helpText={fieldDetails.help_text}>
                <InputLabel variant="outlined" error={fieldError} for={htmlInputId}>
                    {fieldName}
                </InputLabel>
        
                <OutlinedInput
                    id={htmlInputId}
                    type={fieldDetails.type}
                    disabled={fieldDetails.read_only}
                    value={fieldDetails.current}
                    label={fieldName}
                    onChange={updateValues}
                    error={fieldError}
                    required={fieldDetails.required}
                />
                </CustomFormControl>
            );
    }

}

export default DynamicInput;