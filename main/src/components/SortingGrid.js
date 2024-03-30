import React, {useEffect, useRef, useState} from "react";
import { Box, Paper, Typography, IconButton, Popover, List, ListItemButton, ListItemIcon, ListItemText, Link } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow } from "@mui/material";
import { MoreVert, ArrowUpward, ArrowDownward, ViewColumn } from '@mui/icons-material';
import { useModelOptions } from "../customHooks";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";


const SortingGridColumnHeader = props => {

    const {column, modelName, dataManipulation} = props;

    const shipmentOptions = useModelOptions(modelName);
    const [popoverAnchor, setPopoverAnchor] = useState(null);

    const togglePopover = (event) => {
        if (Boolean(popoverAnchor)){
            setPopoverAnchor(null);
            return;
        }
        setPopoverAnchor(event.target);
    }

    let modelField = null;
    const open = Boolean(popoverAnchor);
    const id = open ? `${column}-options` : undefined;
    
    try { 
        modelField = shipmentOptions.data?.model_fields[column];
    } catch (e) {
        if (e instanceof ReferenceError){
            console.error('SortingGridColumnHeader', `'${column}' is not a valid property of '${modelName}'.`);
        } else {
            throw e;
        }
    }

    if(shipmentOptions.isFetched && !modelField){ 

        // Remove invalid column name
        dataManipulation.setActiveColumns(previous =>{
            return previous.filter(columnName => columnName != column)
        })

        // Return nothing
        return(
            <></>
        )
    }

    return (
        <TableCell>
            <Box
            sx={{
                display: "flex",
                gap: "5px",
                alignItems: "center",
            }}>
            <Typography
            sx={{
                fontWeight: "bold",
            }}>
                {modelField ? modelField.label : column}
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

const SortingGridRow = props => {

    const {data, columns, actions, modelName} = props;
    const shipmentOptions = useModelOptions(modelName);
    const queries = useRef({});

    const fieldOptions = shipmentOptions.data.model_fields

    columns.filter(columnName => {
        if (fieldOptions[columnName].type == 'related object'){
            return true
        }
    }).forEach(columnName => {
        let tmp = {
            ...queries.current,
        }
        tmp[columnName] = useQuery({
            queryKey:[fieldOptions[columnName].related_model_name, data[columnName]],
            enabled: shipmentOptions.isFetched
        })
        queries.current = tmp
    })

    const getDisplayValue = (column, data) =>{
        const columnOptions = shipmentOptions.data.model_fields[column];

        switch(columnOptions.type){
            case 'date':
                return (new Date(data[column])).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit'});
            case 'datetime':
                return (new Date(data[column])).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit'});
            case 'choice':
                return columnOptions.choices.find(o => o.value == data[column]).display_name
            case 'related object':
                return queries.current[column].isFetched ? queries.current[column].data.label : '...';
            default:
                return new String(data[column]);
        }
    }

    const triggerAction = () => {

    }
    return (
        <TableRow key={data.id} sx={{height: "82px"}}>
            {columns.map(c => {
                return(
                    <TableCell sx={{height: "inherit"}}>
                        <Typography variant="body2" noWrap>
                        { c == 'id' ?
                        <Link component={RouterLink} to={`/${modelName}s/${data.id}/`}>
                            {getDisplayValue(c, data)}
                        </Link>
                        :
                        getDisplayValue(c, data)
                        }
                        </Typography>
                    </TableCell>
                )
            })}
        </TableRow>
    )
}

const SortingGrid = props => {

    const {title, sortBy, initialColumns, dataModel, actions:rowActions, data:shipmentData} = props;
    const [activeColumns, setActiveColumns] = useState(initialColumns);
    const [sortDirection, setSortDirection] = useState(true); // true: sort ascending, false: sort descending.
    const [sortKey, setSortKey] = useState(sortBy ? sortBy : "id"); // The datapoint to sort based on.
    const shipmentOptions = useModelOptions(dataModel);

    return(
        <Paper className="ShipmentGrid" sx={{padding:2, minHeight:"500px"}}>
            <Box>
                <Typography variant="h4">{title}</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            { activeColumns.map(column => <SortingGridColumnHeader column={column} modelName={dataModel} dataManipulation={{setActiveColumns: setActiveColumns, setSortDirection: setSortDirection}}/>) }
                        </TableRow>
                    </TableHead>
                    <TableBody>

                    {/* Add result rows */}
                    { shipmentData &&
                        shipmentData.map( shipment => <SortingGridRow data={shipment} columns={activeColumns} modelName={dataModel} actions={rowActions}/> )
                    }

                    {/* No results found */}
                    { !shipmentData && 
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