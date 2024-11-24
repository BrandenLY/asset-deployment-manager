import { Box, Typography, useTheme } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import SortingGrid from '../components/SortingGrid';
import ModelListControls from '../components/ModelListControls';
import { OpenInFull, Person } from '@mui/icons-material';
import CustomDialog from '../components/CustomDialog';
import { useModelOptions } from '../customHooks';
import ModelForm from '../components/ModelForm';

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
    }

    return payload;
}

// Primary Component
const UsersView = props => {

    // Props Destructuring
    const { } = props;

    // Hooks
    const theme = useTheme();
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
        
    }, [selectedUser, userDetailsFormState]);

    useEffect(() => { // Update form state with user model fields
        if(userOptions.isSuccess){
            dispatchUserDetails({type: 'loadOptions', use: userOptions})
        }
    }, [userOptions.isSuccess]);

    // Callback Functions
    const selectUserForEdit = useCallback((user) => {
        setSelectedUser(user);
        setShowEditDialog(true);
    }, []); // Updates selected user and displays edit dialog.

    const closeEditDialog = useCallback((e) => {
        setShowEditDialog(false);
    }, []); // Hide user edit dialog.

    // Formatted Data
    const allLoadedUsers = users.data?.pages.map(p => p.results).flat();
    const userCount = users.isSuccess ? users.data?.pages.reduce((count, page) => count + page.results.length, 0) : null;

    return (
        <Box className="UsersView">
            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEOBJECTSFORMLAYOUT}/>
            <SortingGrid
                title="Users"
                modelName={MODELNAME}
                data={allLoadedUsers}
                count={userCount}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
                rowActions={{
                    edit: {icon: OpenInFull, callbackFn: selectUserForEdit}
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
                    layout={[
                        ['id', null],
                        ['email', null],
                        ['first_name', 'last_name'],
                        ['is_active'],
                        ['date_joined', 'last_login']
                    ]}
                />
                <Typography variant="h5">Groups</Typography>
                <Typography variant="h5">Permissions</Typography>
            </CustomDialog>
        </Box>
    )
}

export default UsersView