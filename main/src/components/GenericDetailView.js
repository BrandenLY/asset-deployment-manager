import { Delete, DeleteForever, History } from '@mui/icons-material';
import { Box, Button, Skeleton, Typography, useTheme, } from '@mui/material';
import { useMutation, useQueries, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendApiContext, notificationContext } from '../context';
import { useModelOptions, usePermissionCheck } from '../customHooks';
import ChangeLogTableRow from './ChangeLogTableRow';
import DetailsPanel from './DetailsPanel';
import Section from './Section';
import SortingGrid from './SortingGrid';
import CustomDialog from './CustomDialog';
import ActionButton from './ActionButton';

const GenericDetailView = props => {

    // Props
    const { model, rootQuery, title, actions, detailFormLayout, addNotif=()=>{}, children} = props;

    // Hooks
    const theme = useTheme();
    const navigate = useNavigate();
    const locationParams = useParams();
    const objOptions = useModelOptions(model);
    const backend = useContext(backendApiContext);
    const queryClient = useQueryClient();
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);
    const notifications = useContext(notificationContext);

    const [data, setData] = useState(null);
    const [displayDeletionConfirmation, setDisplayDeletionConfirmation] = useState(false);

    // Queries
    const objQuery = rootQuery ? rootQuery : useQuery({
        queryKey: [model, locationParams.id],
    });

    const backendObj = useMutation({
        mutationFn: async ( vars ) => {

            const { payload , method = "PUT" } = vars;

            const updateUrl = new URL(`${backend.api.baseUrl}/${model}/${locationParams.id}/`);
            const requestHeaders = backend.api.getRequestHeaders(updateUrl);
            
            return fetch(updateUrl, {
              method: method,
              headers: requestHeaders,
              body: JSON.stringify(payload),
            });

        },
        onSettled: async (res, error, vars, ctx) => {

            // if (error){
            //     notifications.add({message: error, severity:"error"})
            // }

            const data = await res.json();

            if (!res.ok){
                notifications.add({message: data.detail ? data.detail : new String(data), severity:"error"})
            };

        }
    });

    const history = useQuery({
        queryKey: ['logs', objOptions.data?.['contenttype_id'], locationParams.id ],
        enabled: objOptions.isSuccess,
        queryFn: async ({ queryKey }) => {

            const formattedUrl = new URL(
              `${window.location.protocol}${window.location.host}/api/logs/${queryKey[1]}/${queryKey[2]}/`
            );
          
            const res = await fetch(formattedUrl);
            const data = await res.json();
            return data;
        }
    });

    const relatedQueries = useQueries({
        queries: objOptions.isSuccess && objQuery.isSuccess ?
        // Get related query option objects
        Object.entries(objOptions.data.model_fields)
        .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
        .filter(([fieldName, fieldData]) => objQuery.data[fieldName] != null )  // Only get non null foreign keys
        .map(([fieldName, fieldData]) => ({queryKey:[fieldData['related_model_name'], objQuery.data[fieldName]]})) // Construct query option object(s) 
        : [] // Don't make any queries if dependant queries not completed.
    });

    // Effects
    useEffect(() => {
        // Update State to include object and related-object data.

        // Escape hatch: exit if no related objects to query.
        if (relatedQueries.length == 0 && !objQuery.isSuccess) {
            return;
        }

        // Evaluates to true or false depending on whether all related object queries are successful.
        const relatedQueriesAreSuccess = Object.values(relatedQueries).every( q => q.isFetched && q.isSuccess );

        // Parse & Merge Data
        if ([objQuery.isSuccess, objOptions.isSuccess, relatedQueriesAreSuccess].every( b => b == true)){
            
            let temporaryState = {...objQuery.data}

            // Queries are returned in the same order they're called. The filtering done below must produce the same result as the filtering
            // used within the useQueries hook defined above.
            const queryOrdering = Object.entries(objOptions.data.model_fields)
            .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
            .filter( ([fieldName, fieldData]) => objQuery.data[fieldName] != null ) // Only get non null foreign keys
            .map( ([fieldName, fieldData]) => fieldName)

            // Update foreign key relations to object data
            queryOrdering.forEach( (fieldName, index) => temporaryState[fieldName] = relatedQueries[index].data);

            // Update state
            setData(temporaryState);
        }


    }, [
        objOptions.isSuccess,
        objQuery.data,
        ...Object.values(relatedQueries).map(query => query.isSuccess)
    ]);

    // Callback Functions
    const deleteObj = useCallback(e => {
        navigate(-1);
        backendObj.mutate({payload: data, method: 'DELETE'});
        queryClient.invalidateQueries({ queryKey: ['shipment']});
    }, []);

    const showObjDeletionConfirmation = useCallback(e => {
        setDisplayDeletionConfirmation(true);
    }, []);

    const hideObjDeletionConfirmation = useCallback(e => {
        setDisplayDeletionConfirmation(false);
    }, []);

    // Formatted Data
    const viewContainerName = `${model}-detail-view`;
    const viewContainerContentName = `${model}-detail-content`;
    const userCanDelete = checkUserPermission(`delete_${model}`);

    return (
        <Box id={viewContainerName} position="relative">

            <Box padding={1}>
                <Typography variant="h2">{title ? title: data?.label}</Typography>
                <Box className='detail-view-actions'>
                    <Box display="flex" gap={1} sx={{float:"right"}}>
                        
                        { actions }

                        { userCanDelete && data ?

                            <ActionButton
                                callbackFn={showObjDeletionConfirmation}
                                elementProps={{color:"error", variant:"contained", startIcon:<Delete/>}}
                                popoverText={`Permanently delete this ${model}`}
                            >
                                Delete
                            </ActionButton>

                        : null}
                    
                    </Box>
                </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1} width="100%" maxWidth="100%" overflow="hidden">

                { data ? 
                <DetailsPanel
                    model={model}
                    data={data ? data : objQuery.data}
                    query={objQuery}
                    formLayout={detailFormLayout ? detailFormLayout : undefined}
                /> :
                <Skeleton
                    variant='rectangular'
                    width="100%"
                    height="66vh"
                    sx={{
                        alignSelf: "stretch",
                        flex: "0 0 340px",
                        padding: 1,
                        margin: `${theme.spacing(1)} 0`,
                    }}
                />
                }

                <Box id={viewContainerContentName} flex="2" minWidth='300px' white-space="nowrap" maxWidth="100%">

                    {children}

                    <Section
                        title={<Box display="flex" alignItems="center" gap={1}><History fontSize="large"/>Change History</Box>}
                    >
                        <SortingGrid
                            modelName={model} 
                            dataQuery={history} 
                            initialColumns={["action", "user", "change_message", "action_time"]}
                            paperProps={{elevation:2}}
                            rowComponent={ChangeLogTableRow}
                            rowProps={{'objectContentType' : model}}
                            maxRowsPerPage={5}
                        />
                    </Section>

                </Box>

            </Box>

            {displayDeletionConfirmation &&
                <ConfirmObjectDeletionDialog
                    objLabel={data?.label}
                    onConfirm={deleteObj}
                    onClose={hideObjDeletionConfirmation}
                />
            }
        </Box>
    );
}

const ConfirmObjectDeletionDialog = props => {

    const { objLabel, onConfirm, onClose } = props;

    return(
        <CustomDialog
            title="Confirm"
            open={true}
            onClose={onClose}
            actions={[
                <Button color="error" startIcon={<DeleteForever/>} onClick={onConfirm}>Delete</Button>,
                <Button variant="contained" onClick={onClose}>Cancel</Button>
            ]}
        >
            <Box padding={1} display="flex" flexDirection="column" gap={1}>
                <Typography>
                    Are you sure you would like to delete '<Typography component="span" fontWeight="bolder">{objLabel}</Typography>'?
                </Typography>

                <Typography sx={{opacity: "60%"}}>
                    This action can't be undone.
                </Typography>
            </Box>

        </CustomDialog>
    )
}

export default GenericDetailView;