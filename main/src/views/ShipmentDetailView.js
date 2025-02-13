import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useModelOptions, usePermissionCheck } from "../customHooks";
import ContentAssetsList from "../components/ContentAssetsList";
import { backendApiContext, getCookie } from "../context";
import GenericDetailView from "../components/GenericDetailView";
import { Button, Skeleton } from "@mui/material";
import { Close, Lock, QrCodeScanner, ThumbUp } from "@mui/icons-material";
import ScanTool from "../components/ScanTool";

const MODELNAME = 'shipment'

const ShipmentDetailView = props =>{

    // Hooks
    const locationParams = useParams();
    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const shipmentOptions = useModelOptions(MODELNAME);
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);

    // State
    const [shipment, setShipment] = useState(false);
    const [displayScanTool, setDisplayScanTool] = useState(false);

    // Queries
    const shipmentQuery = useQuery({
        queryKey: [MODELNAME, locationParams.id],
    });

    const contentTypes = useQuery({
        queryKey: ['contenttype'],
    })

    const relatedQueries = useQueries({
        queries: shipmentOptions.isSuccess && shipmentQuery.isSuccess ?
        // Get related query option objects
        Object.entries(shipmentOptions.data.model_fields)
        .filter( ([fieldName, fieldData]) => fieldData['type'] == "related object") // Only get foreign key relationships
        .filter(([fieldName, fieldData]) => shipmentQuery.data[fieldName] != null )  // Only get non null foreign keys
        .map(([fieldName, fieldData]) => ({queryKey:[fieldData['related_model_name'], shipmentQuery.data[fieldName]]})) // construct query option object 
        : [] // Don't make any queries if dependant queries not completed.
    });

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
        return(() => {
            shipmentQuery.remove();
        })
    }, [])

    useEffect(() => {

        if (!contentTypes.isSuccess){
            return;
        }

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
            temporaryState['assets'] = temporaryState['assets'].map( asset => parseAssetData(asset) );

            // Update state
            setShipment(temporaryState);
        }


    }, [shipmentQuery.data, shipmentQuery.isSuccess, ...Object.values(relatedQueries).map(query => query.isSuccess),  contentTypes.isSuccess])


    // Callback Functions
    const parseShipmentData = data => {
        return({...data});
    }
    
    const parseAssetData = data => {
        let tmpData = {...data,_meta:{selected:false}}
        tmpData['assets'] = tmpData['assets'].map( a => ({...a,_meta:{selected:false}}));
        return(tmpData);
    }

    const toggleScanTool = useCallback(e => {
        setDisplayScanTool(prev => !prev);
    }, [setDisplayScanTool]); // Displays/Hides scan tool ui

    const packAndLockShipment = useCallback(e => {
        console.log("")
    }, [shipment]);

    const refetchShipment = useCallback(() => {
        queryClient.invalidateQueries(['shipment', locationParams.id])
    }, [shipmentQuery.remove]); // Refresh query

    // Formatted Data
    const allowContentAdditions = shipment && shipment.status == 0;
    const allowContentRemovals = shipment && shipment.status >= 3;

    const allowScan = allowContentAdditions && checkUserPermission('scan_asset_to_parent');
    const allowPackAndLock = allowContentAdditions && (checkUserPermission('mark_shipment_packed') || checkUserPermission('change_shipment'));

    const scanToolButton = <Button 
        startIcon={displayScanTool ? <Close/> : <QrCodeScanner sx={{transform: "rotate 90deg"}}/>}
        variant="contained"
        onClick={toggleScanTool}
        color={displayScanTool ? "error" : "primary"}
    >
        Scan
    </Button>;

    const packAndLockButton = <Button
        startIcon={<Lock/>}
        variant="contained"
        onClick={packAndLockShipment}
    >
        Pack and Lock
    </Button>;

    return (
        <GenericDetailView
            {...props}
            model={MODELNAME}
            detailFormLayout={[
                ['id', null],
                ['label'],
                ['status'],
                ['carrier'],
                ['origin'],
                ['destination'],
                ['departure_date', 'arrival_date'],
                ['event'],
                ['return_shipment']
            ]}
            actions={[
                allowScan ? scanToolButton : null,
                allowPackAndLock ? packAndLockButton : null,
            ]}
        >
            
            { displayScanTool ?
            
                <>
                    {console.log(shipment)}
                    <ScanTool
                        shipment={shipment}
                        onSuccessfulScan={refetchShipment}
                        variant="in-line"
                    />
                </>
            :
                null
            }

            { shipment ?
                <ContentAssetsList 
                    obj={shipment}
                    objContentType={MODELNAME}
                />
            :
                <Skeleton variant="rectangular" />
            }

        </GenericDetailView>
    );
};

export default ShipmentDetailView;