import React, {useState, useEffect, useRef} from "react";
import { Box, Button } from "@mui/material";
import { Add, Delete, OpenInNew, QrCodeScanner } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useModelOptions, useModelFormFields } from "../customHooks";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CreateShipmentDialog from "../components/CreateShipmentDialog";
import CustomDialog from "../components/CustomDialog";
import CreateShipmentForm from "../forms/CreateShipmentForm";


const ManageShipmentView = props => {

    // Model Meta Data
    const shipmentOptions = useModelOptions('shipment');

    // State
    const queryClient = useQueryClient();
    const [numExtraShipmentCreationForms, setNumExtraShipmentCreationForms] = useState(0);
    const [selectedShipment, setSelectedShipment] = useState(null);

    // Mutations
    const deleteShipmentMutation = useMutation({
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

    // Retrieve Paginated Shipment Data
    const shipments = useInfiniteQuery({
        queryKey: ['shipment'],
    });

    // Shipment Row Action Callback Functions
    const deleteShipment = shipment => {
        const message = `Are you sure you would like to delete ${shipment.label}?`
        if (confirm(message) == true){
            const tmpmutation = deleteShipmentMutation.mutate(shipment);

            console.log(tmpmutation)
        }
    }

    const openShipment = shipment => {
        window.open(`shipments/${shipment.id}`)
    }

    const scanShipment = shipment => {
        setSelectedShipment(shipment)
    }

    const createNewShipments = shipmentsData => {
        console.log(shipmentsData);
    }

    // Display Additional Shipment Creation Forms
    const getExtraShipmentCreationForms = () => {
        
        if(numExtraShipmentCreationForms < 1){
            return;
        }

        let formComponents = []
        for(let i=1;i<=numExtraShipmentCreationForms;i++){
            formComponents.push(<CreateShipmentForm key={i}/>);
        }

        return formComponents;
    }
    // Formatted Data
    const allLoadedShipments = shipments.data?.pages.map(p => p.results).flat();
    const shipmentCount = shipments.data?.pages[0].count

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
                <CustomDialog
                    title="Create shipment(s)"
                    subtitle="Setup and create new shipments"
                    openDialogButtonText="New Shipment"
                    openDialogButtonIcon={<Add/>}
                    actions={{
                        'submit' : {'callbackFn' : createNewShipments}
                    }}
                >
                    <CreateShipmentForm key={0}/>
                    {getExtraShipmentCreationForms()}
                    <Box sx={{marginY:1}}>
                        <Button startIcon={<Add/>} color={'success'} onClick={increaseFormFieldComponents}>Add shipment</Button>
                    </Box>
                </CustomDialog>
            </Box>
            <SortingGrid 
                title="Manage Shipments"
                defaultColumns={["id", "label", "status", "departure_date", "arrival_date"]}
                dataModel={'shipment'}
                data={allLoadedShipments}
                count={shipmentCount}
                rowActions={{
                    'open'   : {'icon': OpenInNew, 'callbackFn' : openShipment},
                    'scan'   : {'icon': QrCodeScanner, 'callbackFn' : scanShipment},
                    'delete' : {'icon': Delete, 'callbackFn' : deleteShipment}
                }}
            />
        </Box>
    )
}

export default ManageShipmentView;