import React , {useContext} from "react";
import { Autocomplete, InputLabel, TextField } from "@mui/material";
import { backendApiContext } from "../context";
import { useInfiniteQuery } from "@tanstack/react-query";

export const ModelAutoComplete = props => {

    const {field, disabled, inputId, onChange, helpText} = props;
    const backendCtx = useContext(backendApiContext);

    const data = useInfiniteQuery({
        queryKey: [field.related_model_name],
        enabled: !disabled
    })

    const dataOptions = data.data?.pages.map(p => p.results).flat().map( result => {
        return({...result, label:backendCtx.models[field.related_model_name].getLabelName(result)})
    });

    // Formatted Data
    const error = field.errors.length > 0;
    const errors = field.errors.toString();
    return (
        <Autocomplete
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
