import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import {useBackend} from "../customHooks";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";

const ShipmentDetailView = props =>{
    const locationParams = useParams();

    const {
        data:shipmentData, 
        isLoading:isLoadingShipment
    } = useBackend({model:"shipment", id:locationParams.id});

    const parseShipment = (s) =>{
        console.log(s);
        return({
            ...s,
            origin: `${s.origin.address_line_1}, ${s.origin.city}, ${s.origin.state} ${s.origin.zipcode}`,
            destination: `${s.destination.address_line_1}, ${s.destination.city}, ${s.destination.state} ${s.destination.zipcode}`,
            departure_date: new Date(s.departure_date).toLocaleDateString(),
            arrival_date: new Date(s.arrival_date).toLocaleDateString()
        })
    }

    return (
        <Box className="ShipmentDetailView">
            <ShipmentDetailPanel data={isLoadingShipment ? null : parseShipment(shipmentData)}/>
            <Box>
                <p>{JSON.stringify(shipmentData)}</p>
            </Box>
        </Box>
    );
};

export default ShipmentDetailView;