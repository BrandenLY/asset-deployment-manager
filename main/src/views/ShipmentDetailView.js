import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useModelOptions, usePermissionCheck } from "../customHooks";
import ContentAssetsList from "../components/ContentAssetsList";
import { backendApiContext, getCookie, notificationContext } from "../context";
import GenericDetailView from "../components/GenericDetailView";
import { Button, Skeleton } from "@mui/material";
import { Close, Lock, QrCodeScanner, ThumbUp } from "@mui/icons-material";
import ScanTool from "../components/ScanTool";
import ActionButton from "../components/ActionButton";

const MODELNAME = 'shipment'

const ShipmentDetailView = props =>{

    // Hooks
    const locationParams = useParams();
    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);
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
        mutationFn: ({method, payload}) => {

            const updateUrl = new URL(`${backend.api.baseUrl}/shipment/${locationParams.id}/`);
            
            return fetch(updateUrl, {
                method: method,
                headers: backend.api.getRequestHeaders(),
                body: payload
            });

        }

    });

    const {mutate: packShipment} = useMutation({
        mutationFn: async () => {

            const updateUrl = new URL(`${backend.api.baseUrl}/shipment/${locationParams.id}/mark-shipment-packed/`);
            
            const res = fetch(updateUrl, {
                method: "GET",
                headers: backend.api.getRequestHeaders(),
            });

            return res;

        },
        onSettled: async (res, err, vars, ctx) => {

            // Frontend error
            if(err){
                notifications.add({message:new String(err), severity:notifications.ERROR});
                return;
            }

            // Backend error
            if(!res.ok){
                const data = await res.json();
                notifications.add({message: data.detail, severity:notifications.ERROR});
                return;
            }

            notifications.add({message: "Successfully updated shipment."});
            refetchShipment(); // Refresh shipment query
        }
    })

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
        packShipment();
    }, [packShipment]);

    const refetchShipment = useCallback(() => {
        
        queryClient.invalidateQueries(['shipment', locationParams.id]);
        shipmentQuery.refetch();

    }, [queryClient.invalidateQueries]); // Refresh query

    // Formatted Data
    const allowContentAdditions = shipment && shipment.status == 0;
    const allowContentRemovals = shipment && shipment.status >= 3;

    const allowScan = allowContentAdditions && checkUserPermission('scan_asset_to_parent');
    const allowPackAndLock = allowContentAdditions && (checkUserPermission('mark_shipment_packed') || checkUserPermission('change_shipment'));

    const scanToolButton = <ActionButton
        popoverText={`${displayScanTool ? "Hide" : "Display"} the scan tool`}
        callbackFn={toggleScanTool}
        elementProps={{
            startIcon: displayScanTool ? <Close/> : <QrCodeScanner/>,
            variant:"contained",
            color: displayScanTool ? "error" : "primary"
        }}
    >
        Scan
    </ActionButton>;

    const packAndLockButton = <ActionButton
        callbackFn={packAndLockShipment}
        popoverText="Set shipment status to 'Packed' and save current asset details"
        elementProps={{startIcon:<Lock/>,variant:"contained"}}
    >
        Pack and Lock
    </ActionButton>;

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
                allowPackAndLock ? packAndLockButton : null,
                allowScan ? scanToolButton : null,
            ]}
        >
            
            { displayScanTool ?
            
                <ScanTool
                    shipment={shipment}
                    onSuccessfulScan={refetchShipment}
                    variant="in-line"
                />
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