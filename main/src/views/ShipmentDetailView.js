import React, { useState, useEffect, useContext, useReducer, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography, IconButton, Snackbar } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { backendApiContext } from "../context";
import { useRichQuery } from "../customHooks";
import { useMutation } from "@tanstack/react-query";

const ShipmentDetailView = props =>{

    const locationParams = useParams();
    const { models, csrftoken } = useContext(backendApiContext);

    const state = useRichQuery({
        model: models.shipment, 
        id: locationParams.id
    });

    const { mutate } = useMutation({
        onSettled: (data, error, variables) => {
            console.log("settled", data, error, variables);
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