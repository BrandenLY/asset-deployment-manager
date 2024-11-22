import { Autocomplete, Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import React, { useState, useEffect } from 'react'
import { ModelAutoComplete } from './ModelAutoComplete';

const toHtmlInputDate = date => {
    const _date = new Date(date);
    return `${_date.getFullYear()}-${String(_date.getMonth() + 1).padStart(2, '0')}-${String(_date.getDate()).padStart(2, '0')}T${String(_date.getHours()).padStart(2,'0')}:${String(_date.getMinutes()).padStart(2, '0')}`
}

const CustomFormControl = (props) => {
    
    const {helpText, fieldError} = props;

    return(
      <FormControl fullWidth>
  
      {props.children}
  
      {!!helpText ? (
        <FormHelperText children={helpText} />
      ) : null}
  
      
      {!!fieldError ? (
        <FormHelperText children={fieldError} sx={{color:"error.main"}} />
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
                        error={fieldError}
                        helperText={fieldDetails.errors.toString()}
                        FormHelperTextProps={{error:fieldError}}
                    />
                )}
                value={fieldDetails.current}
                onChange={(_e, newValue) => {updateValues(_e, newValue)}}
                /> 
            );
        case 'boolean':
            return(
            <FormControlLabel
                label={fieldDetails.label}
                sx={{marginLeft:1}}
                control = {
                    <Checkbox
                        checked={fieldDetails.current}
                        onChange={e => {updateValues(e, e.target.checked)}}
                    />
                }
            />
            )
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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        format="LLL"
                        id={htmlInputId}
                        label={fieldDetails.label}
                        error={fieldError}
                        disabled={fieldIsDisabled}
                        value={dayjs(_formattedValue)}
                        onChange={(value, ctx) => {updateValues(null, value.toDate())}}
                        slotProps={{
                            field: {
                                fullWidth:true,
                                required: fieldDetails.required,
                            },
                            textField: {
                                error: fieldError,
                                helperText:fieldError ? fieldDetails.errors.toString(): fieldDetails.help_text
                            },
                        }}
                    />
                </LocalizationProvider>
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
                    onChange={e => {updateValues(e, e.target.value)}}
                    error={fieldError}
                    required={fieldDetails.required}
                />
                </CustomFormControl>
            );
    }

}

export default DynamicInput;