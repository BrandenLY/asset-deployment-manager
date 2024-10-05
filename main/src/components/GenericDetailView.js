import { Box, Button, Skeleton, Typography, useTheme, } from '@mui/material';
import React, { useEffect, useState } from 'react';
import DetailsPanel from './DetailsPanel';
import Section from './Section';
import SortingGrid from './SortingGrid';
import { useParams } from 'react-router-dom';
import { useCurrentUser, useModelOptions } from '../customHooks';
import { useQueries, useQuery } from '@tanstack/react-query';
import ChangeLogTableRow from './ChangeLogTableRow';
import { Delete } from '@mui/icons-material';

const GenericDetailView = props => {

    // Props
    const {model, title, actions, detailFormLayout, addNotif=()=>{}, children} = props;

    // Hooks
    const [data, setData] = useState(false);
    const objOptions = useModelOptions(model);
    const locationParams = useParams();
    const user = useCurrentUser();
    const theme = useTheme();

    // Queries
    const obj = useQuery({
        queryKey: [model, locationParams.id],
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
    })

    // Effects
    useEffect(() => {
        // Update State to include object and related-object data.

        // Escape hatch: exit if no related objects to query.
        if (relatedQueries.length == 0 && !obj.isSuccess) {
            return;
        }

        // Evaluates to true or false depending on whether all related object queries are successful.
        const relatedQueriesAreSuccess = Object.values(relatedQueries).every( q => q.isFetched && q.isSuccess );

        // 
        if (obj.isSuccess && relatedQueriesAreSuccess){
            
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


    }, [obj.data, obj.isSuccess, ...Object.values(relatedQueries).map(query => query.isSuccess)])

    // Formatted Data
    const viewContainerName = `${model}-detail-view`;
    const viewContainerContentName = `${model}-detail-content`;
    const historyData = history.isSuccess ? history.data : [];
    const userCanDelete = user ? user.checkPermission(`delete_${model}`) : false;

    return (
        <Box id={viewContainerName} position="relative">

            <Box padding={1}>
                <Typography variant="h3">{title ? title: data.label}</Typography>
                <Box className='detail-view-actions'>
                    <Box display="flex" sx={{float:"right"}}>
                        { userCanDelete ? <Button color="error" variant="outlined" startIcon={<Delete/>}>Delete</Button> : null}
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
                            modelName={"logentry"} 
                            data={historyData}
                            initialColumns={["action", "user", "change_message", "action_time"]}
                            paperProps={{elevation:2}}
                            RowComponent={ChangeLogTableRow}
                            rowProps={{'objectContentType' : model}}
                            count={historyData.length}
                        />
                    </Section>

                </Box>

            </Box>
        </Box>
    );
}

export default GenericDetailView;