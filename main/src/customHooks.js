import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { useInfiniteQuery, useQuery, useQueries } from "@tanstack/react-query";
import { FormControl, InputLabel, OutlinedInput, Autocomplete, TextField, createTheme } from '@mui/material';
import { ModelAutoComplete } from './components/ModelAutoComplete';
import { backendApiContext } from './context';
import DynamicInput from './components/DynamicInput';
import { useLocation } from 'react-router-dom';


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

const userReducer = (prev, action) => {

    // Initialize state
    if(action.type == 'initializeState'){
        return {userDetailsLoaded:false, userPermissionsLoaded:false, userGroupsLoaded:false, groupPermissionsLoaded:false};
    }

    // Copy previous state
    let payload = {...prev};

    // Manipulate State
    switch (action.type){

        case 'addCallback':
            payload[action.fnName] = action.fn;
            break;

        case 'updateUserDetails':
            payload = {...payload,...action.query.data};
            payload.userDetailsLoaded = true;
            break;
        
        case 'updateUserPermissions':
            payload.user_permissions = action.queries.map(query => query.data);
            payload.userGroupsLoaded = true;
            break;

        case 'updateUserGroups':
            payload.groups = action.queries.map(query => query.data);
            payload.userGroupsLoaded = true;
            break;
        
        case 'updateGroupPermissions':
            const allGroupPermissions = action.queries.map(query => query.data);

            payload.groups.forEach( (group, groupIndex) => {

                let richGroupData = {...group, permissions:[]};
                group.permissions.forEach( (permission, permIndex) => {
                    const permissionData = allGroupPermissions.find(value => value.id == permission);
                    richGroupData.permissions[permIndex] = permissionData;
                });

                payload.groups[groupIndex] = richGroupData;

            });

            payload.groupPermissionsLoaded = true;
            break;
    }
    
    return payload;

}

export const useCurrentUser = props => {
    
    // State
    const [state, dispatch] = useReducer(userReducer, null);

    // Queries
    const userQuery = useQuery({
        queryKey:['user', 'current-user'],
        staleTime: 'Infinity'
    });
    const userQuerySuccessful = userQuery.isSuccess;

    const userPermissions = useQueries({
        queries: userQuerySuccessful ? userQuery.data.user_permissions.map( permission => ({
            queryKey: ['permission', permission],
            staleTime: 'Infinity'
        })) : []
    })
    const allUserPermissionQueriesSuccessful = userPermissions.length && userPermissions.every(query => query.isSuccess);

    const userGroups = useQueries({
        queries: userQuerySuccessful ? userQuery.data.groups.map( group => ({
            queryKey: ['group', group],
            staleTime: 1800000, // 30 min
            refetchOnWindowFocus: true
        })) : []
    });
    const allGroupQueriesSuccessful = userGroups.length && userGroups.every(query => query.isSuccess);

    const groupPermissions = useQueries({
        queries: allGroupQueriesSuccessful ? userGroups.map(groupQuery => groupQuery.data.permissions)
        .flat()
        .map( permission => ({
            queryKey: ['permission', permission],
            staleTime: 'Infinity'
        })) : []
    });
    const allGroupPermissionQueriesSuccessful = groupPermissions.length && groupPermissions.every(query => query.isSuccess); 

    // Effects
    useEffect(() => { // Initialize State
        dispatch({type:'initalizeState', queryData:userQuery});
    },[])

    useEffect(() => { // Update state with user details
        if(userQuery.isFetched){
            dispatch({type:'updateUserDetails', query:userQuery});
        }
    },[userQuery.isFetched]);

    useEffect(() => { // Update state with user permissions
        if(allUserPermissionQueriesSuccessful){
            dispatch({type:'updateUserPermissions', queries:userPermissions});
        }
    }, [allUserPermissionQueriesSuccessful]);

    useEffect(() => { // Update state with user groups
        if(allGroupQueriesSuccessful){
            dispatch({type:'updateUserGroups', queries:userGroups});
        }
    }, [allGroupQueriesSuccessful]);

    useEffect(() => { // Update state with user group permissions
        if(allGroupPermissionQueriesSuccessful){
            dispatch({type:'updateGroupPermissions', queries:groupPermissions});
        }
    }, [allGroupPermissionQueriesSuccessful]);



    return state;
}
export const usePermissionCheck = user => {
    

    const performCheck = useCallback((permissionCode) => {

        // Ensure user is loaded
        if (user == null || user == undefined){
            return false; // Deny Permission
        }

        // Bypass for superusers
        if (user.is_superuser){
            return true; // Allow Permission
        }
        
        // Bypass for staff verification
        if (permissionCode == 'IsAdminUser'){
            return user.is_staff; // Allow/Deny based on user's staff status.
        }

        // Ensure user groups and group permissions are loaded
        if (!user.userGroupsLoaded || !user.groupPermissionsLoaded){
            return false; // Deny Permission
        }
        // Ensure user permissions are loaded
        if(!user.user_permissions){
            return false; // Deny Permission
        }

        const allGroupPermissions = user.groups.map(g => g.permissions).flat();
        const allAvailablePermissions = [...allGroupPermissions, ...user.user_permissions];
        const userHasPermissionCode = allAvailablePermissions.map(p => p.codename).includes(permissionCode);

        return(userHasPermissionCode);

    }, [user]);

    return { check:performCheck }
}

export const useCustomTheme = props => {


    const baseTheme = createTheme();

    const [theme, setTheme] = useState(baseTheme);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Formatted Data
    const primaryDark = "#1F35FF";
    const primaryLight = "#6B7AFF";
    const secondaryDark = "#DE70FF";
    const secondaryLight = "#E697FF";

    useEffect(() => {
        setTheme(createTheme({
            palette: {
                mode: mediaQuery.matches ? "dark" : "light",
                primary: {
                    main: primaryDark,
                    light: primaryLight,
                    dark: primaryDark,
                    contrastText: "#FFFFFF"
                },
                secondary: {
                    main: secondaryDark,
                    light: secondaryLight,
                    dark: secondaryDark,
                    contrastText: "#000000"
                },
                text:{
                    primary: mediaQuery.matches ? "rgba(250, 240, 250, 0.87)" : "rgba(7, 0, 43, 0.87)",
                    secondary: mediaQuery.matches ? "rgba(250, 240, 250, 0.6)" : "rgba(7, 0, 43, 0.6)",
                    disabled: mediaQuery.matches ? "rgba(250, 240, 250, 0.38)" : "rgba(7, 0, 43, 0.38)"
                },
                conditions : {
                    0: {
                        label: 'Working',
                        main: baseTheme.palette.success.dark,
                        contrastText: baseTheme.palette.success.contrastText 
                    },
                    1: {
                        label: 'Damaged',
                        main: baseTheme.palette.error.dark,
                        contrastText: baseTheme.palette.error.contrastText
                    },
                    2: {
                        label: 'Faulty',
                        main: baseTheme.palette.warning.dark,
                        contrastText: baseTheme.palette.warning.contrastText
                    },
                    3: {
                        label: 'Lost',
                        main: baseTheme.palette.error.dark,
                        contrastText: baseTheme.palette.error.contrastText
                    },
                }
            },
            typography: {
                fontFamily: [
                    'Lato',
                    'sans-serif',
                    '"Apple Color Emoji"',
                    '"Segoe UI"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                ].join(','),
                h1: {
                    fontSize: "1.75em",
                    fontWeight: "bold",
                },
                h2: {
                    fontSize: "1.75em",
                    fontWeight: "bold",
                    opacity: "80%",
                },
                h3: {
                    fontSize: "1.66em",
                    fontWeight: "bold",
                },
                h4: {
                    fontSize: "1.66em",
                    fontWeight: "bold",
                    opacity: "80%",
                },
                h5: {
                    fontSize: "1.50em",
                    fontWeight: "bold",
                },
                h6: {
                    fontSize: "1.50em",
                    fontWeight: "bold",
                    opacity: "80%",
                },
                navtitle: {
                    fontSize: "1.75rem",
                    fontWeight: "500",
                    textTransform: "uppercase",
                },
                brandFont1: {
                    fontFamily: 'Lato',
                    fontWeight: 'bold',
                    fontSize: '2em'
                },
                brandFont1: {
                    fontFamily: 'Montserrat',
                    fontSize: '1.5em'
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
                },
                dataPointLabel: {
                    fontSize: "0.80em",
                    fontWeight: "bolder",
                    opacity: "60%",
                }
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {fontWeight:'bold'},
                        containedPrimary: {
                            backgroundColor: primaryDark
                        },
                        outlinedPrimary: {
                            color: mediaQuery.matches ? primaryLight : primaryDark,
                            borderColor: mediaQuery.matches ? primaryLight : primaryDark,
                            borderWidth: "2px"
                        }
                    }
                },
                MuiLink: {
                    styleOverrides: {
                        root: {
                            color: secondaryDark
                        }
                    }
                },
                MuiCheckbox: {
                    styleOverrides: {
                        root: {
                            color: 'inherit', // Makes the checkbox use the text color
                        },
                    },
                    defaultProps: {
                        sx: {
                            color: 'text.primary', // Ensure it aligns with the primary text color
                            '&.Mui-checked': {
                            color: 'text.primary',
                            },
                        },
                    },
                },
            }
        }));
    }, [_]) // Update styles

    useEffect(() => {
        
        mediaQuery.addEventListener('change', forceUpdate);

        return (() => {
            mediaQuery.removeEventListener('change', forceUpdate);
        })

    }, [])// Register event listener & cleanup function

    return theme;
}

export const useResetErrorOnNavigate = resetError => {

    const location = useLocation();
  
    useEffect(() => {
      resetError();
    }, [location, resetError]);
};