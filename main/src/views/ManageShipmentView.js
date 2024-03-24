import React, {useEffect, useState, useRef, useContext} from "react";
import { Box, Button, Dialog, Link, Fab, Paper, Typography, Grid, IconButton, Divider, Container, List, ListItem} from "@mui/material";
import { Add, Close } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useBackend, useModelFormFields } from "../customHooks";
import {
    Link as RouterLink,
  } from 'react-router-dom';
import { useMutation, useQuery } from "@tanstack/react-query";
import { backendApiContext, getCookie } from "../context";


const ManageShipmentView = props => {

    // State
    const [displayCreateShipmentDialog, setDisplayCreateShipmentDialog] = useState(false);
    const backendCtx = useContext(backendApiContext);
    
    // Retrieve Shipment Data
    const {
        data:shipmentData,
        fetchNextPage:fetchNextShipmentDataPage,
        hasNextPage:shipmentDataHasNextPage,
        hasPreviousPage:shipmentDataHasPreviouPage,
        isFetching:isFetchingShipmentData,
        isLoading:isLoadingShipmentData,
    } = useBackend({model:"shipment", id:null, makeInfinate:true});

    const initialColumns = [
        {name:"id", type:"number", getDisplay: (object) => <Link component={RouterLink} to={`/shipments/${object}`}>{object}</Link>}, 
        {name:"status", type:"text", getDisplay: (object) => backendCtx.models.shipment.meta.statuses[object]},
        {name:"origin", type:"text", getDisplay: (object) => {
            const {
                data:originData,
                isLoading:originIsLoading
            } = useBackend({model:"location", id:object})
            return !originIsLoading ? `${originData.address_line_1}, ${originData.city}, ${originData.state} ${originData.zipcode}` : 'unknown';
        }}, 
        {name:"destination", type:"text", getDisplay: (object) => {
            const {
                data:destinationData,
                isLoading:destinationIsLoading,
            } = useBackend({model:"location", id:object});
            return !destinationIsLoading ? `${destinationData.address_line_1}, ${destinationData.city}, ${destinationData.state} ${destinationData.zipcode}` : 'unknown';
        }}, 
        {name:"event", type:"text", getDisplay: (object) => {
            const {
                data:eventData,
                isLoading: eventIsLoading
            } = useBackend({model:"event", id:object})
            return !eventIsLoading ? eventData.name : "unknown";
        }}
    ]

    // Return JSX
    return (
        <Box className="ManageShipmentView">
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    transform: "translateY(-18px)",
                }}
            >
                <Fab 
                    aria-label="New shipment"
                    variant="extended"
                    size="small"
                    color="primary"
                    onClick={() => setDisplayCreateShipmentDialog(true)}
                >
                    New shipment
                    <Add />
                </Fab>
            </Box>
            <SortingGrid 
                name="Manage Shipments"
                sortBy="Id"
                initialColumns={initialColumns}
                data={shipmentData?.pages.map(p => p.results).flat()}
            />
            <CreateShipmentDialog open={displayCreateShipmentDialog} onClose={() => setDisplayCreateShipmentDialog(!displayCreateShipmentDialog)} addNotif={props.addNotif}/>
        </Box>
    )
}

const mutationCreateFn = async ({model, data}) =>{

    const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/${model.modelName}/${data.id ? data.id + '/' : ''}`)
    const requestHeaders = new Headers();
    requestHeaders.set('Content-Type', 'application/json');
    requestHeaders.set('X-CSRFToken', getCookie('csrftoken'))

    console.log(JSON.stringify(data))
    return fetch( updateUrl, {method:"POST", headers:requestHeaders, body:JSON.stringify(data)} )
}

const CreateShipmentDialog = props =>{

    const {onClose, open} = props;
    const {models} = useContext(backendApiContext);
    const {fields, addFieldErrors, clearErrors} = useModelFormFields({model:models.shipment, excludeReadOnly:true});

    const {mutate} = useMutation({
        mutationFn: mutationCreateFn,
        onSettled: (data, error, variables) => {
            if (data.ok){
                props.addNotif({message:'Successfully created shipment'});
            } else {
                props.addNotif({message:'Failed to create shipment', severity:'error'})
                data.json().then(data => {
                    Object.entries(data).forEach( ([fieldName,fieldErrors]) => {
                        fieldErrors.forEach(error => {
                            addFieldErrors(fieldName, error)
                        });
                    })
                })
            }
        }
    });

    const createNewShipment = () => {
        clearErrors()
        let payload = {};
        models.shipment.fields.forEach(f => {

            if (f.related){
                payload[f.name] = fields[f.name]?.currentValue?.[f.related.returnPropertyName]
            }
            else if(f.inputType == 'date' && fields[f.name]?.currentValue){
                payload[f.name] = new Date(fields[f.name]?.currentValue)
            }
            else if(f.options){
                payload[f.name] = fields[f.name]?.currentValue?.['id']
            }
            else{
                payload[f.name] = fields[f.name]?.currentValue
            }

        });
        
        mutate({model: models.shipment, data:payload, addFieldErrors})
    }

    return(
        <Dialog onClose={onClose} open={open} maxWidth="sm" fullWidth> {console.log(fields)}
            <Box sx={{padding:2, width:'100%'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap:2, justifyContent:'space-between'}}>
                            <Box>
                                <Typography variant='h6'>Create a shipment</Typography>
                                <Typography variant='subtitle2' sx={{fontWeight:400}}>Setup an outbound shipment.</Typography>
                            </Box>
                            <IconButton onClick={onClose}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        {fields?.['status']?.['component']}
                        {fields?.['status']?.['errors'].map(e => <Typography sx={{color: "error.main", margin:1}}>{e}</Typography>)}
                    </Grid> <Grid item xs={6}/>
                    <Grid item xs={6}>
                        {fields?.['carrier']?.['component']}
                        {fields?.['carrier']?.['errors'].map(e => <Typography sx={{color: "error.main", margin:1}}>{e}</Typography>)}
                    </Grid> <Grid item xs={6}/>
                    <Grid item xs={6}>
                        {fields?.['origin']?.['component']}
                        {fields?.['origin']?.['errors'].map(e => <Typography sx={{color: "error.main", margin:1}}>{e}</Typography>)}
                    </Grid>
                    <Grid item xs={6}>
                        {fields?.['destination']?.['component']}
                        {fields?.['destination']?.['errors'].map(e => <Typography sx={{color: "error.main", margin:1}}>{e}</Typography>)}
                    </Grid>
                    <Grid item xs={6}>
                        {fields?.['arrival_date']?.['component']}
                        {fields?.['arrival_date']?.['errors'].map(e => <Typography sx={{color: "error.main", margin:1}}>{e}</Typography>)}
                    </Grid>
                    <Grid item xs={6}>
                        {fields?.['departure_date']?.['component']}
                        {fields?.['departure_date']?.['errors'].map(e => <Typography sx={{color: "error.main", margin:1}}>{e}</Typography>)}
                    </Grid>
                    <Grid item xs={6}>
                        {fields?.['send_back_shipment']?.['component']}
                        {fields?.['send_back_shipment']?.['errors'].map(e => <Typography sx={{color: "error.main", margin:1}}>{e}</Typography>)}
                    </Grid>
                    <Grid item xs={12}>

                    </Grid>
                </Grid>
            </Box>
            <Container sx={{width: "100%", display: "flex", justifyContent:"center", paddingBottom:2}}>
                <Button variant="contained" onClick={createNewShipment}>
                    Submit
                </Button>
            </Container>
        </Dialog>
    )
}

export default ManageShipmentView;