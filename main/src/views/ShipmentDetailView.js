import React from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Paper, Typography, IconButton, Snackbar, Card } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { useModelOptions, useRichQuery } from "../customHooks";

const ShipmentDetailView = props =>{

    const locationParams = useParams();
    const modelOptions = useModelOptions('shipment');
    
    const state = useRichQuery({
        modelOptions, 
        id: locationParams.id
    });

    return (
        <Box className="ShipmentDetailView">
            <ShipmentDetailPanel
                shipmentId={locationParams.id}
                addNotif={props.addNotif}
                shipment={state.value}
            />
            <Box sx={{width:"100%"}}>
                <Box sx={{padding:1}}>
                    <Typography variant="h5" color="primary.dark">{state.value?.label}</Typography>
                    <Box sx={{display: "flex", justifyContent: "flex-end"}}><Button variant="contained">Mark Shipment Packed</Button></Box>
                </Box>
                <Paper sx={{marginX:1, padding:1}}> {console.log(state.value)}
                    <Typography variant="subtitle2">Assets ({state.value?.asset_counts.total_assets})</Typography>
                    <Box>
                        {state.value &&
                            state.value.assets.map(asset => {
                                if(asset.is_container){
                                    return(<Card elevation={4} variant='outlined' sx={{padding:2, width: "min-content"}}></Card>)
                                }
                                else{
                                    return(<Card elevation={4} sx={{padding:2, width: "min-content"}}>{asset.label}</Card>)
                                }
                            })
                        }
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ShipmentDetailView;