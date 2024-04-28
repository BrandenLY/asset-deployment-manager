import React, { useContext, useState } from 'react'
import { Box, Button, Checkbox, Container, Dialog, Fab, FormControl, FormControlLabel, Grid, IconButton, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useModelFormFields } from '../customHooks';
import { backendApiContext } from '../context';

const CreateShipmentDialog = props =>{

    // State
    const {addNotif} = props;
    const {models} = useContext(backendApiContext);
    const {fields, addFieldErrors, clearErrors} = useModelFormFields({model:models.shipment, excludeReadOnly:true});
    const [isOpen, setIsOpen] = useState(false);
    const [createReturnShipmentOnSubmit, setCreateReturnShipmentOnSubmit] = useState(false);
    const [returnDepartureDate, setReturnDepartureDate] = useState(null);
    const [returnArrivalDate, setReturnArrivalDate] = useState(null);


    const {mutate} = useMutation({
        mutationFn: async ({model, data}) =>{

            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/${model.modelName}/${data.id ? data.id + '/' : ''}`)
            const requestHeaders = new Headers();
            requestHeaders.set('Content-Type', 'application/json');
            requestHeaders.set('X-CSRFToken', getCookie('csrftoken'));
        
            return fetch( updateUrl, {method:"POST", headers:requestHeaders, body:JSON.stringify(data)} )
        },
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

    const toggleSetupReturnShipment = (e) => {
        setCreateReturnShipmentOnSubmit(e.target.checked)
    }

    const validateReturnDepartureDate = (date) => {
        // return true if input is valid
        return true
    }

    const validateReturnArrivalDate = (date) => {
        // return true if input is valid
        return true
    }

    const closeDialog = () => {
        // Cleanup
        clearErrors();
        setCreateReturnShipmentOnSubmit(false);
        setReturnDepartureDate(null);
        setReturnDepartureDate(null);
        // Close Dialog
        setIsOpen(false);
    }

    const openDialog = () => {
        setIsOpen(true);
    }

    return(
        <>
            <Fab 
                aria-label="New shipment"
                variant="extended"
                size="small"
                color="primary"
                onClick={openDialog}
            >
                New shipment
                <Add />
            </Fab>

            <Dialog onClose={closeDialog} open={isOpen} maxWidth="sm" fullWidth>
                <Box sx={{padding:2, width:'100%'}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap:2, justifyContent:'space-between'}}>
                                <Box>
                                    <Typography variant='h6'>Create a shipment</Typography>
                                    <Typography variant='subtitle2' sx={{fontWeight:400}}>Setup an outbound shipment.</Typography>
                                </Box>
                                <IconButton onClick={closeDialog}>
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
                            <FormControlLabel sx={{marginLeft:0.5}} control={<Checkbox checked={createReturnShipmentOnSubmit} onChange={toggleSetupReturnShipment}/>} label="Create a return shipment on submission." />
                        </Grid>

                        {createReturnShipmentOnSubmit &&
                        <>
                            <Grid item xs={12}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap:2, justifyContent:'space-between'}}>
                                    <Box>
                                        <Typography variant='h6'>Setup a return shipment</Typography>
                                        <Typography variant='subtitle2' sx={{fontWeight:400}}>Both the outbound and return shipment will automatically be linked.</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl sx={{width: "100%"}}>
                                    <InputLabel shrink variant="outlined">Return Shipment Departure Date</InputLabel>
                                    <OutlinedInput
                                            id='returnDepartureDate'
                                            type='date'
                                            notched={true}
                                            label="Return Shipment Departure Date"
                                            value={returnDepartureDate}
                                            onChange={(e, v) => setReturnDepartureDate(e.target.value)}
                                            error={!validateReturnDepartureDate(returnDepartureDate)}
                                            fullWidth={true}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                            <FormControl sx={{width: "100%"}}>
                                    <InputLabel shrink variant="outlined">Return Shipment Arrival Date</InputLabel>
                                    <OutlinedInput
                                            id='returnArrivalDate'
                                            type='date'
                                            notched={true}
                                            label="Return Shipment Arrival Date"
                                            value={returnArrivalDate}
                                            onChange={(e, v) => setReturnArrivalDate(e.target.value)}
                                            error={!validateReturnArrivalDate(returnArrivalDate)}
                                            fullWidth={true}
                                    />
                                </FormControl>
                            </Grid>
                        </>
                        }

                    </Grid>
                </Box>

                <Container sx={{width: "100%", display: "flex", justifyContent:"center", paddingBottom:2}}>
                    <Button variant="contained" onClick={createNewShipment}>
                        Submit
                    </Button>
                </Container>

            </Dialog>
        </>
    )
}

export default CreateShipmentDialog