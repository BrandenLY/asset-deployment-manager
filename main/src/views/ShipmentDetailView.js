import React, { useState, useEffect, useContext, useReducer, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography, IconButton, Snackbar } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { backendApiContext } from "../context";
import { useModelOptions, useRichQuery } from "../customHooks";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../index"

const ShipmentDetailView = props =>{

    const locationParams = useParams();
    const modelOptions = useModelOptions('shipment');

    const { csrftoken } = useContext(backendApiContext);
    
    const state = useRichQuery({
        modelOptions, 
        id: locationParams.id
    });

    const { mutate } = useMutation({
        mutationFn: async ({ model, data }) => {
            const updateUrl = new URL(
              `${window.location.protocol}${window.location.host}/api/${modelOptions.data.model}/${locationParams.id}/`
            );
            const requestHeaders = new Headers();
            requestHeaders.set("Content-Type", "application/json");
            requestHeaders.set("X-CSRFToken", csrftoken);
          
            return fetch(updateUrl, {
              method: "PUT",
              headers: requestHeaders,
              body: JSON.stringify(data),
            });
          },
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