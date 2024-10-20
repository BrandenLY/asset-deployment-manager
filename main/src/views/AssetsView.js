import React, { useContext, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useModelOptions } from "../customHooks";
import { useNavigate } from "react-router-dom";
import { OpenInNew } from "@mui/icons-material";
import SortingGrid from "../components/SortingGrid";
import ModelListControls from "../components/ModelListControls";
import { backendApiContext, notificationContext } from "../context";

const MODELNAME = 'asset'
const SORTINGGRIDDEFAULTCOLUMNS = [ 'id', 'label', 'location', 'condition']
const CREATEASSETSFORMLAYOUT = [
    ['model', 'code'],
    ['condition', null],
    ['serial_number', 'knox_id'],
    ['iccid', 'imei'],
    ['note'],
    ['location'],
    ['is_container', null],
]

const AssetsView = props =>{

    // Hooks
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // State
    const [newReservationEndDate, setNewReservationEndDate] = useState(null);
    const [newReservationsStartDate, setNewReservationStartDate] = useState(null);

    // Mutations

    // Queries
    const assets = useInfiniteQuery({
        queryKey: [MODELNAME],
    });

    // Callback Functions
    
    // Asset Row Actions
    const openAsset = asset => {
        navigate(`/assets/${asset.id}`);
    }

    // Formatted Data
    const allLoadedAssets = assets.data?.pages.map(p => p.results).flat();
    const assetCount = assets.data?.pages.reduce((count, page) => count + page.results.length, 0);
    const requiresDateSelections = newReservationEndDate != null && newReservationsStartDate != null;

    return (
        <Box className="AssetsView" display="flex" flexDirection="column" alignItems="stretch" gap={3}>
            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEASSETSFORMLAYOUT} />
            <SortingGrid 
                title="Equipment"
                modelName={MODELNAME}
                data={allLoadedAssets}
                count={assetCount}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
                rowActions={{
                    open : {icon:OpenInNew, callbackFn:openAsset},
                }}
            />
            <Paper>
                <Box>
                    <Typography variant="h4">Reserve Equipment</Typography>
                    { requiresDateSelections ? <Typography variant="subtitle1">Select the dates of reservation.</Typography> : null}
                </Box>
            </Paper>
        </Box>
    );
};

export default AssetsView;