import React, {useEffect, useState} from "react";
import { Box, Paper, Typography, IconButton, Popover, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow } from "@mui/material";
import { MoreVert, ArrowUpward, ArrowDownward, ViewColumn } from '@mui/icons-material';


const SortingGridColumnHeader = props => {

    const [popoverAnchor, setPopoverAnchor] = useState(null);

    const open = Boolean(popoverAnchor);
    const id = open ? `${props.keyName}-options` : undefined;

    const togglePopover = (event) => {
        if (Boolean(popoverAnchor)){
            setPopoverAnchor(null);
            return;
        }
        setPopoverAnchor(event.target);
    }

    return (
        <TableCell>
            <Box
            sx={{
                display: "flex",
                gap: "5px",
                alignItems: "center",
                textTransform: "capitalize",
            }}>
            <Typography
            sx={{
                fontWeight: "bold",
            }}>
                {props.keyName}
            </Typography>
            <IconButton size="small" onClick={togglePopover}>
                <MoreVert fontSize="inherit" />
            </IconButton>
            </Box>

            <Popover
                id={id}
                open={open}
                anchorEl={popoverAnchor}
                onClose={togglePopover}
                anchorOrigin={{
                    vertical: 'middle',
                    horizontal: 'right',
                }}
            >
                <List>
                    <ListItemButton disablePadding >
                        <ListItemIcon>
                            <ArrowUpward />
                        </ListItemIcon>
                        <ListItemText primary='Sort ascending'/>
                    </ListItemButton>
                    <ListItemButton disablePadding>
                        <ListItemIcon>
                            <ArrowDownward />
                        </ListItemIcon>
                        <ListItemText primary='Sort descending'/>
                    </ListItemButton>
                    <ListItemButton disablePadding>
                        <ListItemIcon>
                            <ViewColumn />
                        </ListItemIcon>
                        <ListItemText primary='Edit columns'/>
                    </ListItemButton>
                </List>
            </Popover>
        </TableCell>
    )
}

const SortingGridRow = ({data, columns}) => {

    return (
        <TableRow key={data.id}>
            {columns.map(cv => <TableCell>{data[cv]}</TableCell>)}
        </TableRow>
    )
}

const SortingGrid = props => {

    const [activeColumns, setActiveColumns] = useState(props.initialColumns);
    const [sortDirection, setSortDirection] = useState(true); // true: sort ascending, false: sort descending.
    const [sortKey, setSortKey] = useState(props.sortBy ? props.sortBy : "Id"); // The datapoint to sort based on.

    return(
        <Paper className="ShipmentGrid" sx={{padding:2, minHeight:"500px"}} elevation={2}>
            <Box>
                <Typography variant="h4">{props.name}</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            { activeColumns.map(column => <SortingGridColumnHeader keyName={column} dataManipulation={{setActiveColumns: setActiveColumns, setSortDirection: setSortDirection}}/>) }
                        </TableRow>
                    </TableHead>
                    <TableBody>

                    {/* Add result rows */}
                    {props.data &&
                        props.data.map( shipment => <SortingGridRow data={props.parseFn(shipment)} columns={activeColumns}/> )
                    }

                    {/* No results found */}
                    { !props.data && 
                        <TableRow>
                            <TableCell sx={{textAlign: "center", paddingY:"75px"}} colspan={activeColumns.length}>
                                No results.
                            </TableCell>
                        </TableRow>
                    }

                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}

export default SortingGrid;