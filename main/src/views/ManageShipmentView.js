import React, {useEffect, useState, useRef, useContext} from "react";
import { Box, Button, Link, Fab} from "@mui/material";
import { Add } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useBackend } from "../customHooks";
import {
    Link as RouterLink,
  } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { backendApiContext } from "../context";

const ManageShipmentView = props => {

    // Context
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
                    marginBottom: 1
                }}
            >
                <Fab 
                    aria-label="New shipment"
                    variant="extended"
                    size="small"
                    color="primary"
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
        </Box>
    )
}

export default ManageShipmentView;