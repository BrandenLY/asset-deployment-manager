import { Delete, OpenInNew, QrCodeScanner } from '@mui/icons-material';
import { Box } from "@mui/material";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModelListControls from "../components/ModelListControls";
import ScanTool from "../components/ScanTool";
import SortingGrid from "../components/SortingGrid";
import { backendApiContext, notificationContext } from "../context";

const MODELNAME = 'shipment';
const SORTINGGRIDDEFAULTCOLUMNS = ["id", "label", "status", "departure_date", "arrival_date"]
const CREATESHIPMENTSFORMLAYOUT = [
    ['status', null],
    ['carrier', null],
    ['origin', 'destination'],
    ['arrival_date', 'departure_date']
]

const ShipmentsView = props => {

    // Hooks 
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // State
    const [selectedShipment, setSelectedShipment] = useState(null);

    // Mutations
    const backendShipment = useMutation({
        mutationFn: async (vars) => {

            const { payload, method="PUT" } = vars;
            const updateUrl = new URL(`${backend.api.baseUrl}/${MODELNAME}/${payload.id ? payload.id + "/" : ""}`);
            const requestHeaders = backend.api.getRequestHeaders(updateUrl);
        
            return fetch( updateUrl, {
                method: method,
                headers: requestHeaders
            })
            
        },
        onSettled: async (data) => {
            if (data.ok) {
                notifications.add({message:`Successfully deleted ${MODELNAME}`})
                queryClient.invalidateQueries({
                    queryKey: [MODELNAME],
                    exact: true
                })
            }
            else {
                notifications.add({message:'Failed to delete shipment', severity:'error'})
            }
        }
    })

    // Queries
    const shipments = useInfiniteQuery({
        queryKey: [MODELNAME],
    });

    // Shipment Row Actions

    const openShipment = shipment => {
        navigate(`/shipments/${shipment.id}`);
    }

    const scanShipment = shipment => {
        setSelectedShipment(shipment)
    }

    const deleteShipment = shipment => {
        const message = `Are you sure you would like to delete ${shipment.label}?`
        if (confirm(message) == true){
            backendShipment.mutate({payload:shipment, method:"DELETE"});
        }
    }

    // Formatted Data
    const allLoadedShipments = shipments.data?.pages.map(p => p.results).flat();
    const shipmentCount = shipments.data?.pages.reduce((count, page) => count + page.results.length, 0);

    // JSX 
    return (
        <Box className="ManageShipmentView">

            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATESHIPMENTSFORMLAYOUT}/>

            {selectedShipment&&

                <ScanTool shipment={selectedShipment}/>
            
            }

            <SortingGrid 
                title="Manage Shipments"
                modelName={MODELNAME}
                data={allLoadedShipments}
                count={shipmentCount}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
                rowActions={{
                    'open'   : {'icon': OpenInNew, 'callbackFn' : openShipment},
                    'scan'   : {'icon': QrCodeScanner, 'callbackFn' : scanShipment},
                    'delete' : {'icon': Delete, 'callbackFn' : deleteShipment}
                }}
            />

        </Box>
    )
}

export default ShipmentsView;