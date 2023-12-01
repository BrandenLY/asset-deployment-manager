import React, {useEffect, useState} from "react";
import { Box, Paper, Typography, collapseClasses } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow } from "@mui/material";

const SortingGrid = props => {

    const [activeColumns, setActiveColumns] = useState(props.initialColumns);

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
                { !props.data && 
                    <TableRow>
                        <TableCell sx={{textAlign: "center", paddingY:"75px"}} colspan={activeColumns.length}>
                            No shipments found.
                        </TableCell>
                    </TableRow>
                }
                </TableBody>
            </Table>
        </Paper>
    )
}

export default SortingGrid;