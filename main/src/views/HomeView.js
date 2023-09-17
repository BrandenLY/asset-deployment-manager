import React, { useContext, useEffect, useState } from "react";

import {EventList} from "../components/EventList";
import {useBackend, useEvents} from "../customHooks";
import { Box, Button } from "@mui/material";
import { WorkloadChart } from "../components/WorkloadChart";

const HomeView = props =>{
    const {
        data,
        fetchNextPage,
        hasNextPage,
        hasPreviousPage,
        isFetching,
        isLoading,
      } = useBackend({model:"event", id:null, makeInfinate:true});

    const [eventPages, setEventPages] = useState(null);
    const [totalEvents, setTotalEvents] = useState(0);
    const [pageCount, setPageCount] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!isFetching){

            const pageCount = Math.ceil(data.pages[0].count / data.pages[0].results.length)

            setEventPages(data.pages)
            setTotalEvents(data.pages[0].count)
            setPageCount(pageCount)

            if ( hasNextPage ){
                fetchNextPage()
            }

        }
    }, [isFetching]);

    const updatePage = (event, value) => {
        setCurrentPage(value);
    }

    return(
        <Box className="HomeView">
            {eventPages && eventPages[currentPage - 1] ? 
                <EventList 
                events={eventPages[currentPage - 1].results}
                eventsCount={totalEvents}
                isFetching={isFetching}
                pagination={{
                    currentPage, 
                    pageCount,
                    updatePage,
                    hasNextPage,
                    hasPreviousPage
                }}
                /> : null
            }

            { !isLoading ?  
                <WorkloadChart 
                className="WorkloadChart" 
                data={eventPages?.map(p => p.results).flat().map(e => new Date(e.start_date).getMonth())}
                /> : null}
        </Box>
    )
}

export default HomeView;