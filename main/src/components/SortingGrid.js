import React, {useEffect, useRef, useState} from "react";
import { Box, Paper, Typography, IconButton, Popover, List, ListItemButton, ListItemIcon, ListItemText, Link, Stack, Skeleton, FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow } from "@mui/material";
import { MoreVert, ArrowUpward, ArrowDownward, ViewColumn, FirstPage, LastPage, NavigateNext, NavigateBefore } from '@mui/icons-material';
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { useModelOptions } from "../customHooks";
import ActionButton from "./actionButton";

const SortingGridCardStyles = {
    padding: 2,
    minHeight:"460px",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap:1,
};

const minimumRecordsPerPage = 25;
const RecordsPerPageOptions = [
    minimumRecordsPerPage,
    minimumRecordsPerPage * 2,
    minimumRecordsPerPage * 3,
    minimumRecordsPerPage * 4,
    minimumRecordsPerPage * 10,
    minimumRecordsPerPage * 30,
]

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
            return previous.filter(columnName => columnName != column);
        });

        // Return nothing
        return(
            <></>
        );
    }

    return (
        <TableCell sx={{verticalAlign:"bottom"}}>
            <Box
            sx={{
                display: "flex",
                gap: "5px",
                alignItems: "flex-end",
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
    const fieldOptions = shipmentOptions.data?.model_fields
    const queriesOrdering = useRef();
    
    queriesOrdering.current = [];

    const queries = useQueries({
        queries: shipmentOptions.isFetched ?
            columns.filter(columnName => {
                if (fieldOptions[columnName]?.type == 'related object'){
                    return true
                }
            }).map(columnName => {
                queriesOrdering.current.push(columnName)

                return ({
                    queryKey:[fieldOptions[columnName].related_model_name, data[columnName]],
                    enabled: !!fieldOptions
                })
            })
        :
            [] // If shipment options haven't loaded, an empty array will be returned instead.
    });

    const getDisplayValue = (column) =>{

        const columnOptions = shipmentOptions.data?.model_fields[column];

        switch(columnOptions.type){
            case 'date':
                return (new Date(data[column])).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit'});
            case 'datetime':
                return (new Date(data[column])).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit'});
            case 'choice':
                return columnOptions.choices.find(o => o.value == data[column]).display_name
            case 'related object':
                let relObjQuery = queries[queriesOrdering.current.indexOf(column)]
                return relObjQuery.isFetched ? relObjQuery.data.label : '...';
            default:
                return new String(data[column]);
        }
    }

    const triggerAction = (actionText, event) => {
        actions[actionText].callbackFn(data, event);
    }
    
    return (
        <TableRow key={data.id}>
            {columns.map(c => {
                return(
                    <TableCell sx={{paddingTop:0.5, paddingBottom: 0.5}}>
                        <Typography variant="body2" noWrap>
                        { c == 'id' ?
                            <Link component={RouterLink} to={`/${modelName}s/${data.id}/`}>
                                { !!fieldOptions ? getDisplayValue(c) : null }
                            </Link>
                        :
                            !!fieldOptions ? getDisplayValue(c) : <Skeleton variant="text"/>
                        }
                        </Typography>
                    </TableCell>
                )
            })}

            {   actions ? 
                <TableCell sx={{paddingTop:0.5, paddingBottom: 0.5}}>
                    <Typography variant="body2">
                        <Stack direction="row">
                           { Object.keys(actions).map(actionKey => <ActionButton actionObject={actions[actionKey]} actionText={actionKey} callbackFn={triggerAction}/>) }
                        </Stack>
                    </Typography>
                </TableCell> : 
                null
            }
        </TableRow>
    )
}

const SortingGrid = props => {

    const {title, defaultSortKey="id", defaultColumns, dataModel, rowActions, data, count} = props;
    const [activeColumns, setActiveColumns] = useState(defaultColumns);
    const [sortKey, setSortKey] = useState(defaultSortKey); // The datapoint to sort based on.
    const [sortDirection, setSortDirection] = useState(true); // true: sort ascending, false: sort descending.
    const [recordsPerPage, setRecordsPerPage] = useState(minimumRecordsPerPage);
    const [page, setPage] = useState(1);

    return(
        <Paper className="SortingGrid" sx={SortingGridCardStyles}>
            <Box>
                <Typography variant="h4">{title}</Typography>
            </Box>
            <TableContainer sx={{flexGrow: 1}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            { activeColumns.map(column => <SortingGridColumnHeader column={column} modelName={dataModel} dataManipulation={{setActiveColumns, setSortDirection}}/>) }
                            { rowActions ? <TableCell sx={{verticalAlign:"bottom"}}><Box sx={{display: "flex",gap: "5px",alignItems: "center",}}><Typography sx={{fontWeight: "bold",}}>Actions</Typography></Box></TableCell> : null}
                        </TableRow>
                    </TableHead>
                    <TableBody>

                    {/* Add result rows */}
                    { data?.length > 0 &&
                        data.map( shipment => <SortingGridRow data={shipment} columns={activeColumns} modelName={dataModel} actions={rowActions}/> )
                    }

                    {/* No Results */}
                    { data?.length == 0 && 
                        <TableRow>
                            <TableCell sx={{textAlign: "center", paddingTop:0.5, paddingBottom: 0.5}} colspan={rowActions ? activeColumns.length + 1 : activeColumns.length}>
                                No results.
                            </TableCell>
                        </TableRow>
                    }

                    {/* Loading */}
                    { !data && 
                        <TableRow>
                            <TableCell sx={{textAlign: "center", paddingTop:0.5, paddingBottom: 0.5}} colspan={rowActions ? activeColumns.length + 1 : activeColumns.length}>
                                Loading results...
                            </TableCell>
                        </TableRow>
                    }

                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ maxWidth: "100%", display: "flex", justifyContent: "space-between", marginTop: 1, marginLeft:1, marginRight:1}}>
                <FormControl sx={{flexDirection:"row", alignItems: "center", height: "min-content"}}>
                    <Select
                        size="small"
                        value={recordsPerPage}
                        onChange={e => {setRecordsPerPage(e.target.value)}}
                        sx={{height: "21px"}}
                    >
                        {RecordsPerPageOptions.map(num => <MenuItem value={num}>{num}</MenuItem>)}
                    </Select>
                    <FormHelperText sx={{display:"flex", alignItems: "center"}}>
                        Rows per page
                    </FormHelperText>
                </FormControl>
                <Box sx={{display: "flex", alignItems: "center", gap:2}}>
                    <FormHelperText>
                        {`${Math.max(recordsPerPage * page - recordsPerPage, 1)} - ${Math.min(recordsPerPage * page, count)} of ${count}`}
                    </FormHelperText>
                    <Box sx={{display: "flex", alignItems: "center"}}>
                        <IconButton size="small" sx={{padding:0}}>
                            <FirstPage sx={{color:"rgba(255,255,255,0.7)"}}/>
                        </IconButton>
                        <IconButton size="small" sx={{padding:0}}>
                            <NavigateBefore sx={{color:"rgba(255,255,255,0.7)"}}/>
                        </IconButton>
                        <Box>
                            <FormHelperText>
                                {page}
                            </FormHelperText>
                        </Box>
                        <IconButton size="small" sx={{padding:0}}>
                            <NavigateNext sx={{color:"rgba(255,255,255,0.7)"}}/>
                        </IconButton>
                        <IconButton size="small" sx={{padding:0}}>
                            <LastPage sx={{color:"rgba(255,255,255,0.7)"}}/>
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Paper>
    )
}

export default SortingGrid;