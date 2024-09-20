import React from "react";
import { Box } from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { OpenInNew } from "@mui/icons-material";
import SortingGrid from "../components/SortingGrid";

const LocationView = props => {

    // Hooks
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // State

    // Mutations

    // Queries
    const locations = useInfiniteQuery({
        queryKey: ['location'],
    });

    // Callback Functions
    
    // Asset Row Actions
    const openLocation = location => {
        navigate(`/locations/${location.id}`);
    }

    // Formatted Data
    const allLoadedLocations = locations.data?.pages.map(p => p.results).flat();
    const locationCount = locations.data?.pages.reduce((count, page) => count + page.results.length, 0);
    return (
        <Box className="LocationView">
            <SortingGrid 
                title="Manage Locations"
                defaultColumns={["id", "label", "city", "state", "country"]}
                modelName='location'
                data={allLoadedLocations}
                count={locationCount}
                rowActions={{
                    'open'   : {'icon': OpenInNew, 'callbackFn' : openLocation},
                }}
            /> 
        </Box>
    );
}

export default LocationView