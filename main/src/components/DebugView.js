import React, { useContext } from "react";

import EventList from "./EventList";
import { GenericContext } from "../context";
import WorkloadChart from "./WorkloadChart";

const DebugView = props =>{
    const ctx = useContext(GenericContext)
    return(
        <>
        <EventList></EventList>
        {/* <WorkloadChart></WorkloadChart> */}
        </>
    )
}

export default DebugView;