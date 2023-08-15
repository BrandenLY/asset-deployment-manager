import React, { Component } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';

import { AccessTime, Launch, FolderOpen } from '@mui/icons-material';
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPageIcon } from '@mui/icons-material';

import EventList from "./EventList";
import { Typography } from "@mui/material";


const DebugPage = props =>{

    return(
        <Paper sx={{margin: 1, padding: 1,}}>
            <Typography variant="h2">Debug Dashboard</Typography>
            <EventList events={props.events}></EventList>
        </Paper>
    )
}

export default DebugPage;