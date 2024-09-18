import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { useModelOptions } from "../customHooks";
import ScanTool from "../components/ScanTool";
import ProgressStatusAction from "../components/ProgressStatusAction";
import AssetGrid from "../components/AssetGrid";
import SortingGrid from "../components/SortingGrid";
import Section from "../components/Section";
import { Close, Delete } from "@mui/icons-material";
import { useQueries, useQuery } from "@tanstack/react-query";
import ChangeLogTableRow from "../components/ChangeLogTableRow";

const ShipmentDetailView = props =>{

    // Props
    const { addNotif, removeNotif } = props;

    // Hooks
    const locationParams = useParams();
    const modelOptions = useModelOptions('shipment');
    const [shipment, setShipment] = useState(false);
    const [displayScanTool, setDisplayScanTool] = useState(false);
    const theme = useTheme();

    // Queries

    const shipmentQuery = useQuery({
        queryKey: ['shipment', locationParams.id],
        enabled: modelOptions.isSuccess
    })

    const relatedQueries = useQueries({
        queries: modelOptions.isSuccess && shipmentQuery.isSuccess ?
        // Get related query option objects
        Object.entries(modelOptions.data.model_fields)
        .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
        .filter(([fieldName, fieldData]) => shipmentQuery.data[fieldName] != null )  // Only get non null foreign keys
        .map(([fieldName, fieldData]) => ({queryKey:[fieldData['related_model_name'], shipmentQuery.data[fieldName]]})) // construct query option object 
        : [] // Don't make any queries if dependant queries not completed.
    })

    useEffect(() => {

        if (relatedQueries.length == 0) {
            return;
        }

        const relatedQueriesAreSuccess = Object.values(relatedQueries).every( q => q.isFetched && q.isSuccess );
        
        if (shipmentQuery.isSuccess && relatedQueriesAreSuccess){
            
            const temporaryState = {...shipmentQuery.data}

            // Queries are returned in the same order they're called.
            const queryOrdering = Object.entries(modelOptions.data.model_fields)
            .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
            .filter( ([fieldName, fieldData]) => shipmentQuery.data[fieldName] != null ) // Only get non null foreign keys
            .map( ([fieldName, fieldData]) => fieldName)

            // Update foreign key relations to object data
            queryOrdering.forEach( (fieldName, index) => temporaryState[fieldName] = relatedQueries[index].data);

            setShipment(temporaryState);
        }


    }, [shipmentQuery.isSuccess, ...Object.values(relatedQueries).map(query => query.isSuccess)])

    const history = useQuery({
        queryKey: ['logs', modelOptions.data?.contenttype_id, locationParams.id],
        enabled: modelOptions.isSuccess && shipment.isSuccess,
        queryFn: async ({ queryKey }) => {

            console.log(queryKey);
            const formattedUrl = new URL(
              `${window.location.protocol}${window.location.host}/api/logs/${queryKey[1]}/${queryKey[2]}/`
            );
          
            const res = await fetch(formattedUrl);
            const data = await res.json();
            return data;
          }
    });

    // CALLBACK FUNCTIONS
    const refetchState = _ => {
        return // FIXME:
    }

    const toggleScanTool = e => {
        setDisplayScanTool(prev => {
            return(!prev);
        });
    }

    
    const shipmentState = null
    const historyData = history.isSuccess ? history.data : [];
    


    return (
        <Box className="ShipmentDetailView"> {console.log(shipment)}
            <ShipmentDetailPanel
                shipmentId={locationParams.id}
                addNotif={props.addNotif}
                shipment={shipment}
            />
            <Box className="ShipmentDetailContent" maxWidth="100%">
                <Box padding={1}>
                    <Typography variant="h3">{shipment?.label}</Typography>
                    <Box display="flex" justifyContent="flex-end" gap={1} paddingTop={1}>
                        <ProgressStatusAction model="shipment" object={shipment} actions={{}}/>
                        <Button color="error" startIcon={<Delete/>}>Delete</Button>
                    </Box>
                </Box>

                <Section
                    title={`Assets (${shipment?.asset_counts?.total_assets})`}
                    actions={[
                        <Button startIcon={displayScanTool ? <Close/> : undefined } variant={displayScanTool ? 'contained' : 'text'} color={displayScanTool ? 'error' : 'primary'} onClick={toggleScanTool}>Scan</Button>
                    ]}
                    defaultExpanded={true}
                >
                    {shipment &&
                        <ScanTool visible={displayScanTool} variant="in-line" elevation={2} shipment={shipment} onSuccessfulScan={refetchState}/>
                    }

                    {shipment &&
                        <AssetGrid fromQuery={shipmentQuery} assets={shipment.assets} addNotif={addNotif}/>
                    }

                </Section>

                <Section
                    title={`History`}
                >
                    <SortingGrid 
                        modelName="logentry" 
                        data={historyData}
                        initialColumns={["action", "user", "change_message", "action_time"]}
                        paperProps={{elevation:2, width:"100%"}}
                        RowComponent={ChangeLogTableRow}
                        rowProps={{'objectContentType' : 'shipment'}}
                        count={historyData.length}
                    />
                </Section>

            </Box>
        </Box>
    );
};

export default ShipmentDetailView;