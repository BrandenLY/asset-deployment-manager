import React, {useEffect, useState, useRef} from "react";
import { Box } from "@mui/material";
import ShipmentGrid from "../components/ShipmentGrid";
import { useBackend } from "../customHooks";

const SHIPMENT_STATUSES = {0:"Scheduled", 1:"In transit", 2:"Delivered", 3:"Canceled"}

const ManageShipmentView = props => {

    // Setup State Variables
    const locations = useRef([]);

    // Retrieve Shipment Data
    const {
        data:shipmentData,
        fetchNextPage:fetchNextShipmentDataPage,
        hasNextPage:shipmentDataHasNextPage,
        hasPreviousPage:shipmentDataHasPreviouPage,
        isFetching:isFetchingShipmentData,
        isLoading:isLoadingShipmentData,
    } = useBackend({model:"shipment", id:null, makeInfinate:true});

    // Retrieve Location Data
    const {
        data:locationData,
        fetchNextPage: fetchNextLocationDataPage,
        hasNextPage: locationDataHasNextPage,
        hasPreviousPage: locationDataHasPreviousPage,
        isFetching: isFetchingLocationData,
        isLoading: isLoadingLocationData
    } = useBackend({model:"location", id:null, makeInfinate:true})

    // Serialize Location Data

    useEffect(() => {
        if (isFetchingLocationData){
            return;
        }
        const dataResults = locationData.pages.map(p => p.results).flat();
        locations.current += dataResults
    },[isFetchingLocationData])


    // Return JSX

    return (
        <Box className="ManageShipmentView">
            <ShipmentGrid data={shipmentData?.pages.map(p => p.results).flat()} columns={["Id", "Origin", "Destination", "Event"]}/>
        </Box>
    )
}

export default ManageShipmentView;