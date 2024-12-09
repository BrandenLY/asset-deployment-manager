import { Box, Button, Typography, useTheme } from '@mui/material';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react'
import SortingGrid from '../components/SortingGrid';
import ModelListControls from '../components/ModelListControls';
import { Edit, OpenInFull, Person } from '@mui/icons-material';
import CustomDialog from '../components/CustomDialog';
import { useModelOptions } from '../customHooks';
import ModelForm from '../components/ModelForm';
import UserGroupSelector from '../components/UserGroupSelector';
import { backendApiContext, notificationContext } from '../context';

// Constants
const MODELNAME = 'user';
const SORTINGGRIDDEFAULTCOLUMNS = ['email', 'first_name', 'last_name', 'is_active']
const CREATEOBJECTSFORMLAYOUT = [
    ['email', null],
    ['first_name', 'last_name'],
    ['is_active'],
    ['is_staff']
]
const DEFAULTUSERDETAILSFORMSTATE = {}

// Helper Functions
const USERDETAILSFORMREDUCER = (prev, action) => {

    let payload = {...prev};

    switch(action.type){
        
        case 'initial':
            break; // `prev` is assumed to be preferred initial data

        case 'loadOptions':
            
            // Loop over model_fields to populate state key/val pairs
            Object.entries(action.use.data.model_fields).forEach(([fieldName, fieldDetails]) => {
                payload[fieldName] = {...fieldDetails, current: null, errors: []};
            });
            break;

        case 'updateUserDetails':

            Object.entries(action.user).forEach(([fieldName, value]) => {
                if (payload.hasOwnProperty(fieldName)){
                    payload[fieldName].current = value;
                } else {
                    throw new Error(`Cannot update form state field '${fieldName}'; Invalid field.`)
                }
            });
            break;
        
        case 'addGroup':
            payload.groups.current = [...payload.groups.current, action.group]
            break;

        case 'removeGroup':
            payload.groups.current = [...payload.groups.current].filter(g => g != action.group)
            break;
        
        case 'updateField':
            payload[action.fieldName].current = action.value;
            break;
    }

    return payload;
}

// Primary Component
const UsersView = props => {

    // Props Destructuring
    const { } = props;

    // Hooks
    const theme = useTheme();
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);
    const userOptions = useModelOptions(MODELNAME);

    // State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetailsFormState, dispatchUserDetails] = useReducer(
        USERDETAILSFORMREDUCER,
        {...DEFAULTUSERDETAILSFORMSTATE},
        initialArg => USERDETAILSFORMREDUCER(initialArg, { type: 'initial' })
    );

    const [showEditDialog, setShowEditDialog] = useState(false);

    // Queries
    const users = useInfiniteQuery({queryKey: [MODELNAME]});

    // Mutations
    const updateUser = useMutation({
        mutationFn: payload => {
            console.log('mutating', payload);

            const updateUrl = new URL(`${backend.api.baseUrl}/user/${payload.id}/`);
            const requestHeaders = backend.api.getRequestHeaders(updateUrl);
        
            return fetch( updateUrl, {
                method:'PUT',
                headers: requestHeaders,
                body: JSON.stringify(payload)
            })

        },
        onError: async (error, payload, context) => {
            const message = new String(error);
            notifications.add({message, severity:'error'})
        },
        onSuccess: async (data, payload, context) => {
            if(!data.ok){
                const message = await data.json();
                message = new String(message);

                notifications.add({message, severity:'error'});
                return;
            }

            notifications.add({message: 'Successfully updated user.'})
        }
    })

    // Effects
    useEffect(() => { // Ensure all users are loaded

        if (users.isFetching || !users.hasNextPage){
            return;
        }
        
        users.fetchNextPage();

    }, [users.isFetching, users.hasNextPage]);

    useEffect(() => { // Update form state with user details

        // Verify user is not null
        if(selectedUser == null){
            return;
        }

        // Verify state is not blank
        if(JSON.stringify(userDetailsFormState) == JSON.stringify(DEFAULTUSERDETAILSFORMSTATE)){
            return;
        }

        // Update state
        dispatchUserDetails({type: 'updateUserDetails', user: selectedUser});
        
    }, [selectedUser]);

    useEffect(() => { // Update form state with user model fields
        if(userOptions.isSuccess){
            dispatchUserDetails({type: 'loadOptions', use: userOptions})
        }
    }, [userOptions.isSuccess]);

    // Callback Functions
    const selectUserForEdit = useCallback(user => {
        setSelectedUser(user);
        setShowEditDialog(true);
    }, []); // Updates selected user and displays edit dialog.

    const closeEditDialog = useCallback(e => {
        setShowEditDialog(false);
    }, []); // Hide user edit dialog.

    const selectUserGroup = useCallback(group => {
        dispatchUserDetails({type: 'addGroup', group})
    }, []);

    const deselectUserGroup = useCallback(group => {
        dispatchUserDetails({type: 'removeGroup', group})
    }, []);

    const updateUserField = useCallback((e, fieldName, newValue) => {
        dispatchUserDetails({type: 'updateField', fieldName, value:newValue})
    }, [])

    const saveUserDetails = useCallback(e => {

        // Format Payload
        const payload = {}

        Object.entries(userDetailsFormState)
        .filter(([fieldName, fieldDetails]) => {
            return fieldDetails.read_only === false; // Remove read_only fields
        })
        .filter(([fieldName, fieldDetails]) => {
            return fieldName !== 'password'; // Passwords should be validated
        })
        .forEach(([fieldName, fieldDetails]) => {
            payload[fieldName] = fieldDetails.current; // Update payload with field data
        });

        // Ensure id is also populated.
        payload.id = userDetailsFormState.id.current;

        // Mutate
        updateUser.mutate(payload);

    }, [userDetailsFormState])

    return (
        <Box className="UsersView"> 
            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEOBJECTSFORMLAYOUT}/>
            <SortingGrid
                title="Users"
                modelName={MODELNAME}
                dataQuery={users}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
                rowActions={{
                    edit: {icon: Edit, callbackFn: selectUserForEdit}
                }}
            />
            <CustomDialog 
                open={showEditDialog}
                title={<Box display="flex" alignItems="center"><Person sx={{fontSize: 'inherit', marginRight: theme.spacing(1)}}/> Edit user details</Box>}
                onClose={closeEditDialog}
            >

                <Typography variant="h5">Personal Details</Typography>
                <ModelForm
                    model="user"
                    formState={userDetailsFormState}
                    onChange={updateUserField}
                    layout={[
                        ['email', null],
                        ['first_name', 'last_name'],
                        ['is_active'],
                    ]}
                />
                <Typography variant="h5">Groups</Typography>
                 <UserGroupSelector
                    userFormDetails={userDetailsFormState}
                    onSelect={selectUserGroup}
                    onDeselect={deselectUserGroup}
                />
                
                <Box display="flex" justifyContent="center">
                    <Button variant="outlined" onClick={saveUserDetails}>Save</Button>
                </Box>

            </CustomDialog>
        </Box>
    )
}

export default UsersView