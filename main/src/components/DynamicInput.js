import { Autocomplete, FormControl, FormHelperText, InputLabel, OutlinedInput, TextField } from '@mui/material';
import React, { useState } from 'react'
import { ModelAutoComplete } from './ModelAutoComplete';


const CustomFormControl = (props) => {
    
    const {id,helpText,fieldError} = props;

    return(
      <FormControl id={props.id} fullWidth>
  
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

    const {initialFieldValue, fieldName, fieldDetails, updateFieldData, htmlInputId} = props;
    const [value, setValue] = useState(initialFieldValue ? initialFieldValue : null);

    const updateValues = (onChangeEvent, newValue) => {
        setValue(newValue);
        updateFieldData(fieldName, newValue)
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
                getOptionLabel={option => option.display_name}
                renderInput={(params) => <TextField inputProps={{sx:{width:"100%"}}} sx={{flexGrow:"2"}} {...params} label={fieldName} />}
                value={value}
                onChange={updateValues}
                />  
            );
        case 'computed value':
            <TextField inputProps={{sx:{width:"100%"}}} sx={{flexGrow:"2"}} {...params} label={fieldName} />
        case 'datetime':
            return(
                <CustomFormControl fieldError={value?.errors.length > 0} sx={{width:"100%"}}>
                <InputLabel shrink variant="outlined" error={!!value?.errors} for={htmlInputId}>
                    {fieldName}
                </InputLabel>
        
                <OutlinedInput
                    id={htmlInputId}
                    type="datetime-local"
                    disabled={fieldDetails.read_only}
                    value={value}
                    label={fieldName}
                    notched={true}
                    onChange={updateValues}
                    error={value?.errors.length > 0}
                    sx={{appearance:"none"}}
                />
                </CustomFormControl>
            );
        case 'related object':
            // Autocomplete/Select Style Input.
            return(
                <ModelAutoComplete
                value={value}
                field={{fieldName,...fieldDetails}}
                isEditing={true}
                inputId={htmlInputId}
                onChange={updateValues}
                />
            );
        default:
            // Standard HTML Input w/ Specified 'Type'
            return(
                <CustomFormControl fieldError={value?.errors.length > 0} sx={{width:"100%"}}>
                <InputLabel variant="outlined" error={!!value?.errors} for={htmlInputId}>
                    {fieldName}
                </InputLabel>
        
                <OutlinedInput
                    id={htmlInputId}
                    type={fieldDetails.type}
                    disabled={fieldDetails.read_only}
                    value={value}
                    label={fieldName}
                    onChange={updateValues}
                    error={value?.errors.length > 0}
                />
                </CustomFormControl>
            );
    }

}

export default DynamicInput;