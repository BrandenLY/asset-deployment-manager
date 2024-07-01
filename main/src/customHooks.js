import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FormControl, InputLabel, OutlinedInput, Autocomplete, TextField } from '@mui/material';
import { ModelAutoComplete } from './components/ModelAutoComplete';
import { backendApiContext } from './context';
import DynamicInput from './components/DynamicInput';


// CUSTOM HOOKS
export const useBackend = ({model, id=null, makeInfinate=false}) => {
    const apiBaseUrl = "http://127.0.0.1:8000/api/";
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

export const useModelFormFields = ({modelOptions, id=null, excludeReadOnly=false}) => {
    // State
    const [fields, setFields] = useState({});

    // Callback Functions
    const updateFieldData = useCallback((fName, newValue) => {
        setFields((previous) => {
            const tmp = {...previous}
            tmp[fName] = {...previous[fName], current:newValue}
            return tmp
        })
    })

    const updateFieldErrors = (fieldErrors) => {
        setFields(previous => {

            const tmp = {...previous}
            Object.entries(fieldErrors).forEach(([fName, fErrors], index) => {
                tmp[fName].errors = fErrors;
            })
            
            return tmp

        })
    };



    useEffect(() => {
        
        // Effect : Update 'fields' state object to have have proper keys, and add initial data if required.
                
        if(modelOptions.isLoading){
            // We do not want to run this effect if we have not received the model options from the backend. 
            // have not received the model options from the backend.
            return;
        }

        Object.entries(modelOptions.data.model_fields).forEach( ([fieldName, fieldDetails], index) => {

            // Skip read-only fields
            if(fieldDetails.read_only && excludeReadOnly){
                return;
            }

            //!FIXME: Does not generate unique input id's when multiple forms for the same model are loaded.
            const htmlInputId = `${modelOptions.model}-${fieldName}-${index}-input`;

            // Update 'fields' state
            setFields(previous => {
                const tmp = {...previous};
                tmp[fieldName] = {
                    current: null,
                    errors: new Array(),
                    inputComponent: (
                        <DynamicInput fields={fields} {...{fieldName, fieldDetails, updateFieldData, htmlInputId}} />
                    )
                }
                return tmp;
            })

            // // Construct Field object
            // const newFieldData = {
            //     current: null,
            //     errors: new Array(),
            //     inputComponent: (
            //         <DynamicInput fields={fields} {...{fieldName, fieldDetails, updateFieldData, htmlInputId}}/> 
            //     )
            // }

            // newFieldObjects[fieldName] = newFieldData;
        })

        // setFields(newFieldObjects);

    },[modelOptions.isLoading])

    return {fields, updateFieldData, updateFieldErrors}
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
