import React, { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FormControl, InputLabel, OutlinedInput, Autocomplete, TextField } from '@mui/material';
import { ModelAutoComplete } from './components/ModelAutoComplete';


const apiBaseUrl = "http://127.0.0.1:8000/api/";

export const useBackend = ({model, id=null, makeInfinate=false}) => {
    const formattedUrl = new URL(`${apiBaseUrl}${model}/${id ? id + "/" : ""}`);
    const defaultStaleTime = 1000 * 60 * 15;
    const queryKey = [model, id];

    if (makeInfinate) {
        return useInfiniteQuery({
            queryKey: queryKey + "infinate",
            queryFn: async ({pageParam = 1}) => {
                formattedUrl.searchParams.set('page', pageParam)
                const res  = await fetch(formattedUrl);
                const data = await res.json()
                return data;
            },
            getNextPageParam: (lastPage, pages) => {
                if (lastPage.next) {
                    const nextPage = new URL(lastPage.next);
                    return nextPage.searchParams.get('page');
                }
                return undefined;
            },
            hasNextPage: (lastPage, pages) => new Boolean(lastPage.next),
            staleTime : defaultStaleTime,
        })
    }

    return useQuery({
        queryKey : queryKey,
        queryFn : async () => {
            const res = await fetch(formattedUrl);
            const data = await res.json()
            return data;
        },
        staleTime : defaultStaleTime,
    })
};

export const useRichQuery = ({model,id}) => {

    // Queries on certain models may need more than one query to retrieve data for related models.
    // This hook returns an object containing the initial query as well as any related queries.

    // State vars
    const [isLoading, setIsLoading] = useState(true);
    const initialQuery = useQuery({
        queryKey:[model.modelName,id],
    })
    let relatedQueries = {};
    
    // Instantiate related-model queries
    model.fields.forEach(field => {
        if ( field.related?.modelName ){ // This field requires an additional fetch.

            let relatedObjectId = initialQuery.data?.[field.name]

            Object.defineProperty(relatedQueries, field.name, {
                value: useQuery({
                    queryKey : [field.related.modelName, relatedObjectId],
                    enabled : !!initialQuery.data && !!relatedObjectId
                }),
                configurable: true,
                writable: true,
                enumerable: true
            });

        }
    })

    // Update holistic loading status
    useEffect(() => {

        if (initialQuery.data){

            setIsLoading([
                initialQuery.isLoading, 
                ...(Object.entries(relatedQueries).map(
                    ([qName, qValue]) => qValue.isLoading && !!initialQuery.data[qName]
                ))
            ].includes(true))
        
        }

    })
    

    // Get drilled query data
    let value = null
    if (!isLoading) {
        value = {...initialQuery.data}
        Object.entries(relatedQueries).forEach(([model, Q]) => {
            value[model] = Q.data ? Q.data : null;
        })
    }

    // Return initial query reponse, related query reponses, and holistic loading state.
    return {value, isLoading, initialQuery, relatedQueries};
};

export const useModelFormFields = ({model, id=null, excludeReadOnly=false}) => {
    // State
    const [fields, setFields] = useState({});

    const updateFn = useCallback((fieldName, newValue) => {
        setFields((previous) => {
            const tmp = {...previous}
            tmp[fieldName] = {...previous[fieldName], currentValue:newValue}
            return tmp
        })
    })

    const clearErrors = () => {
        setFields(previous => {
            const tmp = {...previous};
            Object.entries(tmp).forEach(([property,value]) => {
                tmp[property] = {...value, errors:[]}
            })
            console.log(tmp)
            return tmp
        })
    }

    const addFieldErrors = (fieldName, message) => {
        setFields(previous => {
            let tmp = {...previous}
            tmp[fieldName].errors.push(message);

            return tmp
        })
    }

    useEffect(() => {
        // Dynamic state variables
        model.fields.forEach( field => {

            if (!(excludeReadOnly && field.readOnly)){
                setFields(previous => {

                    const tmp = {
                        ...previous
                    }
    
                    tmp[field.name] = {
                        currentValue: null,
                        errors: [],
                        component: (
                            getHtmlInput(field, fields, updateFn)
                        ),
                    }
    
                    return tmp
                })
            }

        })
    },[])

    return {fields, addFieldErrors, clearErrors}
};

export const useModelOptions = (modelName) => {
    return useQuery({
        queryKey: [modelName, 'OPTIONS'],
        staleTime: 'Infinity',
        queryFn: async ({queryKey}) =>{

            const formattedUrl = new URL(
                `${window.location.protocol}${window.location.host}/api/${queryKey[0]}/`
              )
          
            const res = await fetch(formattedUrl, {method:'OPTIONS'});
            const data = await res.json();
            return data;
          }
    })
}

export const CustomFormControl = (props) => {
  
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

const getHtmlInput = (field, state, updateFn) => {
    const htmlInputId = `shipment-${field.name}`;

    if (field.inputType == 'autoComplete' && field.related) {
        return (
            <ModelAutoComplete
            value={state?.[field.name]}
            field={field}
            isEditing={true}
            inputId={htmlInputId}
            onChange={(e, v) => updateFn(field.name, v)}
            error={state?.[field.name]?.errors.length > 0}
            />
        );
    } 
    
    
    else if (field.inputType == 'autoComplete' && field.options) {
    
        const dataOptions = field.options.map(
            optionValue => {
            return({
                id: field.options.indexOf(optionValue),
                label: optionValue
            })
            }
        )
    
        return(
            <Autocomplete
            sx={{width:"100%"}}
            id={htmlInputId}
            options={dataOptions}
            disabled={field.readOnly}
            renderInput={(params) => <TextField inputProps={{sx:{width:"100%"}}} sx={{flexGrow:"2"}} error={state?.[field.name]?.errors.length > 0} {...params} label={field.name} />}
            value={state?.[field.name]}
            onChange={(e, v) => updateFn(field.name, v)}
            />  
        );
    } 
    
    
    
    else {
        return (
            <CustomFormControl fieldError={state?.[field.name]?.errors.length > 0} sx={{width:"100%"}}>
            <InputLabel shrink variant="outlined" error={!!state?.[field.name]?.errors}>
                {field.name}
            </InputLabel>
    
            <OutlinedInput
                id={htmlInputId}
                type={field.inputType}
                disabled={field.readOnly}
                value={state?.[field.name]}
                label={field.name}
                notched={true}
                onChange={(e, v) => updateFn(field.name, e.target.value)}
                error={state?.[field.name]?.errors.length > 0}
            />
            </CustomFormControl>
        );
    }
}

