import { Autocomplete, FormControl, FormHelperText, InputLabel, OutlinedInput, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { ModelAutoComplete } from './ModelAutoComplete';

const toHtmlInputDate = date => {
    const _date = new Date(date);
    return `${_date.getFullYear()}-${String(_date.getMonth() + 1).padStart(2, '0')}-${String(_date.getDate()).padStart(2, '0')}T${String(_date.getHours()).padStart(2,'0')}:${String(_date.getMinutes()).padStart(2, '0')}`
}

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

    const {disabled, fieldName, fieldDetails, updateFieldData, htmlInputId} = props;
    const fieldError =  fieldDetails.errors.length > 0;

    const updateValues = (onChangeEvent, newValue=undefined) => {
        if(newValue == null){
            updateFieldData(fieldName, onChangeEvent.target.value);
            return;
        }
        updateFieldData(fieldName, newValue);
    };

    // Formatted Data
    const fieldIsDisabled = disabled ? true : fieldDetails.read_only;

    switch(fieldDetails.type){
        case 'choice':
            // Autocomplete/Select Style Input.
            const getOptionLabelFn = option => {
                return fieldDetails.choices.find( choice => (
                    choice.value == option
                ))?.display_name
            }

            const fieldOptions = fieldDetails.choices.map(choice => choice.value);

            return(
                <Autocomplete
                id={htmlInputId}
                options={fieldOptions}
                disabled={fieldIsDisabled}
                required={fieldDetails.required}
                error={fieldError}
                getOptionLabel={getOptionLabelFn}
                renderInput={ (params) => (
                    <TextField
                        {...params}
                        sx={{flexGrow:"2"}} 
                        label={fieldDetails.label}
                        helperText={fieldDetails.errors.toString()}
                        FormHelperTextProps={{error:fieldError}}
                    />
                )}
                value={fieldDetails.current}
                onChange={(_e, newValue) => {updateValues(_e, newValue)}}
                /> 
            );

        case 'computed value':
            return(
                <TextField disabled={fieldIsDisabled} inputProps={{sx:{width:"100%"}}} sx={{flexGrow:"2"}} label={fieldName} value={fieldDetails.current}/>
            );
        case 'datetime':
            // Const datetime input type with customized label styling.
            let _formattedValue = null;
            if (fieldDetails.current != null){
                _formattedValue = toHtmlInputDate(fieldDetails.current) 
            }
            return(
                <CustomFormControl  fieldError={fieldDetails.errors.toString()} helpText={fieldDetails.help_text}>
                    <InputLabel shrink variant="outlined" error={fieldError} for={htmlInputId}>
                        {fieldDetails.label}
                    </InputLabel>
                    
                    <OutlinedInput
                        id={htmlInputId}
                        type="datetime-local"
                        disabled={fieldIsDisabled}
                        value={_formattedValue}
                        label={fieldDetails.label}
                        notched={true}
                        onChange={(_e, newValue) => {updateValues(_e, _e.target.value)}}
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
                field={{fieldName,...fieldDetails}}
                dataModel={fieldDetails.related_model_name}
                disabled={fieldIsDisabled}
                inputId={htmlInputId}
                onChange={updateValues}
                />
            );
        default:
            // Standard HTML Input w/ Specified 'Type'
            return(
                <CustomFormControl fieldError={fieldDetails.errors.toString()} helpText={fieldDetails.help_text}>
                <InputLabel variant="outlined" error={fieldError} for={htmlInputId}>
                    {fieldDetails.label}
                </InputLabel>
                <OutlinedInput
                    id={htmlInputId}
                    type={fieldDetails.type}
                    disabled={fieldIsDisabled}
                    value={fieldDetails.current}
                    label={fieldDetails.label}
                    onChange={(_e, newValue) => {updateValues(_e, _e.target.value)}}
                    error={fieldError}
                    required={fieldDetails.required}
                />
                </CustomFormControl>
            );
    }

}

export default DynamicInput;