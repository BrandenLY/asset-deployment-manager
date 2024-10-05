import React from "react";
import { Box } from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useModelOptions } from "../customHooks";
import { useNavigate } from "react-router-dom";
import { OpenInNew } from "@mui/icons-material";
import SortingGrid from "../components/SortingGrid";
import ModelListControls from "../components/ModelListControls";

const MODELNAME = 'asset'
const CREATEASSETSFORMLAYOUT = [
    ['model', 'code'],
    ['serial_number', 'knox_id'],
    ['iccid', 'imei'],
    ['note'],
    ['location'],
    ['is_container', null],
    ['condition', null]
]

const AssetsView = props =>{
    // Hooks
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // State

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

    return (
        <Box className="AssetsView">
            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEASSETSFORMLAYOUT} />

            <SortingGrid 
                title="Manage Assets"
                defaultColumns={["id", "label", "code"]}
                modelName='asset'
                data={allLoadedAssets}
                count={assetCount}
                rowActions={{
                    'open'   : {'icon': OpenInNew, 'callbackFn' : openAsset},
                }}
            /> 
        </Box>
    );
};

export default AssetsView;