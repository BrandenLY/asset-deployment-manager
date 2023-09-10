import React, { useContext } from "react";

import {EventList} from "../components/EventList";
import {useBackend, useEvents} from "../customHooks";
import { Box } from "@mui/material";

const HomeView = props =>{
    const {data:events, isLoading:isLoadingEvents} = useBackend("event");

    return(
        <Box className="HomeView">
            {!(isLoadingEvents) ? <EventList events={events}/> : <></>}
        </Box>
    )
}

export default HomeView;