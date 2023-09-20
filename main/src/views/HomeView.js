import React, { useContext, useEffect, useState } from "react";

import {EventList} from "../components/EventList";
import {useBackend, useEvents} from "../customHooks";
import { Box, Button } from "@mui/material";
import { WorkloadChart } from "../components/WorkloadChart";

const HomeView = props =>{
    const {
        data:eventData,
        fetchNextPage:fetchNextEventPage,
        hasNextPage:eventDataHasNextPage,
        hasPreviousPage:eventDataHasPreviouPage,
        isFetching:isFetchingEventData,
        isLoading:isLoadingEventData,
      } = useBackend({model:"event", id:null, makeInfinate:true});

    const [eventPages, setEventPages] = useState(null);
    const [totalEvents, setTotalEvents] = useState(0);
    const [eventPageCount, seteventPageCount] = useState(1);
    const [currentEventPage, setcurrentEventPage] = useState(1);

    useEffect(() => {
        if (!isFetchingEventData){

            const eventPageCount = Math.ceil(eventData.pages[0].count / eventData.pages[0].results.length)

            setEventPages(eventData.pages)
            setTotalEvents(eventData.pages[0].count)
            seteventPageCount(eventPageCount)

            if ( eventDataHasNextPage ){
                fetchNextEventPage()
            }

        }
    }, [isFetchingEventData]);

    const updateEventPage = (event, value) => {
        setcurrentEventPage(value);
    }

    return(
        <Box className="HomeView">
            {eventPages && eventPages[currentEventPage - 1] ? 
                <EventList 
                events={eventPages[currentEventPage - 1].results}
                eventsCount={totalEvents}
                isFetching={isFetchingEventData}
                pagination={{
                    currentEventPage, 
                    eventPageCount,
                    updateEventPage,
                    eventDataHasNextPage,
                    eventDataHasPreviouPage
                }}
                /> : null
            }

            { !isLoadingEventData ?  
                <WorkloadChart 
                className="WorkloadChart" 
                data={eventPages?.map(p => p.results).flat().map(e => new Date(e.start_date).getMonth())}
                /> : null
            }


        </Box>
    )
}

export default HomeView;