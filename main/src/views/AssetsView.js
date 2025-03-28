import React, { useContext, useState } from "react";
import { Box, FormControl, InputLabel, OutlinedInput, Paper, TextField, Typography } from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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

    return (
        <Box className="AssetsView">
            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEASSETSFORMLAYOUT} />
            <SortingGrid 
                title="Equipment"
                modelName={MODELNAME}
                dataQuery={assets}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
                rowActions={{
                    open : {icon:OpenInNew, callbackFn:openAsset},
                }}
            />
        </Box>
    );
};

export default AssetsView;