import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";

export const ModelAutoComplete = props => {

    const {field, dataModel, disabled, inputId, onChange, helpText, inputProps={}} = props;

    // fetch
    const data = useInfiniteQuery({
        queryKey: [dataModel],
        enabled: !disabled
    })

    const dataOptions = data.data?.pages.map(p => p.results).flat().map( result => result);

    // Formatted Data
    const error = field.errors.length > 0;
    const errors = field.errors.toString();

    return (
        <Autocomplete
            {...inputProps}
            id={inputId}
            options={dataOptions}
            disabled={disabled}
            renderInput={(params) => <TextField error={error} {...params} label={field.label} helperText={error ? errors : field.help_text} FormHelperTextProps={{error:error}}/>}
            value={field.current}
            onChange={onChange}
            error={error}
            label={field.label}
        />
    );
};
