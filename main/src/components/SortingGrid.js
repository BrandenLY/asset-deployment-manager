import React, {useEffect, useRef, useState} from "react";
import { Box, Paper, Typography, IconButton, Popover, List, ListItemButton, ListItemIcon, ListItemText, Link, Stack, Skeleton, FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow } from "@mui/material";
import { MoreVert, ArrowUpward, ArrowDownward, ViewColumn, FirstPage, LastPage, NavigateNext, NavigateBefore, Loop } from '@mui/icons-material';
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { useModelOptions } from "../customHooks";
import ActionButton from "./ActionButton";
import { ErrorBoundary } from "./ErrorBoundary";

const minimumRecordsPerPage = 25;

const RecordsPerPageOptions = [
    minimumRecordsPerPage,
    minimumRecordsPerPage * 2,
    minimumRecordsPerPage * 3,
    minimumRecordsPerPage * 4,
    minimumRecordsPerPage * 10,
    minimumRecordsPerPage * 30,
]

const sortingGridPaperStyles = {
    display: "flex",
    gap:1,
    padding: 2,
    flexDirection: 'column',
    alignItems: 'stretch'
}

const SortingGridColumnHeader = props => {

    const {column, modelName, dataManipulation} = props;

    const modelOptions = useModelOptions(modelName);
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
    
    modelField = modelOptions.data?.model_fields[column];

    if (!modelOptions.isFetched){
        return <Skeleton variant="text" />
    }

    if (modelOptions.isFetched && !modelField){
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
                        textTransform: "capitalize",
                    }}>
                        {modelField ? modelField.label : column}
                    </Typography>
                </Box>
            </TableCell>
        )  
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
                textTransform: "capitalize",
            }}>
                {modelField ? modelField.label : column}
            </Typography>
            
            { (props.disableControls != true) &&
                <IconButton size="small" onClick={togglePopover}>
                    <MoreVert fontSize="inherit" />
                </IconButton>
            }
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

    const {data, columns, actions, modelName, disableControls = false} = props;
    const modelOptions = useModelOptions(modelName);
    const fieldOptions = modelOptions.data?.model_fields
    const queriesOrdering = useRef();
    
    queriesOrdering.current = [];

    const queries = useQueries({
        queries: modelOptions.isFetched ?
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

        if (data[column] == undefined){
            return "";
        }

        const columnOptions = modelOptions.data?.model_fields[column];

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
                            { Object.keys(actions).map( actionKey => {
                                const IconElement = actions[actionKey].icon;
                                const actionCallback = actions[actionKey].callbackFn;
                                return (
                                    <ActionButton actionElement={IconButton} callbackFn={() => {actionCallback(data)}} popoverText={`${actionKey} ${modelName}`}>
                                        <IconElement/>
                                    </ActionButton>
                                )

                            })}
                        </Stack>
                    </Typography>
                </TableCell> : 
                null
            }
        </TableRow>
    )
}

const SortingGrid = props => {

    const {
        title,
        data,
        modelName,
        count,
        rowActions,
        defaultSortKey="id",
        initialColumns=["id", "label"],
        paperProps={},
        RowComponent=SortingGridRow,
        rowProps={},
        disableControls=false
    } = props;

    // Validation
    if ( !modelName == undefined || !data == undefined){
        throw new Error("Sorting grid missing required prop(s).")
    }

    const [activeColumns, setActiveColumns] = useState(initialColumns);
    const [sortKey, setSortKey] = useState(defaultSortKey); // The datapoint to sort based on.  
    const [sortDirection, setSortDirection] = useState(true); // true: sort ascending, false: sort descending.
    const [recordsPerPage, setRecordsPerPage] = useState(minimumRecordsPerPage);
    const [page, setPage] = useState(1);


    // Formmatted Data
    const columnCount = rowActions ? activeColumns.length + 1 : activeColumns.length;

    return(
        <Paper 
            className="SortingGrid"
            {...paperProps}
            sx={{...sortingGridPaperStyles, ...paperProps.sx}}
        >
            <Box>
                <Typography variant="h4">{title}</Typography>
            </Box>

            <TableContainer sx={{flexGrow: 1}}>
                <Table sx={{overflowX:'auto'}}>

                    <TableHead>
                        <TableRow>

                            { activeColumns.map( column => <SortingGridColumnHeader 
                                column={column}
                                dataManipulation={{setActiveColumns, setSortDirection}}
                                {...props}
                            /> ) }

                            { rowActions ? <TableCell sx={{verticalAlign:"bottom"}}><Box sx={{display: "flex",gap: "5px",alignItems: "center",}}><Typography sx={{fontWeight: "bold",}}>Actions</Typography></Box></TableCell> : null}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {/* Add result rows */}
                        { data?.length > 0 &&
                            data.map( rowObject => <RowComponent data={rowObject} columns={activeColumns} modelName={modelName} actions={rowActions} {...rowProps}/> )
                        }

                        {/* No Results */}
                        { data?.length == 0 && 
                            <TableRow>
                                <TableCell sx={{textAlign:"center", paddingTop:0.5, paddingBottom: 0.5}} colspan={columnCount}>
                                <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">No results</Box>
                                </TableCell>
                            </TableRow>
                        }

                        {/* Loading */}
                        { !data && 
                            <TableRow>
                                <TableCell sx={{textAlign:"center", paddingTop:0.5, paddingBottom: 0.5}} colspan={columnCount}>
                                    <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center"><Loop sx={{animation: 'rotate 2s linear infinite'}}/></Box>
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>

                </Table>
            </TableContainer>
            
            { (disableControls != true) &&
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
            }

        </Paper>
    )
}

export default SortingGrid;