import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import { Add, Close, Delete, OpenInNew, QrCodeScanner } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useModelOptions} from "../customHooks";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomDialog from "../components/CustomDialog";
import { getCookie } from "../context";
import ModelForm from "../components/ModelForm";
import ScanTool from "../components/ScanTool";
import ModelListControls from "../components/ModelListControls";

const MODELNAME = 'shipment';
const CREATESHIPMENTSFORMLAYOUT = [
    ['status', null],
    ['carrier', null],
    ['origin', 'destination'],
    ['arrival_date', 'departure_date'],
    // ['event', null],
    // ['send_back_shipment', null]
]

const ShipmentsView = props => {

    // Hooks 
    const shipmentOptions = useModelOptions('shipment');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // State
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
        mutationFn: async (variables) => {
            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/shipment/`);
            const requestHeaders = new Headers();
            requestHeaders.set('Content-Type', 'application/json');
            requestHeaders.set('X-CSRFToken', getCookie('csrftoken'));
   
            return fetch( updateUrl, {method:"POST", body:JSON.stringify(variables.postData), headers:requestHeaders})
        },
        onSettled: async (res, error, variables, context) => {
            
            const {formIndex, postData} = variables;

            // Frontend mutation error
            if (error != undefined){
                props.addNotif({message: `Failed to create shipment: unknown error.`, severity:'error'})
                // KEEP THIS CONSOLE LOG IN DEBUG MODE.
                console.log(error);
                return;
            }

            // Backend Mutation error
            if (!res.ok) {

                // Improper POST data
                if (res.status == 400){ 

                    props.addNotif({message: `Failed to create shipment: invalid data`, severity:'error'})
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
                    return;
                }

                props.addNotif({message: `Failed to create shipment: unknown error.`, severity:'error'})
            }
            
            // Successful mutation
            else {

                props.addNotif({message: `Succesfully created shipment #${formIndex}`, severity:'success'})
                setNumExtraShipmentCreationForms(0);
                setForms([]);
                res.json().then(
                    responseData => {
                        queryClient.setQueryData(['shipment'], oldQueryData => {
                            oldQueryData['pages'][oldQueryData.pages.length] = {results:[responseData]}
                            return(oldQueryData);
                        })
                    }
                )
            }
        }
    })

    // Queries
    const shipments = useInfiniteQuery({
        queryKey: ['shipment'],
    });

    // Callback Functions
    const increaseFormFieldComponents = () => {
        // Increase Qty of Shipment Creation Forms Displayed
        setNumExtraShipmentCreationForms(previous => {
            previous++
            return(previous);
        });
    }

    const updateShipmentFormsData = (formIndex, data, fieldName=null) => {
        // Update Shipment Form Data
        setForms( previous => {
            let tmp = [...previous];
            if(fieldName === null){

                tmp[formIndex] = {...data}
    
            } else {
    
                tmp[formIndex][fieldName].current = data;
                tmp[formIndex][fieldName].errors = [];
    
            }

            console.log('updating form state', tmp);
            return tmp;
        })
    }

    // Shipment Row Actions
    const deleteShipment = shipment => {
        const message = `Are you sure you would like to delete ${shipment.label}?`
        if (confirm(message) == true){
            const tmpmutation = deleteShipmentMutation.mutate(shipment);
        }
    }

    const openShipment = shipment => {
        navigate(`/shipments/${shipment.id}`);
    }

    const scanShipment = shipment => {
        setSelectedShipment(shipment)
    }

    const createNewShipments = async e => {

        let mutations = []
        forms.forEach( (shipmentFormObj, i) => {
            // Parse state data into proper POST data.
            let postData = {};

            Object.entries(shipmentFormObj).forEach( ([fieldName,fieldData], _index) => {

                if ( fieldData.type == 'choice' ){
                    postData[fieldName] = fieldData.current?.value;
                }
                else if ( fieldData.type == 'related object'){
                    postData[fieldName] = fieldData.current?.id;
                }
                else{
                    postData[fieldName] = fieldData.current;
                }
            })

            mutations[i] = addShipmentMutation.mutate({formIndex:i, postData});
        });


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
                initialColumns={["id", "label", "status", "departure_date", "arrival_date"]}
                modelName='shipment'
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

export default ShipmentsView;