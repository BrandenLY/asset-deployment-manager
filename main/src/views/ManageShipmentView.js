import React, {useState} from "react";
import { Box } from "@mui/material";
import { Add, Delete, OpenInNew, QrCodeScanner } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useModelOptions } from "../customHooks";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CreateShipmentDialog from "../components/CreateShipmentDialog";


const ManageShipmentView = props => {

    // State
    const queryClient = useQueryClient();
    const [selectedShipment, setSelectedShipment] = useState(null);

    const mutation = useMutation({
        mutationFn: async (data) => {
            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/shipment/${data.id}/`)
            const requestHeaders = new Headers();
            requestHeaders.set('Content-Type', 'application/json');
            requestHeaders.set('X-CSRFToken', getCookie('csrftoken'));
        
            return fetch( updateUrl, {method:"DELETE", headers:requestHeaders} )
        },
        onSettled: async (data) => {
            if (data.ok) {
                props.addNotif({message:'Succesfully deleted shipment', severity:'success'})
                queryClient.invalidateQueries({
                    queryKey: ['shipment'],
                    exact: true
                })
            }
            else {
                props.addNotif({message:'Failed to delete shipment', severity:'error'})
            }
        }
    })

    // Model Meta Data
    const shipmentOptions = useModelOptions('shipment');

    // Retrieve Paginated Shipment Data
    const shipments = useInfiniteQuery({
        queryKey: ['shipment'],
    });

    // Shipment Row Action Callback Functions
    const deleteShipment = shipment => {
        const message = `Are you sure you would like to delete ${shipment.label}?`
        if (confirm(message) == true){
            mutation.mutate(shipment);
        }
    }

    const openShipment = shipment => {
        window.open(`shipments/${shipment.id}`)
    }

    const scanShipment = shipment => {
        setSelectedShipment(shipment)
    }

    // Formatted Data
    const allLoadedShipments = shipments.data?.pages.map(p => p.results).flat();

    // JSX 
    return (
        <Box className="ManageShipmentView">
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    transform: "translateY(-18px)",
                }}
            >
                <CreateShipmentDialog addNotif={props.addNotif}/>
            </Box>
            <SortingGrid 
                title="Manage Shipments"
                sortBy="id"
                initialColumns={["id", "label", "status", "origin", "destination", "departure_date", "arrival_date"]}
                dataModel={'shipment'}
                actions={{
                    'delete' : {'icon': Delete, 'callbackFn' : deleteShipment},
                    'open'   : {'icon': OpenInNew, 'callbackFn' : openShipment},
                    'scan'   : {'icon': QrCodeScanner, 'callbackFn' : scanShipment},
                }}
                data={allLoadedShipments}
            />
        </Box>
    )
}

export default ManageShipmentView;