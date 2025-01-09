import React, { useCallback, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";

export const ModelAutoComplete = props => {

    const {field, dataModel, disabled, inputId, onChange, helpText, inputProps={}} = props;

    // Queries
    const data = useInfiniteQuery({
        queryKey: [dataModel],
        enabled: !disabled
    });

    // Effects
    useEffect(() => {

        if (data.isFetching || !data.hasNextPage){
            return;
        }

        data.fetchNextPage();

    },[data.isFetching, data.hasNextPage])

    // Callback functions
    const internalOnChange = useCallback((e, reason) => {

        // Set clear action to null instead of undefined.
        if (reason == "clear"){
            onChange(e, null);
        }
        else {
            onChange(e);
        }

    }, [onChange])

    // Formatted Data
    const error = field.errors.length > 0;
    const errors = field.errors.toString();
    const dataOptions = data.data?.pages.map(p => p.results).flat().map( result => result);

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
            loading={data.hasNextPage ? true : data.isFetching}
        />
    );
};
