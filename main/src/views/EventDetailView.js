import React, { useContext, useEffect, useState } from "react";

import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography, Skeleton, IconButton, Divider, Link, Paper } from "@mui/material";
import { Edit, Print, DateRange } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useBackend, useEvents, useUsers } from "../customHooks";

const EventDetails = ({event}) => {
    const [isEditing, setIsEditing] = useState(false);
    const {data:users, isLoading:isLoadingUsers} = useBackend({model:"user"});
    // const {data:services, isLoading:isLoadingServices} = useBackend("service");

    const [PM, setPM] = useState(null)
    const [SS, setSS] = useState(null)

    useEffect(() => {
        if (!isLoadingUsers) {
            setPM(users.results.find(element => element.id == event.project.project_manager))
            setSS(users.results.find(element => element.id == event.project.solutions_specialist))
        }
    }, [isLoadingUsers])

    const ProjectDetailDataStyles = {
        marginTop: 1,
        marginLeft: 2,
        marginBottom: 1,
        marginRight: 2,
    }

    return(
        <Box
        className="ProjectDetails"
        sx={{
            maxWidth: 275,
            margin: 1,
        }}
        >
            <Box className="ProjectDetailsHeader">
                <Typography variant="h5">{event.name ? event.name : <Skeleton variant="text"/>}</Typography>
                <IconButton onClick={() => setIsEditing(!isEditing)}><Edit></Edit></IconButton>
            </Box>
            <Divider></Divider>
            <Typography variant="projectDetailHeading" sx={{color: "primary.light", marginTop: 0.75}}>Team</Typography>
            <List>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar sx={{width: 50, height: 50}}>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography sx={{fontWeight: "bold", fontSize:18}} variant="body">Project Manager</Typography><br/>
                        <Typography variant="body">{PM ? `${PM.first_name} ${PM.last_name}` : <Skeleton variant="text"></Skeleton>}</Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar sx={{width: 50, height: 50}}>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography sx={{fontWeight: "bold", fontSize:18}} variant="body">Solutions Specialist</Typography><br/>
                        <Typography variant="body">{SS ? `${SS.first_name} ${SS.last_name}` : <Skeleton variant="text"></Skeleton>}</Typography>
                    </ListItemText>
                </ListItem>
                <Divider></Divider>
            </List>
            <Typography variant="projectDetailHeading" sx={{color: "primary.light"}}>Information</Typography>
            <List className="ProjectDetailInfo">
                <ListItem>
                    <ListItemText>
                    <Typography variant="ProjectDetailLabel"><Print/>Printer Type</Typography>
                    <Typography sx={ProjectDetailDataStyles}>{"printer_type" in event.project ? event.project.printer_type : <Skeleton variant="text"></Skeleton>}</Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                    <Typography variant="ProjectDetailLabel"><DateRange/>Event Dates:</Typography>
                    <Typography sx={ProjectDetailDataStyles}>
                        {"start_date" in event ? event.start_date : <Skeleton variant="text"></Skeleton>} - {"end_date" in event ? event.end_date : <Skeleton variant="text"></Skeleton>}
                    </Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                    <Typography variant="ProjectDetailLabel"><DateRange/>Travel Dates:</Typography>
                    <Typography sx={ProjectDetailDataStyles}>
                        {"travel_in_date" in event ? event.travel_in_date : <Skeleton variant="text"></Skeleton>} - {"travel_out_date" in event ? event.travel_out_date : <Skeleton variant="text"></Skeleton>}
                    </Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                    <Typography variant="ProjectDetailLabel">Services:</Typography>
                    <Box 
                    variant="ProjectDetailData"
                    sx={{...ProjectDetailDataStyles, display: "flex", gap: 2}}
                    >
                        {/* {"services" in event.project && !(isLoadingServices) ? event.project.services.map(
                            service => {
                                const serviceData = services.results.find(element => element.id == service);

                                return (<Avatar alt={serviceData.name} src={serviceData.icon}/>);
                            }
                        ) : <Skeleton variant="circular"/>} */}
                    </Box>
                    </ListItemText>
                </ListItem>
            </List>
            <Box sx={{margin: 2}} className="ProjectDetailLinksContainer">
                <Link rel="noopener" target="_blank" href={event.timetracking_url} disabled={event.timetracking_url ? false : true} >Timetracking</Link>
                <Link rel="noopener" target="_blank" href={event.external_project_url} disabled={event.external_project_url ? false : true} >External Project</Link>
                <Link rel="noopener" target="_blank" href={event.sharepoint_url} disabled={event.sharepoint_url ? false : true} >Sharepoint</Link>
            </Box>
        </Box>
    )
}

const TaskBreakdown = ({event}) => {

    return(
        <Paper className="TaskBreakdown" sx={{padding: 2}}>
        </Paper>
    )
}

const EventDetailView = (props) =>{
    const location = useLocation();
    const lookup = location.pathname.split('/').reverse()[1];
    const {data:event, isLoading:isLoadingEvent} = useBackend({model:"event", id:lookup});

    return(
        <Box className="EventDetailView">
            {isLoadingEvent ? <Skeleton variant="rectangular" width={260} height={800} /> : <EventDetails event={event} /> }
            {isLoadingEvent ? <Skeleton variant="rectangular" width={500} height={800}/> : <TaskBreakdown event={event} /> }
        </Box>
    )
}

export default EventDetailView;