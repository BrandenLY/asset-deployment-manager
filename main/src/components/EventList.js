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

import { AccessTime, Launch, FolderOpen, Assignment } from "@mui/icons-material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPageIcon,
} from "@mui/icons-material";
import { Grid, Typography, Popover, Link as StyleLink } from "@mui/material";
import { GenericContext } from "../context";
import { useNavigate } from "react-router-dom";

const ExpandedDataGrid = (props) => {
  return (
    <TableRow>
      <TableCell colSpan={10}>
        <Paper sx={{padding:1.5,}} elevation={3}>
          <Grid container spacing={2} columns={3}>
            <Grid item xs={1}>
              <Box sx={{borderRight:"1px solid rgb(224, 224, 224)", minHeight:"200px"}}>
                <Typography variant="body1">Team</Typography>
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box sx={{borderRight:"1px solid rgb(224, 224, 224)", minHeight:"200px"}}>
                <Typography variant="body1">Services</Typography>
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box>
                <Typography variant="body1">Tasks & Milestones</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </TableCell>
    </TableRow>
  );
};

const ExpandableTableRow = (props) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
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
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}><StyleLink sx={{cursor: 'pointer', padding:1}} onClick={() => navigate(`/event/${props.event.id}`)}>{props.event.id}</StyleLink></TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>{props.event.name}</TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>{props.event.startDate.toLocaleDateString()} - {props.event.endDate.toLocaleDateString()}</TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>{props.event.travelInDate.toLocaleDateString()} - {props.event.travelOutDate.toLocaleDateString()}</TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>{props.event.dateCreated.toLocaleDateString()}</TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>{props.event.lastModified.toLocaleDateString()}</TableCell>
        <TableCell sx={expanded?{borderBottom: "none !important"}:{}}>
          <ButtonGroup>
            <Tooltip title="Open Timetracking">
              <IconButton href={props.event.timetrackingUrl} disabled={props.event.timetrackingUrl ? false : true}>
                <AccessTime></AccessTime>
              </IconButton>
            </Tooltip>
            <Tooltip title="Open External Project">
              <IconButton href={props.event.externalProjectUrl} disabled={props.event.externalProjectUrl ? false : true}>
                <Launch></Launch>
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in Sharepoint">
              <IconButton href={props.event.sharepointUrl} disabled={props.event.sharepointUrl ? false : true}>
                <FolderOpen></FolderOpen>
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </TableCell>
      </TableRow>
    {expanded ? <ExpandedDataGrid /> : <></>}</>
    );
  };


const EventList = (props) => {
  const ctx = useContext(GenericContext);
  const [events, setEvents] = useState(null);
  useEffect(() => ctx.events.retrieveAll(setEvents),[]);
  return (
    <Paper sx={{ padding: 2, maxWidth: '1000px', overflowX: 'auto'}} elevation={2}>
      <Typography variant="h4">Events</Typography>
      <Table aria-label="events">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>id</TableCell>
            <TableCell>name</TableCell>
            <TableCell>event dates</TableCell>
            <TableCell>travel dates</TableCell>
            <TableCell>created</TableCell>
            <TableCell>last modified</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{position: "relative"}}>
          {events ? events.map( (event) => <ExpandableTableRow event={event}/> )  : <></>}
        </TableBody>
        <TableFooter>
          <TableRow></TableRow>
        </TableFooter>
      </Table>
    </Paper>
  );
};

export default EventList;
