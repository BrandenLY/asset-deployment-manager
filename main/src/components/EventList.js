import React, { useState, useEffect, useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip";

import { AccessTime, Launch, FolderOpen, Assignment, Groups, Checklist } from "@mui/icons-material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { Grid, Typography, Link as StyleLink, Avatar, Button, Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ExpandedDataGrid = (props) => {
  const dataTileHeight = "200px"
  const dataTileSx = {
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap"
  }

  return (
    <TableRow>
      <TableCell colSpan={10}>
        <Paper sx={{padding:1.5,}} elevation={3}>
          <Grid container spacing={2} columns={3}>
            <Grid item xs={1}>
              <Box sx={{borderRight:"1px solid rgb(224, 224, 224)", minHeight:dataTileHeight}}>
                <Typography variant="body1">Team</Typography>
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box sx={{borderRight:"1px solid rgb(224, 224, 224)", minHeight:dataTileHeight}}>
                <Typography variant="body1">Services</Typography>
                <Box sx={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                {props.event.project.services.map(
                  service => {
                    return (<Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", margin: "15px 0", justifySelf: "center"}}>
                      <Avatar alt={service.name} src={service.icon ? service.icon : "/static/main/images/icons/generic-service.png"}/>
                      <span>{service.name}</span>
                    </Box>)
                  }
                )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box sx={{minHeight:dataTileHeight}}>
                <Typography variant="body1">Tasks & Milestones</Typography>
                <Box sx={dataTileSx}>
                  <p>Milestones: {props.event.getMilestoneCount()}</p>
                  <p>Tasks: {props.event.getTaskCount()}</p>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </TableCell>
    </TableRow>
  );
};

const ExpandableTableRow = (props) => {
  const [event, setEvent] = useState({
    ...props.event,
    start_date : new Date(props.event.start_date),
    end_date : new Date(props.event.end_date),
    travel_in_date : new Date(props.event.travel_in_date),
    travel_out_date : new Date(props.event.travel_out_date),
    date_created : new Date(props.event.date_created),
    last_modified : new Date(props.event.last_modified)
  })
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEvent({
      ...props.event,
      start_date : new Date(props.event.start_date),
      end_date : new Date(props.event.end_date),
      travel_in_date : new Date(props.event.travel_in_date),
      travel_out_date : new Date(props.event.travel_out_date),
      date_created : new Date(props.event.date_created),
      last_modified : new Date(props.event.last_modified)
    })
  },[props.event])

  return (
    <>
      <TableRow>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>
          <Tooltip title={expanded ? "Show Less" : "Show More"}>
            <IconButton
              onClick={() => {
                setExpanded(!expanded)
              }}
            >
              {expanded ? <ExpandLess></ExpandLess> : <ExpandMore></ExpandMore>}
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>
          <StyleLink
            sx={{cursor: 'pointer', padding:2}}
            onClick={() => navigate(`/events/${event.id}/`)}
          >
            {event.id}
          </StyleLink>
        </TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>
          <Tooltip title="Currently Onsite">
                {
                  event.travel_in_date < Date.now() && 
                  event.travel_out_date > Date.now() ? 
                  <Groups color="warning"></Groups> : <></> 
                }
            </Tooltip>
          {event.name}
        </TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>{event.start_date.toLocaleDateString()} - {event.end_date.toLocaleDateString()}</TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>{event.travel_in_date.toLocaleDateString()} - {event.travel_out_date.toLocaleDateString()}</TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>
          <ButtonGroup>
            <Tooltip title="Open Timetracking">
              <IconButton target="_blank" href={event.timetracking_url} disabled={event.timetracking_url ? false : true}>
                <AccessTime></AccessTime>
              </IconButton>
            </Tooltip>
            <Tooltip title="Open External Project">
              <IconButton target="_blank" href={event.external_project_url} disabled={event.external_project_url ? false : true}>
                <Launch></Launch>
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in Sharepoint">
              <IconButton target="_blank" href={event.sharepoint_url} disabled={event.sharepoint_url ? false : true}>
                <FolderOpen></FolderOpen>
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </TableCell>
      </TableRow>
    {expanded ? <ExpandedDataGrid event={{}}/> : <></>}</>
    );
};

export const EventList = ({events, eventsCount, isFetching, pagination}) => {

  return (
    <Paper className='EventList' sx={{ padding: 2, overflowX: 'auto'}} elevation={2}>
      <Typography variant="h4">Events</Typography>
      <Table aria-label="events">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>id</TableCell>
            <TableCell>name</TableCell>
            <TableCell>event dates</TableCell>
            <TableCell>travel dates</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{position: "relative"}}>
          { events.map( e => <ExpandableTableRow event={e} /> ) }
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell 
              colspan="9"
              sx = {{
                width: '100%',
                borderBottom: 'none',
              }}
            >
              <Box sx={{display: "flex", justifyContent: "center"}}>
                <Pagination count={pagination.pageCount} page={pagination.currentPage} onChange={pagination.updatePage}/>
              </Box>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Paper>
  );
};

