import React, { useContext, useEffect, useState } from "react";

import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography, Skeleton } from "@mui/material";
import Divider from '@mui/material/Divider';
import { useLocation } from "react-router-dom";
import { useEvents, useUsers } from "../customHooks";

const EventDetails = ({project}) => {
    console.log(project)
    const {data:PM, isLoadingPM} = useUsers(project?.project_manager);
    const {data:SS, isLoadingSS} = useUsers(project?.solutions_specialist);
    const [isEditing, setIsEditing] = useState(false);

    return(
        <Box 
        className="ProjectDetails"
        sx={{
            maxWidth: 275,
            padding: 1,
        }}
        >
            <Typography variant="projectDetailHeading" sx={{color: "primary.light"}}>Stakeholders</Typography>
            <List>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar sx={{width: 50, height: 50}}>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography sx={{fontWeight: "bold", fontSize:18}} variant="body">Project Manager</Typography><br/>
                        <Typography variant="body">{isLoadingPM ? <Skeleton variant="text"></Skeleton> : `${PM.first_name} ${PM.last_name}`}</Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar sx={{width: 50, height: 50}}>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography sx={{fontWeight: "bold", fontSize:18}} variant="body">Solutions Specialist</Typography><br/>
                        <Typography variant="body">{isLoadingSS ? <Skeleton variant="text"></Skeleton> : `${SS.first_name} ${SS.last_name}`}</Typography>
                    </ListItemText>
                </ListItem>
                <Divider></Divider>
            </List>
            <Typography variant="projectDetailHeading" sx={{color: "primary.light"}}>Information</Typography>
        </Box>
    )
}

const EventDetailView = (props) =>{
    const location = useLocation();
    const lookup = location.pathname.split('/').reverse()[1];
    const {data:event, isLoading:isLoadingEvent} = useEvents(lookup);

    return(
        <Box className="EventDetailView">
            {isLoadingEvent ? <>Loading</> : <EventDetails project={event.project}></EventDetails> }
        </Box>
    )
}

export default EventDetailView;