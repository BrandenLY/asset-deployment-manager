import React, { useState, useEffect, useContext, useReducer, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography, IconButton, Snackbar } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { backendApiContext } from "../context";
import { useRichQuery } from "../customHooks";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../index"

const ShipmentDetailView = props =>{

    const locationParams = useParams();
    const { models, csrftoken } = useContext(backendApiContext);

    const state = useRichQuery({
        model: models.shipment, 
        id: locationParams.id
    });

    const { mutate } = useMutation({
        onSettled: (data, error, variables) => {
            if (data.ok){
                props.addNotif({message:'Successfully updated shipment'});
                data.json().then(data => queryClient.setQueryData(['shipment', locationParams.id], data))
            } else {
                props.addNotif({message:'Failed to update shipment', severity:'error'})
                data.json().then(data => {
                    Object.entries(data).forEach( ([fieldName,fieldErrors]) => {
                        fieldErrors.forEach(error => {
                            console.log(fieldName,error)
                            variables.addFieldErrors(Object.fromEntries(new Map([[fieldName,error]])))
                        })
                    })
                })
            }
        },
    });

    return (
        <Box className="ShipmentDetailView">
            <ShipmentDetailPanel
                shipment={state.value}
                updateShipment={mutate}
            />
            <Box sx={{textWrap: "wrap"}}>
                
            </Box>
        </Box>
    );
};

export default ShipmentDetailView;