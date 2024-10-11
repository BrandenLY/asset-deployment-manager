import { Delete, OpenInNew } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ModelListControls from "../components/ModelListControls";
import SortingGrid from "../components/SortingGrid";
import { backendApiContext, notificationContext } from "../context";

const MODELNAME = 'location'
const SORTINGGRIDDEFAULTCOLUMNS = ['id', 'label', 'address_line_1', 'city', 'state', 'country', 'zipcode']
const CREATELOCATIONSFORMLAYOUT = [
    ['name'],
    ['address_line_1'],
    ['address_line_2'],
    ['city'],
    ['state', 'zipcode'],
    ['country'],
    ['longitude', 'latitude']
]

const LocationsView = props => {

    // Hooks
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // State

    // Mutations
    const deleteLocationMutation = useMutation({
        mutationFn: async (data) => {
            const updateUrl = new URL(`${backend.api.baseUrl}/${MODELNAME}/${data.id}/`);
            const requestHeaders = backend.api.getRequestHeaders();
        
            return fetch( updateUrl, {method:"DELETE", headers:requestHeaders} )
        },
        onSettled: async (data) => {
            if (data.ok) {
                notifications.add({message: `Successfully deleted ${MODELNAME}`})
                queryClient.invalidateQueries({
                    queryKey: [MODELNAME],
                    exact: true
                })
            }
            else {
                notifications.add({message:`Failed to delete ${MODELNAME}`, severity:'error'})
            }
        }
    })

    // Queries
    const locations = useInfiniteQuery({
        queryKey: [MODELNAME],
    });

    // Callback Functions
    
    // Asset Row Actions
    const openLocation = location => {
        navigate(`/${MODELNAME}s/${location.id}`);
    }

    const deleteLocation = location => {
        const message = `Are you sure you would like to delete ${location.label}?`
        if (confirm(message) == true){
            deleteLocationMutation.mutate(location);
        }
    }

    // Formatted Data
    const allLoadedLocations = locations.data?.pages.map(p => p.results).flat();
    const locationCount = locations.data?.pages.reduce((count, page) => count + page.results.length, 0);
    
    return (
        <Box className="LocationView">
            <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATELOCATIONSFORMLAYOUT} />
            <SortingGrid 
                title="Manage Locations"
                modelName={MODELNAME}
                data={allLoadedLocations}
                count={locationCount}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
                rowActions={{
                    open   : {icon:OpenInNew, callbackFn:openLocation},
                    delete : {icon:Delete, callbackFn:deleteLocation}
                }}
            /> 
        </Box>
    );
}

export default LocationsView