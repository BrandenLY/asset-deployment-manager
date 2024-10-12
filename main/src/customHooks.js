import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { useInfiniteQuery, useQuery, useQueries } from "@tanstack/react-query";
import { FormControl, InputLabel, OutlinedInput, Autocomplete, TextField, createTheme } from '@mui/material';
import { ModelAutoComplete } from './components/ModelAutoComplete';
import { backendApiContext } from './context';
import DynamicInput from './components/DynamicInput';


// CUSTOM HOOKS
export const useRichQuery = props => {

    // Queries on certain models may need more than one query to retrieve data for related models.
    // This hook returns an object containing the initial query as well as any related queries.
    const {modelOptions, id} = props;

    // State vars
    const [allQueriesLoaded, setAllQueriesLoaded] = useState(false);

    const initialQuery = useQuery({
        enabled: modelOptions.data != undefined,
        queryKey:[modelOptions.data?.model, id],
    })

    // Instantiate related-model queries
    let relatedQueries = useQueries({
        queries: !modelOptions.isLoading && !initialQuery.isLoading ?
            Object.entries(modelOptions.data.model_fields)
            .filter( ([_, fieldDetails]) => fieldDetails.type == 'related object' )
            .filter( ([fieldName, _]) => initialQuery.data[fieldName] != null)
            .map( ([fieldName, fieldDetails], _ ) => {

                let relatedObjectId = initialQuery.data?.[fieldName];
                return({
                    meta : {fieldName},
                    queryKey : [fieldDetails.related_model_name, relatedObjectId, {fieldName}],
                    queryFn: async ({ queryKey, meta }) => {
                        const formattedUrl = new URL(
                          `${window.location.protocol}${window.location.host}/api/${queryKey[0]}/${
                            !!queryKey.at(1) ? queryKey.at(1) + "/" : ""
                          }`
                        );
                      
                        const res = await fetch(formattedUrl);
                        const data = await res.json();
                        return {...data, ...meta}
                      }
                })

            }) : [],
    });


    // Update holistic loading status
    useEffect(() => {

        const additionalQueriesStatuses = [...Object.values(relatedQueries).map(query => query.isLoading)];
        const additionalQueriesLoading = additionalQueriesStatuses.includes(true);

        const _allQueriesLoaded = !initialQuery.isLoading && !additionalQueriesLoading;
        if (_allQueriesLoaded) {
            setAllQueriesLoaded(true);
        }

        // Execute every time one of the queries loading statuses is updated.
    }, [initialQuery.isLoading, ...Object.values(relatedQueries).map(query => query.isLoading)])

    // Get drilled query data
    let value = null

    if (allQueriesLoaded) {
        value = {...initialQuery.data}
        relatedQueries.forEach(q => value[q.data.fieldName] = {...q.data, fieldName:undefined});
    }

    // Return initial query reponse, related query reponses, and holistic loading state.
    return {value, isLoading:!allQueriesLoaded, initialQuery, relatedQueries};
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

    if (modelName == undefined || modelName == null){
        throw new Error("Custom hook 'useModelOptions' requires a modelName.")
    }
    
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

const userReducer = (prev, dispatchData) => {

    switch (dispatchData.action){

        case 'addCallback':
            let tmp = {...prev};
            tmp[dispatchData.fnName] = dispatchData.fn;

            return tmp;

        case 'updateQueryInfo':
            return {...prev, ...dispatchData.queryData};

        case 'initializeState':
            let initialState = {...dispatchData.queryData}
            return initialState;
    }

}

export const useCurrentUser = props => {

    const userQuery = useQuery({
        queryKey:['user', 'current-user'],
        staleTime: 'Infinity'
    });
    const [state, dispatch] = useReducer(userReducer, null);

    useEffect(() => {
        dispatch({action:'initalizeState', queryData:userQuery});
    },[])

    useEffect(() => {
        dispatch({action:'updateQueryInfo', queryData:userQuery});
    },[userQuery.isFetched]);

    useEffect(() => {
        dispatch({action:'addCallback', fnName:"checkPermission", fn:checkPermission})
    }, [state?.data]);

    // Check to see if a user has permission to perform a specific action.
    const checkPermission = useCallback(permissionCode => {

        if (state === null){
            return false;
        }

        if (state.data?.is_superuser){
            return true;
        }

        const perm = state.data.user_permissions.find( p => p.codename == permissionCode );
        return(perm != undefined);

    }, [state?.data])

    return state;
}

export const useCustomTheme = props => {


    const baseTheme = createTheme();
    const [theme, setTheme] = useState(baseTheme);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Formatted Data
    const primaryDark = "#07002B";
    const primaryLight = "#44148e";
    const secondaryDark = "#BF104E";
    const secondaryLight = "#F35588";

    useEffect(() => {
        setTheme(createTheme({
            palette: {
                mode: mediaQuery.matches ? "dark" : "light",
                primary: {
                    main: mediaQuery.matches ? primaryDark : primaryLight,
                    light: primaryLight,
                    dark: "#07002B",
                    contrastText: "#CBC6DE"
                },
                secondary: {
                    main: secondaryDark,
                    light: secondaryLight,
                    dark: secondaryDark,
                    contrastText: "#FFFFFF"
                },
                text:{
                    primary: mediaQuery.matches ? "rgba(250, 240, 250, 0.87)" : "rgba(7, 0, 43, 0.87)",
                    secondary: mediaQuery.matches ? "rgba(250, 240, 250, 0.6)" : "rgba(7, 0, 43, 0.6)",
                    disabled: mediaQuery.matches ? "rgba(250, 240, 250, 0.38)" : "rgba(7, 0, 43, 0.38)"
                },
                conditions : {
                    working: {
                        main: baseTheme.palette.success.dark,
                        contrastText: baseTheme.palette.success.contrastText 
                    },
                    damaged: {
                        main: baseTheme.palette.error.dark,
                        contrastText: baseTheme.palette.error.contrastText
                    },
                    faulty: {
                        main: baseTheme.palette.warning.dark,
                        contrastText: baseTheme.palette.warning.contrastText
                    },
                    lost: {
                        main: baseTheme.palette.error.dark,
                        contrastText: baseTheme.palette.error.contrastText
                    },
                }
            },
            typography: {
                h1: {
                    fontSize: "2.5rem",
                },
                h2: {
                    fontSize: "2.25rem",
                },
                h3: {
                    fontSize: "2rem",
                },
                h4: {
                    fontSize: "1.75rem",
                },
                h5: {
                    fontSize: "1.5rem",
                },
                h6: {
                    fontSize: "1.25rem",
                },
                navtitle: {
                    fontSize: "1.75rem",
                    fontWeight: "500",
                    textTransform: "uppercase",
                },
                projectDetailHeading: {
                    fontSize: "1.25rem",
                },
                ProjectDetailLabel: {
                    fontSize: "medium",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                },
                personInitial: {
                    textTransform: "uppercase",
                },
                formHeader: {
                    opacity: "75%",
                    fontSize: "1.6rem",
                    lineHeight: "40px",
                },
                formErrorText: {
                    color: baseTheme.palette.error.dark,
                },
                moreInfoIcon: {
                    display: "block",
                    fontSize: "8px",
                    fontWeight: baseTheme.typography.fontWeightBold,
                    width: "14px",
                    height: "14px",
                    borderRadius: "14px",
                    lineHeight: "14px",
                    backgroundColor: "RGBA(08,08,08,0.46)",
                    textAlign: "center",
                    cursor: "pointer"
                },
                code: {
                    backgroundColor: "rgba(18, 18, 18, 0.33)",
                    borderRadius: 2,
                    padding: baseTheme.spacing(1),
                    paddingTop: 0,
                    paddingBottom: 0,
                    display: "inline-block",
                    color: "rgba(250, 240, 250, 0.87)"
                }
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        containedPrimary: {
                            backgroundColor: primaryLight
                        },
                        outlinedPrimary: {
                            color: primaryLight,
                            borderColor: primaryLight
                        }
                    }
                },
                MuiLink: {
                    styleOverrides: {
                        root: {
                            color: secondaryDark
                        }
                    }
                }
            }
        }));
    }) // Update styles

    useEffect(() => {
        
        mediaQuery.addEventListener('change', forceUpdate);

        return (() => {
            mediaQuery.removeEventListener('change', forceUpdate);
        })

    }, [])// Register event listener & cleanup function

    return theme;
}