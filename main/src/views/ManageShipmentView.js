import React, {useState, useEffect} from "react";
import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import { Add, Close, Delete, OpenInNew, QrCodeScanner } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useModelOptions} from "../customHooks";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomDialog from "../components/CustomDialog";
import { getCookie } from "../context";
import ModelForm from "../components/ModelForm";


const ManageShipmentView = props => {

    // Model Meta Data
    const shipmentOptions = useModelOptions('shipment');

    // State
    const queryClient = useQueryClient();
    const [numExtraShipmentCreationForms, setNumExtraShipmentCreationForms] = useState(0);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [forms, setForms] = useState([]);

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
                setNumExtraShipmentCreationForms(0);
                setForms([]);
            }
            else {

                if (res.status == 400){ // Problem with form data
                    props.addNotif({message: `Failed to create Shipment #${formIndex}`, severity:'error'})

                    res.json().then(
                        responseData => {
                            Object.entries(responseData).forEach(([fieldName, fieldErrors], index) => {

                                setForms(previous => {
                                    let tmp = [...previous];
                                    tmp[formIndex][fieldName]['errors'] = fieldErrors;
                                    return(tmp);
                                })
                            })
                        }
                    )

                    // let form = shipmentFormData.current[formIndex]
                    // console.log(form);
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
        forms.forEach( (shipmentFormObj, i) => {
            mutations[i] = addShipmentMutation.mutate(i, shipmentFormObj);
        });
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
    const updateShipmentFormsData = (formIndex, data, fieldName=null) => {
         
        if(fieldName === null){
            setForms( previous => {
                let tmp = [...previous];
                tmp[formIndex] = {
                    ...data
                }
                return tmp;
            });
        } else {
            setForms( previous => {
                let tmp = [...previous];
                tmp[formIndex][fieldName].current = data;
                return tmp;
            });
        }
    }

    // Formatted Data
    const allLoadedShipments = shipments.data?.pages.map(p => p.results).flat();
    const shipmentCount = shipments.data?.pages[0].count;
    const createShipmentsFormLayout = [
        ['status', null],
        ['carrier', null],
        ['origin', 'destination'],
        ['arrival_date', 'departure_date'],
        // ['event', null],
        // ['send_back_shipment', null]
    ]

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
                    onClose = {() => {setNumExtraShipmentCreationForms(0); setForms([]);}}
                    actions={[
                        [numExtraShipmentCreationForms ? `Submit ${numExtraShipmentCreationForms+1} records` : 'Submit', {'callbackFn' : createNewShipments}]
                    ]}
                >
                    <Paper sx={{background:"none", boxShadow:"none", padding:1, paddingLeft:0, boxSizing:'border-box'}}>
                        <Box sx={{display: "flex", justifyContent:"space-between", paddingX:1}}>
                            <Typography>Shipment {numExtraShipmentCreationForms > 0 ? "1" : null}</Typography>
                            <IconButton disabled={true} size={'small'}><Close/></IconButton>
                        </Box>
                        <ModelForm index={0} modelOptions={shipmentOptions} onChange={updateShipmentFormsData} formState={forms} layout={createShipmentsFormLayout} excludeReadOnly/>
                    </Paper>
                    { 
                        [...Array(numExtraShipmentCreationForms)].map((_, i) =>{
                            const formRequiresBackground = (i+1) % 2;
                            return(
                                <Paper sx={{background:formRequiresBackground ? null : "none", boxShadow:"none", padding:1, paddingLeft:0, boxSizing:'border-box'}}>
                                    <Box sx={{display: "flex", justifyContent:"space-between", paddingX:1}}>
                                        <Typography>Shipment {i+2}</Typography>
                                        <IconButton size={'small'} onClick={() => {
                                            setForms( previous => {
                                                const tmp = [...previous];
                                                tmp.splice(i+1, 1);
                                                return tmp;
                                            })
                                            setNumExtraShipmentCreationForms( previous => {
                                                return previous - 1;
                                            })
                                        }}><Close/></IconButton>
                                    </Box>
                                    <ModelForm index={i+1} modelOptions={shipmentOptions} onChange={updateShipmentFormsData} formState={forms} layout={createShipmentsFormLayout} excludeReadOnly/>
                                </Paper>
                            )
                        })
                    }
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