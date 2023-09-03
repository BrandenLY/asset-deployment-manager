import React, { useContext } from "react";

import {EventList} from "../components/EventList";
import {useEvents} from "../customHooks";

const HomeView = props =>{
    const {data:events, isLoading:isLoadingEvents} = useEvents();

    return(
        <>
            {!isLoadingEvents ? <EventList events={events}/> : <></>}
        </>
    )
}

export default HomeView;