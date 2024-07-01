import React , {useContext} from "react";
import { Autocomplete, InputLabel, TextField } from "@mui/material";
import { backendApiContext } from "../context";
import { useInfiniteQuery } from "@tanstack/react-query";

export const ModelAutoComplete = props => {

    const {value, field, isEditing, inputId, onChange, error, helpText} = props;
    const backendCtx = useContext(backendApiContext);

    const data = useInfiniteQuery({
        queryKey: [field.related_model_name],
        enabled: isEditing
    })

    const dataOptions = data.data?.pages.map(p => p.results).flat().map( result => {
        return({...result, label:backendCtx.models[field.related_model_name].getLabelName(result)})
    });

    return (
        <>
            <Autocomplete
                id={inputId}
                options={dataOptions}
                disabled={field.readOnly ? true : !isEditing}
                renderInput={(params) => <TextField error={error} {...params} label={field.fieldName} helperText={helpText} FormHelperTextProps={{error:error}}/>}
                value={value}
                onChange={onChange}
                error={error}
            />
        </>
    );
};
