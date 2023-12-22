import React, {useEffect, useState, useRef} from "react";
import { Box, Button, Link, Fab} from "@mui/material";
import { Add } from '@mui/icons-material';
import SortingGrid from "../components/SortingGrid";
import { useBackend } from "../customHooks";
import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
    MemoryRouter,
  } from 'react-router-dom';

const SHIPMENT_STATUSES = {
    0:"Scheduled", 
    1:"Packed", 
    2:"In Transit", 
    3:"Delivered",
    4:"Canceled"
}

const ManageShipmentView = props => {

    // Setup State Variables
    const locations = useRef([]);
    const shipments = useRef([]);

    // Retrieve Shipment Data
    const {
        data:shipmentData,
        fetchNextPage:fetchNextShipmentDataPage,
        hasNextPage:shipmentDataHasNextPage,
        hasPreviousPage:shipmentDataHasPreviouPage,
        isFetching:isFetchingShipmentData,
        isLoading:isLoadingShipmentData,
    } = useBackend({model:"shipment", id:null, makeInfinate:true});

    const parseDataRow = data =>{
        console.log(data);
        return ({
            ...data,
            id: (<Link component={RouterLink} to={`/shipments/${data.id}`}>{data.id}</Link>),
            origin: data.origin?.name,
            destination: data.destination?.name,
            event: data.event?.name,
            status: SHIPMENT_STATUSES[data.status]
          })
    }

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
                    <Add />
                    New shipment
                </Fab>
            </Box>
            <SortingGrid 
                name="Manage Shipments"
                sortBy="Id"
                initialColumns={["id", "status", "origin", "destination", "event"]}
                data={shipmentData?.pages.map(p => p.results).flat()}
                parseFn = {parseDataRow}
            />
        </Box>
    )
}

export default ManageShipmentView;