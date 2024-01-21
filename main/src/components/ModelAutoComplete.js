import React , {useContext} from "react";
import { Autocomplete, InputLabel, TextField } from "@mui/material";
import { backendApiContext } from "../context";
import { useInfiniteQuery } from "@tanstack/react-query";

export const ModelAutoComplete = props => {

    const backendCtx = useContext(backendApiContext);

    const data = useInfiniteQuery({
        queryKey: [props.field.related.modelName],
        enabled: props.isEditing
    })

    const dataOptions = data.data?.pages.map(p => p.results).flat().map( result => backendCtx.models[props.field.related.modelName].getLabelName(result));

    return (
        <>
            <Autocomplete
                id={props.inputId}
                options={dataOptions}
                disabled={props.field.readOnly ? true : !props.isEditing}
                renderInput={(params) => <TextField {...params} label={props.field.name} />}
                value={props.value}
                onChange={props.onChange}
            />
        </>
    );
};
