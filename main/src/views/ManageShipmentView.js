import React, {useEffect, useState, useRef} from "react";
import { Box, Link} from "@mui/material";
import SortingGrid from "../components/SortingGrid";
import { useBackend } from "../customHooks";

const SHIPMENT_STATUSES = {0:"Scheduled", 1:"In transit", 2:"Delivered", 3:"Canceled"}

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
        return ({
            ...data,
            id: (<Link href={`/api/shipment/${data.id}`}>{data.id}</Link>),
            origin: data.origin.name,
            destination: data.destination.name,
            event: data.event.name
          })
    }

    // Return JSX
    return (
        <Box className="ManageShipmentView">
            <SortingGrid 
                name="Manage Shipments"
                sortBy="Id"
                initialColumns={["id", "origin", "destination", "event"]}
                data={shipmentData?.pages.map(p => p.results).flat()}
                parseFn = {parseDataRow}
            />
        </Box>
    )
}

export default ManageShipmentView;