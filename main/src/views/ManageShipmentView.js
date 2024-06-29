import React, {useState, useEffect, useRef} from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Add, Delete, OpenInNew, QrCodeScanner } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useModelOptions, useModelFormFields } from "../customHooks";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CreateShipmentDialog from "../components/CreateShipmentDialog";
import CustomDialog from "../components/CustomDialog";
import CreateShipmentForm from "../forms/CreateShipmentForm";
import { getCookie } from "../context";


const ManageShipmentView = props => {

    // Model Meta Data
    const shipmentOptions = useModelOptions('shipment');

    // State
    const queryClient = useQueryClient();
    const [numExtraShipmentCreationForms, setNumExtraShipmentCreationForms] = useState(0);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const shipmentFormData = useRef([]);

    // Mutations
    const deleteShipmentMutation = useMutation({
        mutationFn: async (data) => {
            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/shipment/${data.id}/`);
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

    const addShipmentMutation = useMutation({
        mutationFn: async (data) => {
            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/shipment/`);
            const requestHeaders = new Headers();
            requestHeaders.set('Content-Type', 'application/json');
            requestHeaders.set('X-CSRFToken', getCookie('csrftoken'));

            return fetch( updateUrl, {method:"POST", headers:requestHeaders})
        },
        onSettled: async (res, error, formIndex, context) => {

            if (res.ok) {
                props.addNotif({message: `Succesfully created shipment #${formIndex}`, severity:'success'})
            }
            else {

                if (res.status == 400){ // Problem with form data
                    props.addNotif({message: `Failed to create Shipment #${formIndex}`, severity:'error'})

                    let fieldErrors = []
                    res.json().then(
                        responseData => {
                            shipmentFormData.current[formIndex].updateFieldErrors(responseData);
                        }
                    )

                    let form = shipmentFormData.current[formIndex]
                    console.log(form);
                    return;
                    
                }

                props.addNotif({message: 'An unknown error occurred while creating shipment(s).', severity:'error'})


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

    const createNewShipments = async e => {

        let mutations = []
        shipmentFormData.current.forEach( (shipmentFormObj, i) => {
            mutations[i] = addShipmentMutation.mutate(i, shipmentFormObj);
        });

        console.log(mutations)
    }

    // Display Additional Shipment Creation Forms
    const getExtraShipmentCreationForms = () => {
        
        if(numExtraShipmentCreationForms < 1){
            return;
        }

        function isOdd(num) { return num % 2;}

        let formComponents = []
        for(let i=1;i<=numExtraShipmentCreationForms;i++){
            formComponents.push(
            <Paper sx={{
                padding: 1, 
                paddingBottom:2,
                boxSizing:'border-box', 
                background: isOdd(i) ? null : "none", 
                boxShadow: isOdd(i) ? null : "none"}}
            >
                <Typography>Shipment {i+1}</Typography>
                <CreateShipmentForm onChange={updateShipmentFormsData} key={i} index={i}/>
            </Paper>
        );
        }

        return formComponents;
    }

    // Increase Qty of Shipment Creation Forms Displayed
    const increaseFormFieldComponents = () => {
        // Increment state value
        setNumExtraShipmentCreationForms(previous => {
            previous++
            return(previous);
        });
    }

    // Update Shipment Form Data
    const updateShipmentFormsData = (key, data) => {
        shipmentFormData.current[key] = data;
    }

    // Formatted Data
    const allLoadedShipments = shipments.data?.pages.map(p => p.results).flat();
    const shipmentCount = shipments.data?.pages[0].count;

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
                    actions={[
                        [numExtraShipmentCreationForms ? `Submit ${numExtraShipmentCreationForms+1} records` : 'Submit', {'callbackFn' : createNewShipments}]
                    ]}
                >
                    <Paper sx={{background:"none", boxShadow: "none", padding: 1,boxSizing:'border-box'}}><Typography>Shipment{numExtraShipmentCreationForms > 0 ? " " + "1" : null}</Typography>
                        <CreateShipmentForm onChange={updateShipmentFormsData} key={0} index={0}/>
                    </Paper>
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