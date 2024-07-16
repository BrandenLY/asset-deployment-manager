import React from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Paper, Typography, IconButton, Snackbar, Card } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { useModelOptions, useRichQuery } from "../customHooks";
import AssetDetailsCard from "../components/AssetDetailsCard";

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
            <Box className="ShipmentDetailContent" sx={{display:"inline-block"}}>
                <Box sx={{padding:1}}>
                    <Typography variant="h5" color="primary.dark">{state.value?.label}</Typography>
                    <Box sx={{display: "flex", justifyContent: "flex-end"}}><Button variant="contained">Mark Shipment Packed</Button></Box>
                </Box>
                <Paper sx={{marginX:1, padding:1}}>
                    <Typography variant="subtitle2">Assets ({state.value?.asset_counts.total_assets})</Typography>
                    <Box sx={{display: "flex", gap: 1, flexWrap: 'wrap'}}>
                        {state.value &&
                            state.value.assets.map(asset => {
                                if(asset.is_container){
                                    return(<AssetDetailsCard asset={asset} variant='outlined' paperProps={{sx:{padding:2}}}/>)
                                }
                                else{
                                    return(<AssetDetailsCard asset={asset} paperProps={{sx:{padding:2}}}/>)
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