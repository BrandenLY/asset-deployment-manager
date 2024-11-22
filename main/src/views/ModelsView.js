import React, { useContext } from "react";
import { Box } from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useModelOptions } from "../customHooks";
import { useNavigate } from "react-router-dom";
import { OpenInNew } from "@mui/icons-material";
import SortingGrid from "../components/SortingGrid";
import ModelListControls from "../components/ModelListControls";
import { backendApiContext, notificationContext } from "../context";

const MODELNAME = 'model'
const SORTINGGRIDDEFAULTCOLUMNS = [ 'id', 'icon', 'label', 'model_code', 'manufacturer' ]
const CREATEASSETSFORMLAYOUT = [
    ['name', null],
    ['description'],
    ['manufacturer', null],
    ['model_code', 'icon']
]

const ModelsView = props =>{

    // Hooks
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const modelOptions = useModelOptions(MODELNAME)
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // State

    // Mutations

    // Queries
    const models = useInfiniteQuery({
        queryKey: [MODELNAME],
    });

    // Callback Functions
    
    // Asset Row Actions
    const openAsset = model => {
        navigate(`/models/${model.id}`);
    }

    // Formatted Data
    const allLoadedModels = models.data?.pages.map(p => p.results).flat();
    const modelCount = models.data?.pages.reduce((count, page) => count + page.results.length, 0);

    return (
        <Box className="ModelsView">
            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEASSETSFORMLAYOUT} />
            <SortingGrid 
                title="Models"
                modelName={MODELNAME}
                data={allLoadedModels}
                count={modelCount}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
                rowActions={{
                    open   : {icon:OpenInNew, callbackFn:openAsset},
                }}
            /> 
        </Box>
    );
};

export default ModelsView;