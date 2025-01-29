import { Delete } from '@mui/icons-material';
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

const GenericDetailView = props => {

    // Props
    const {model, title, actions, detailFormLayout, addNotif=()=>{}, children} = props;

    // Hooks
    const theme = useTheme();
    const navigate = useNavigate();
    const locationParams = useParams();
    const objOptions = useModelOptions(model);
    const backend = useContext(backendApiContext);
    const queryClient = useQueryClient();
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);
    const notifications = useContext(notificationContext);

    const [data, setData] = useState(false);

    // Queries
    const obj = useQuery({
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
        queries: objOptions.isSuccess && obj.isSuccess ?
        // Get related query option objects
        Object.entries(objOptions.data.model_fields)
        .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
        .filter(([fieldName, fieldData]) => obj.data[fieldName] != null )  // Only get non null foreign keys
        .map(([fieldName, fieldData]) => ({queryKey:[fieldData['related_model_name'], obj.data[fieldName]]})) // Construct query option object(s) 
        : [] // Don't make any queries if dependant queries not completed.
    });

    // Effects
    useEffect(() => {
        // Update State to include object and related-object data.

        // Escape hatch: exit if no related objects to query.
        if (relatedQueries.length == 0 && !obj.isSuccess) {
            return;
        }

        // Evaluates to true or false depending on whether all related object queries are successful.
        const relatedQueriesAreSuccess = Object.values(relatedQueries).every( q => q.isFetched && q.isSuccess );

        // Parse & Merge Data
        if ([obj.isSuccess, objOptions.isSuccess, relatedQueriesAreSuccess].every( b => b == true)){
            
            let temporaryState = {...obj.data}

            // Queries are returned in the same order they're called. The filtering done below must produce the same result as the filtering
            // used within the useQueries hook defined above.
            const queryOrdering = Object.entries(objOptions.data.model_fields)
            .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
            .filter( ([fieldName, fieldData]) => obj.data[fieldName] != null ) // Only get non null foreign keys
            .map( ([fieldName, fieldData]) => fieldName)

            // Update foreign key relations to object data
            queryOrdering.forEach( (fieldName, index) => temporaryState[fieldName] = relatedQueries[index].data);

            // Update state
            setData(temporaryState);
        }


    }, [
        objOptions.isSuccess,
        obj.isSuccess,
        ...Object.values(relatedQueries).map(query => query.isSuccess)
    ]);

    // Callback Functions
    const deleteObj = useCallback(e => {
        navigate(-1);
        backendObj.mutate({payload: data, method: 'DELETE'});
        queryClient.invalidateQueries({ queryKey: ['shipment']});
    }, []);

    // Formatted Data
    const viewContainerName = `${model}-detail-view`;
    const viewContainerContentName = `${model}-detail-content`;
    const userCanDelete = checkUserPermission(`delete_${model}`);

    return (
        <Box id={viewContainerName} position="relative">

            <Box padding={1}>
                <Typography variant="h2">{title ? title: data.label}</Typography>
                <Box className='detail-view-actions'>
                    <Box display="flex" gap={1} sx={{float:"right"}}>
                        
                        { actions }

                        { userCanDelete && data ? 
                        
                            <Button
                                color="error"
                                variant="contained"
                                startIcon={<Delete/>} 
                                onClick={deleteObj}
                            >
                                Delete
                            </Button> 

                        : null}
                    
                    </Box>
                </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1} width="100%" maxWidth="100%" overflow="hidden">

                { data ? 
                <DetailsPanel
                    model={model}
                    data={data ? data : obj.data}
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
                        title={`History`}
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
        </Box>
    );
}

export default GenericDetailView;