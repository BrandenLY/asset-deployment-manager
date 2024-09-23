import { Archive, CheckBox, Close, Delete, ExpandLess, ExpandMore, SubdirectoryArrowRight } from "@mui/icons-material";
import { Badge, Box, Button, Checkbox, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AssetIcon from "../components/AssetIcon";
import ChangeLogTableRow from "../components/ChangeLogTableRow";
import ProgressStatusAction from "../components/ProgressStatusAction";
import ScanTool from "../components/ScanTool";
import Section from "../components/Section";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import SortingGrid from "../components/SortingGrid";
import { useModelOptions } from "../customHooks";
import ContentAssetsList from "../components/ContentAssetsList";
import { getCookie } from "../context";

const ShipmentDetailView = props =>{

    // Props
    const { addNotif, removeNotif } = props;

    // Hooks
    const locationParams = useParams();
    const shipmentOptions = useModelOptions('shipment');
    const [shipment, setShipment] = useState(false);
    const [displayScanTool, setDisplayScanTool] = useState(false);

    // Queries

    const shipmentQuery = useQuery({
        queryKey: ['shipment', locationParams.id],
        enabled: shipmentOptions.isSuccess
    })

    const history = useQuery({
        queryKey: ['logs', shipmentOptions.data?.contenttype_id, locationParams.id],
        enabled: shipmentOptions.isSuccess && shipment.isSuccess,
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
        queries: shipmentOptions.isSuccess && shipmentQuery.isSuccess ?
        // Get related query option objects
        Object.entries(shipmentOptions.data.model_fields)
        .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
        .filter(([fieldName, fieldData]) => shipmentQuery.data[fieldName] != null )  // Only get non null foreign keys
        .map(([fieldName, fieldData]) => ({queryKey:[fieldData['related_model_name'], shipmentQuery.data[fieldName]]})) // construct query option object 
        : [] // Don't make any queries if dependant queries not completed.
    })
    // Mutations
    const updateShipment = useMutation({
        mutationFn: (method, data) => {

            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/shipment/${data.id}/`);

            const requestHeaders = new Headers();
            requestHeaders.set("Content-Type", "application/json");
            requestHeaders.set("X-CSRFToken", getCookie("csrftoken"));
            
            // Deletions
            if (method=="DELETE"){
                return fetch(updateUrl, {
                    method: method,
                    headers: requestHeaders,
                })
            }

            // Updates
            if (method=="PUT"){
                let payload = {};

                shipmentOptions.model_fields.forEach( (fieldName, fieldDetails) => {
                    if(!fieldDetails.read_only && data[fieldName] != undefined){
                        payload[fieldName] = data[fieldName];
                    }
                });
    
                return fetch(updateUrl, {
                  method: method,
                  headers: requestHeaders,
                  body: JSON.stringify(payload),
                });
            }

            throw new Error("ShipmentDetailView", "Unsupported method provided to mutation")

          }
    });

    // Effects

    useEffect(() => {

        if (relatedQueries.length == 0) {
            return;
        }

        const relatedQueriesAreSuccess = Object.values(relatedQueries).every( q => q.isFetched && q.isSuccess );
        
        if (shipmentQuery.isSuccess && relatedQueriesAreSuccess){
            
            let temporaryState = {...shipmentQuery.data}

            // Queries are returned in the same order they're called.
            const queryOrdering = Object.entries(shipmentOptions.data.model_fields)
            .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
            .filter( ([fieldName, fieldData]) => shipmentQuery.data[fieldName] != null ) // Only get non null foreign keys
            .map( ([fieldName, fieldData]) => fieldName)

            // Update foreign key relations to object data
            queryOrdering.forEach( (fieldName, index) => temporaryState[fieldName] = relatedQueries[index].data);

            // Data manipulation
            temporaryState = parseShipmentData(temporaryState);
            temporaryState['assets'] = temporaryState['assets'].map( asset => parseAssetData(asset) )

            // Update state
            setShipment(temporaryState);
        }


    }, [shipmentQuery.data, shipmentQuery.isSuccess, ...Object.values(relatedQueries).map(query => query.isSuccess)])

    useEffect(() => {
        if (shipment.status == 0 && displayScanTool == false){
            // Open scan tool if the shipment is scheduled.
            setDisplayScanTool(true);
        }
    }, [shipment])

    // Callback Functions

    const parseShipmentData = data => {
        return({...data});
    }
    
    const parseAssetData = data => {
        let tmpData = {...data,_meta:{selected:false}}
        tmpData['assets'] = tmpData['assets'].map( a => ({...a,_meta:{selected:false}}))
        return(tmpData)
    }

    const selectAsset = (asset) => {

        setShipment(prev => {

            let temporaryState = {...prev}
            let temporaryAssets = [...temporaryState['assets']]

            if (asset.parent_content_type.model == 'asset'){
                const parentIndex = temporaryAssets.findIndex( a => a.id == asset.parent_object_id )
                const childIndex = temporaryAssets[parentIndex]['assets'].findIndex( a => a.id == asset.id)

                temporaryAssets[parentIndex]['assets'][childIndex] = {
                    ...temporaryAssets[parentIndex]['assets'][childIndex],
                    _meta: {
                        ...temporaryAssets[parentIndex]['assets'][childIndex]['_meta'],
                        selected: !asset._meta.selected
                    }
                }
            }
            else{
                const assetIndex = temporaryAssets.findIndex( a => a.id == asset.id );
            
                temporaryAssets[assetIndex] = {
                    ...temporaryAssets[assetIndex], 
                    _meta:{
                        ...temporaryAssets[assetIndex]['_meta'],
                        selected: !asset._meta.selected
                    }
                }
            }

            temporaryState['assets'] = temporaryAssets;

            return(temporaryState)
        })

    }

    // Formatted Data
    const historyData = history.isSuccess ? history.data : [];

    return (
        <Box className="ShipmentDetailView" position="relative">
            <ShipmentDetailPanel
                shipmentId={locationParams.id}
                addNotif={addNotif}
                shipment={shipment}
            />
            <Box className="ShipmentDetailContent" maxWidth="calc(initial - 45px)">

                <Box padding={1}>
                    <Typography variant="h3">{shipment?.label}</Typography>
                    <Box display="flex" justifyContent="flex-end" gap={1} paddingTop={1}>
                        <ProgressStatusAction model="shipment" object={shipment} actions={{}}/>
                        <Button color="error" variant="outlined" startIcon={<Delete/>}>Delete</Button>
                    </Box>
                </Box>

                { shipment ?
                    <ContentAssetsList 
                        obj={shipment}
                        objContentType={'shipment'}
                        onSelect={selectAsset}
                    />
                :
                    null
                }


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