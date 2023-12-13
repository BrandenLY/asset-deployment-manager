import React, {useEffect, useState} from "react";
import { Box, Paper, Typography, collapseClasses } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow } from "@mui/material";

const SortingGridRow = ({data, columns}) => {
    console.log(data);
    return (
        <TableRow key={data.id}>
            {columns.map(cv => <TableCell>{data[cv]}</TableCell>)}
        </TableRow>
    )
}

const SortingGrid = props => {

    const [activeColumns, setActiveColumns] = useState(props.initialColumns);
    const [sortDirection, setSortDirection] = useState(true); // true: sort ascending, false: sort descending.
    const [sortKey, setSortKey] = useState(props.sortKey ? props.sortKey : "Id"); // The datapoint to sort based on.

    return(
        <Paper className="ShipmentGrid" sx={{padding:2}} elevation={2}>
            <Typography variant="h4">{props.name}</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        { activeColumns.map(column => <TableCell key={column}>{column}</TableCell>) }
                    </TableRow>
                </TableHead>
                <TableBody>

                {/* Add result rows */}
                {props.data &&
                    props.data.map( data => <SortingGridRow data={data} columns={activeColumns}/> )
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
        </Paper>
    )
}

export default SortingGrid;