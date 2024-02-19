import React, { useState, useEffect, useContext, useReducer, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { backendApiContext } from "../context";
import { useRichQuery } from "../customHooks";

const ShipmentDetailView = props =>{

    const locationParams = useParams();
    const { models } = useContext(backendApiContext);

    const state = useRichQuery({
        model: models.shipment, 
        id: locationParams.id
    });

    // Callback Functions
    // FIXME: This may require optimization
    const updateShipment = e => {
        const requestHeaders = new Headers();
        requestHeaders.set('Content-Type', 'application/json');
        requestHeaders.set('X-CSRFToken', backendCtx.csrftoken)

        // fetch(
        //     `${backendCtx.baseUrl}/shipment/`, 
        //     {
        //         method:"POST",
        //         body: JSON.stringify({...state.data.shipment}),
        //         headers : requestHeaders
        //     }
                
        // )
        // .then(res => res.json())
        // .then(data => console.log(data))

        console.log(e);
    }

    return (
        <Box className="ShipmentDetailView">
            <ShipmentDetailPanel
                shipment={state.value}
                setShipment={updateShipment}
            />
            <Box sx={{textWrap: "wrap"}}>
                {JSON.stringify(state.value,null,2)}
            </Box>
        </Box>
    );
};

export default ShipmentDetailView;