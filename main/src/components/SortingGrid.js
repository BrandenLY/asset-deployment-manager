import React, {useCallback, useContext, useRef, useState} from "react";
import { Box, Paper, Typography, IconButton, Popover, List, ListItemButton, ListItemIcon, ListItemText, Link, Stack, Skeleton, FormControl, FormHelperText, MenuItem, Select, ListItem, FormControlLabel, Checkbox, useTheme } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { MoreVert, ArrowUpward, ArrowDownward, ViewColumn, FirstPage, LastPage, NavigateNext, NavigateBefore, Loop } from '@mui/icons-material';
import { useQueries } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { useModelOptions } from "../customHooks";
import ActionButton from "./ActionButton";
import { backendApiContext, notificationContext } from "../context";

// Constants
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
    gap: 1,
    padding: 2,
    flexDirection: 'column',
    alignItems: 'stretch'
}

// Helper Functions
const universalSort = (arr, key, direction) => {
    return [...arr].sort((a, b) => {
        
        const value1 = a[key];
        const value2 = b[key];

        // Handle undefined or null values (sort them to the end)
        if (value1 == null) return 1;
        if (value2 == null) return -1;
    
        // Compare based on type
        const typeSample = typeof value1;
    
        if (typeSample === 'number' || typeSample === 'boolean') {
        return direction ? value1 - value2 : value2 - value1; // Numeric comparison works for both numbers and booleans
        } else if (typeSample === 'string') {
        return value1.localeCompare(value2); // Lexical string comparison
        } else if (value1 instanceof Date && value2 instanceof Date) {
        return direction ? value1 - value2 : value2 - value1; // Date comparison
        } else {
        return 0; // For other data types, assume equality (or customize further)
        }

      });
}

// Primary Component
const SortingGrid = props => {

    // Props Destructuring
    const {
        title,
        dataQuery,
        modelName,
        count,
        rowActions,
        sortKey:initialSortKey=null,
        initialColumns=["id", "label"],
        additionalAvailableColumns=[],
        paperProps={},
        rowComponent:RowComponent=SortingGridRow,
        rowProps={},
        disableControls=false,
        maxRowsPerPage=null
    } = props;

    // Validation
    const requiredProps = ['modelName', 'dataQuery']
    requiredProps.forEach( propName => { // Loop over and check for each required propertyName in props
        if(propName in props){
            // Valid
            return;
        }
        else{
            // Invalid/missing prop
            throw new Error(`Sorting grid did not receive required property '${propName}'`)
        }
    });

    // Hooks
    const modelOptions = useModelOptions(modelName);
    const notifications = useContext(notificationContext); 

    const [activeColumns, setActiveColumns] = useState(initialColumns);
    const [sortKey, setSortKey] = useState(initialSortKey); // The datapoint to sort based on.  
    const [sortDirection, setSortDirection] = useState(true); // true: sort ascending, false: sort descending.
    const [recordsPerPage, setRecordsPerPage] = useState(maxRowsPerPage ? maxRowsPerPage : minimumRecordsPerPage);
    const [page, setPage] = useState(1);

    // Formmatted Data
    const queryType = dataQuery.data?.hasOwnProperty('pages') ? 'Infinite' : 'Regular';
    let pageResults = undefined;
    let dataCount = 0;
    let lastPageNum = 1;

    if(dataQuery.isSuccess){

        switch(queryType){

            case 'Infinite':
                // FIXME: WHEN LOADING PAGES OUT OF ORDER, EXAMPLE LOADING FIRST PAGE,
                // NAVIGATING TO THE LAST PAGE AND THEN NAVIGATING BACK TO THE THIRD,
                // IT IS NOT CERTAIN THAT THE THIRD PAGE'S DATA WILL BE AT THE INDEX OF THE PAGE NUMBER - 1.
                const currentPageIndex = dataQuery.data?.pageParams.indexOf(page == 1 ? undefined : String(page));

                if(currentPageIndex == -1){
                    break;
                }
                
                const currentPage = dataQuery.data?.pages?.at(currentPageIndex); // Pages is 0-indexed while page state is 1-indexed
                const currentPageIsFetched = currentPage != undefined;
                
                if(currentPageIsFetched){
                    pageResults = currentPage.results;
                    dataCount = currentPage.count;
                }
                else{
                    // dataQuery.fetchNextPage({pageParam: page, cancelRefetch: false});
                    pageResults = dataQuery.data?.pages?.at(page - 1);
                    dataCount = dataQuery.data?.pages?.at(page - 1)?.count;
                }
                break;
            
            case 'Regular':
                pageResults = dataQuery.data.slice(recordsPerPage * page - recordsPerPage, recordsPerPage * page);
                dataCount = dataQuery.data.length;
                break;
        }

        lastPageNum = Math.ceil(dataCount / recordsPerPage);
    }

    // Query Navigation Callback Functions
    const navigateFirstPage = e => {
        setPage(1);
    }

    const navigatePreviousPage = async e => {
        
        switch(queryType){
            case 'Infinite':
                // For infinite queries, check to see if we've already loaded the previous page's data
                const prevPageNum = page - 1;
                const prevPageIndex = dataQuery.data?.pageParams.indexOf(prevPageNum == 1 ? undefined : String(prevPageNum));

                if(prevPageIndex == -1){
                    console.log('awaiting previous page')
                    await dataQuery.fetchNextPage({pageParam:String(prevPageNum)});
                    console.log('received previous page')
                }

                setPage(page => page - 1);
                break;

            case 'Regular':
                // For regular queries, an additional fetch is not required, as all data is returned in the first response.
                setPage(page => page - 1);
                break;
        }
    }

    const navigateNextPage = async e => {

        switch(queryType){
            case 'Infinite':
                // For infinite queries, check to see if we've already loaded the next page's data
                const nextPageNum = page + 1;
                const nextPageIndex = dataQuery.data?.pageParams.indexOf(String(nextPageNum))
        
                if(nextPageIndex == -1){
                    await dataQuery.fetchNextPage(); // Fetch next page
                }
        
                setPage(nextPageNum);
                break;
            
            case 'Regular':
                // For regular queries, an additional fetch is not required, as all data is returned in the first response.
                setPage(page => page + 1);
                break;
        }

    }

    const navigateLastPage = async e => {

        switch(queryType){

            case 'Infinite':
                // For infinite queries, check to see if we've already loaded the last page's data
                const lastPage = dataQuery.data?.pages.at(lastPageNum - 1); // Pages is 0-indexed while page state is 1-indexed

                if(lastPage == undefined){
                    await dataQuery.fetchNextPage({pageParam: String(lastPageNum)});
                }

                setPage(lastPageNum);
                break;

            case 'Regular':
                // For regular queries, an additional fetch is not required, as all data is returned in the first response.
                setPage(lastPageNum);
                break;

            
        }
    }

    // Misc. Callback Functions
    const updateSortKey = key => {

        try{
            const sample = data[0][key];
            
            switch(typeof(sample)){
                case "undefined":
                    throw new Error('Cannot sort on undefined');
                case "symbol":
                    throw new Error('Cannot sort on symbol');
                default:
                    setSortKey(key)
            }
        }

        catch{
            notifications.add({message: `Unable to sort on column ${key}`})
        }

    }
    const updateSortDirection = direction => {
        // true: sort ascending, false: sort descending
        if (sortDirection != direction){
            setSortDirection(direction);
        }
    }
    const updateActiveColumns = columns => {
        setActiveColumns(columns);
    }

    // Formmatted Data
    // const sortedData = data ? universalSort(data, sortKey, sortDirection) : [];
    const columnCount = rowActions ? activeColumns.length + 1 : activeColumns.length;
    const hasNextPage = page < lastPageNum;
    const hasPrevPage = page > 1;
    const databaseColumns = modelOptions.isSuccess ? 
    Object.entries(modelOptions.data.model_fields)
    .map( ([fieldName, _]) => fieldName) :
    []
    const availableColumns = databaseColumns.concat(additionalAvailableColumns);
    
    return(
        <Paper 
            className="SortingGrid"
            {...paperProps}
            sx={{...sortingGridPaperStyles, ...paperProps.sx}}
        >
            <Box>
                <Typography variant="h4">{title}</Typography>
            </Box>

            <TableContainer sx={{flexGrow: 1, flexShrink: 0}}>
                <Table sx={{overflowX:'auto'}}>

                    <TableHead>
                        <TableRow>

                            { activeColumns.map( column => <SortingGridColumnHeader 
                                column={column}
                                activeColumns={activeColumns}
                                availableColumns={availableColumns}
                                dataControls={{updateSortKey, updateSortDirection, updateActiveColumns}}
                                {...props}
                            /> ) }

                            { rowActions ? 
                                <TableCell sx={{verticalAlign:"bottom"}}>
                                    <Box sx={{display: "flex",gap: "5px",alignItems: "center",}}>
                                        <Typography sx={{fontWeight: "bold",}}>Actions</Typography>
                                    </Box>
                                </TableCell> 
                            : 
                                null
                            }

                        </TableRow>
                    </TableHead>

                    <TableBody>

                        {/* Add result rows */}
                        { pageResults &&
                            pageResults.map( rowObject => <RowComponent data={rowObject} columns={activeColumns} modelName={modelName} actions={rowActions} {...rowProps}/> )
                        }

                        {/* No Results */}
                        { pageResults?.length == 0 && 
                            <TableRow>
                                <TableCell sx={{textAlign:"center", paddingTop:0.5, paddingBottom: 0.5}} colspan={columnCount}>
                                <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">No results</Box>
                                </TableCell>
                            </TableRow>
                        }

                        {/* Loading */}
                        { (dataQuery.isLoading || dataQuery.isFetching || dataQuery.isRefetching || pageResults == undefined) && 
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
                    {!maxRowsPerPage ?
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
                    :
                    <Box> {/* Used for spacing/layout consistency */} </Box>
                    }

                    <Box sx={{display: "flex", alignItems: "center", gap:2}}>
                        <FormHelperText>
                            {`${Math.max((recordsPerPage * page) + 1 - recordsPerPage, 1)} - ${Math.min(recordsPerPage * page, dataCount)} of ${dataCount}`}
                        </FormHelperText>
                        <Box sx={{display: "flex", alignItems: "center"}}>
                            
                            <ActionButton
                                popoverText="Go to first page"
                                actionElement={IconButton}
                                elementProps={{
                                    disabled: page==1,
                                    size: "small",
                                    sx: {padding:0},
                                }}
                                callbackFn={navigateFirstPage}
                            >
                                <FirstPage />
                            </ActionButton>
                            
                            <ActionButton
                                popoverText="Go to previous page"
                                actionElement={IconButton}
                                elementProps={{
                                    disabled: !hasPrevPage,
                                    size: "small",
                                    sx: {padding:0},
                                }}
                                callbackFn={navigatePreviousPage}
                            >
                                <NavigateBefore />
                            </ActionButton>

                            <Box>
                                <FormHelperText>
                                    {page}
                                </FormHelperText>
                            </Box>
                            
                            <ActionButton
                                popoverText="Go to next page"
                                actionElement={IconButton}
                                elementProps={{
                                    disabled:!hasNextPage,
                                    size: "small",
                                    sx: {padding:0},
                                }}
                                callbackFn={navigateNextPage}
                            >
                                <NavigateNext />
                            </ActionButton>

                            <ActionButton
                                popoverText="Go to last page"
                                actionElement={IconButton}
                                elementProps={{
                                    disabled: page == lastPageNum,
                                    size: "small",
                                    sx: {padding:0},
                                }}
                                callbackFn={navigateLastPage}
                            >
                                <LastPage/>
                            </ActionButton>

                        </Box>
                    </Box>

                </Box>
            }

        </Paper>
    )
}

// Supplementary Components
const SortingGridColumnHeader = props => {

    const {column, modelName, activeColumns, availableColumns, dataControls} = props;

    const modelOptions = useModelOptions(modelName);
    const [popoverAnchor, setPopoverAnchor] = useState(null);
    const [columnPopoverAnchor, setColumnPopoverAnchor] = useState(null);

    const togglePopover = useCallback((event) => {
        if (popoverAnchor == null){
            setPopoverAnchor( event.target );
            return;
        }
        setPopoverAnchor(null);
    }, [popoverAnchor]);

    const sortAscending = useCallback((event) => {
        dataControls.updateSortKey(column);
        dataControls.updateSortDirection(true) // true = ascending, false = descending
    },[dataControls])

    const sortDescending = useCallback((event) => {
        dataControls.updateSortKey(column);
        dataControls.updateSortDirection(false) // true = ascending, false = descending
    },[dataControls])

    const toggleColumnPopover = (event) => {
        if(columnPopoverAnchor == null){
            setColumnPopoverAnchor( event.target )
            return;
        }
        setColumnPopoverAnchor(null);
        setPopoverAnchor(null);
    }

    const EditColumns = useCallback((event) => {

        if(activeColumns.includes(event.target.id)){ // Deselect Column
            dataControls.updateActiveColumns(prev => {
                let newActiveColumns = [...prev].filter(col => col != event.target.id);
                return(newActiveColumns);
            })
        }
        else{ // Select Column
            dataControls.updateActiveColumns(activeColumns.concat([event.target.id]))
        }

    },[dataControls])

    const open = popoverAnchor;
    const columnSelectOpen = columnPopoverAnchor;
    const id = open ? `${column}-options` : undefined;
    let modelField = null;    
    modelField = modelOptions.data?.model_fields[column];

    // Display loading state
    if (!modelOptions.isFetched){
        return <Skeleton variant="text" />
    }

    // Disable column controls
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
                        textWrap: "nowrap"
                    }}>
                        {modelField ? modelField.label : column}
                    </Typography>
                </Box>
            </TableCell>
        )  
    }

    // Fully functional column header
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
                textWrap: "nowrap"
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
                    <ListItemButton onClick={sortAscending} disablePadding >
                        <ListItemIcon sx={{pointerEvents:"none"}}>
                            <ArrowUpward />
                        </ListItemIcon>
                        <ListItemText primary='Sort ascending' sx={{pointerEvents:"none"}}/>
                    </ListItemButton>
                    <ListItemButton onClick={sortDescending} disablePadding>
                        <ListItemIcon sx={{pointerEvents:"none"}}>
                            <ArrowDownward />
                        </ListItemIcon>
                        <ListItemText primary='Sort descending' sx={{pointerEvents:"none"}}/>
                    </ListItemButton>
                    <ListItemButton onClick={toggleColumnPopover} disablePadding>
                        <ListItemIcon sx={{pointerEvents:"none"}}>
                            <ViewColumn />
                        </ListItemIcon>
                        <ListItemText primary='Edit columns' sx={{pointerEvents:"none"}}/>
                    </ListItemButton>
                </List>
            </Popover>

            <Popover
                id="column-select"
                open={columnSelectOpen}
                anchorEl={columnPopoverAnchor}
                onClose={toggleColumnPopover}
                anchorOrigin={{
                    vertical: 'middle',
                    horizontal: 'right',
                }}
            >
                <List>
                    {availableColumns.map( columnName => {
                        return(
                            <ListItem>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            id={columnName}
                                            disabled={columnName == 'id'}
                                            checked={activeColumns.includes(columnName)}
                                            onChange={EditColumns}
                                        />
                                    }
                                    label={columnName}
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </Popover>
        </TableCell>
    )
}

const SortingGridRow = props => {

    // Props destructuring
    const {data, columns, actions, modelName, disableControls = false} = props;

    // Hooks
    const theme = useTheme();
    const queriesOrdering = useRef();
    const backend = useContext(backendApiContext);
    const modelOptions = useModelOptions(modelName);

    const fieldOptions = modelOptions.data?.model_fields;
    
    queriesOrdering.current = [];

    // Queries
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
            [] // If models options haven't loaded, an empty array will be returned instead.
    });

    // Callback Function
    const getDisplayValue = useCallback((column) =>{

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
                return JSON.stringify(data[column]);
        }
    }, [modelOptions]);
    
    return (
        <TableRow key={data.id}>
            {columns.map(c => {
                return(
                    <TableCell sx={{paddingTop:0.5, paddingBottom: 0.5}}>
                        <Typography variant="body2" noWrap>
                        { c == 'id' ?
                            <Link component={RouterLink} to={`/${modelName}s/${data.id}/`} sx={{zIndex: theme.zIndex.appBar}}>
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
                                const actionPermission = actions[actionKey].requiredPermission;
                                let hasPermission = false;

                                if(actionPermission){
                                    hasPermission = backend.auth.user ? backend.auth.user.checkPermission(actionPermission) : false;
                                }
                                else{
                                    hasPermission = true;
                                }

                                return (
                                    <ActionButton 
                                        actionElement={IconButton}
                                        elementProps={{disabled: !hasPermission}}
                                        callbackFn={() => {actionCallback(data)}} popoverText={`${actionKey} ${modelName}`}>
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

export default SortingGrid;