import React, { useCallback, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import {useBackend} from "../customHooks";

export const DetailHeader = props => {
    return (
        <Typography
            sx={{
                color: "grey.500",
                fontSize: "18px"
            }}
            variant="body2"
        >
            {props.children}
        </Typography>
    )
}

export const ShipmentDetailPanel = ({data, parseFn}) =>{

    const [isEditing, setIsEditing] = useState(false);
    const [shipment, setShipment] = useState(null);

    useEffect(() => {
        return;
    }, [data])
    

    const toggleEditMode = ({event}) =>{
        setIsEditing(!isEditing);
    }

    return (
        <Paper className="ShipmentDetailsColumn" sx={{padding:1}}>
            <Box 
                sx={{
                    marginBottom: 2,
                    display: "flex",
                    justifyContent: "space-between"
                    }}
                >
                <Typography variant="h4">Shipment Details</Typography>
                <IconButton size="small" onClick={toggleEditMode}>
                    <Edit />
                </IconButton>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "30px"
                }}
            >
                <Box>
                    <DetailHeader>Carrier</DetailHeader>
                    <Typography>{data?.carrier}</Typography>
                </Box>

                <Box>
                    <DetailHeader>Origin</DetailHeader>
                    <Typography>{data?.origin}</Typography>
                </Box>

                <Box>
                    <DetailHeader>Destination</DetailHeader>
                    <Typography>{data?.destination}</Typography>
                </Box>

                <Box>
                    <DetailHeader>Departure Date</DetailHeader>
                    <Typography>{data?.departure_date}</Typography>
                </Box>

                <Box>
                    <DetailHeader>Scheduled Arrival Date</DetailHeader>
                    <Typography>{data?.arrival_date}</Typography>
                </Box>
            </Box>
        </Paper>
    );
};