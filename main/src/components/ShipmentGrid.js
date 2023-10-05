import React, {useEffect, useState} from "react";
import { Box, Paper, Typography, collapseClasses } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow } from "@mui/material";

const ShipmentGrid = props => {

    return(
        <Paper className="ShipmentGrid" sx={{padding:2}} elevation={2}>
            <Typography variant="h4">Manage Shipments</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        { props.columns.map(column => <TableCell key={column}>{column}</TableCell>) }
                    </TableRow>
                </TableHead>
                <TableBody>
                { !props.data && 
                    <TableRow>
                        <TableCell sx={{textAlign: "center", paddingY:"75px"}} colspan={props.columns.length}>
                            No shipments found.
                        </TableCell>
                    </TableRow>
                }
                { props.data &&
                    props.data.map( s => {
                        return (
                            <TableRow>
                                <TableCell>
                                    {s.id}
                                </TableCell>
                                <TableCell>
                                    {s.origin}
                                </TableCell>
                                <TableCell>
                                    {s.destination}
                                </TableCell>
                            </TableRow>
                        )
                    })
                }
                </TableBody>
            </Table>
        </Paper>
    )
}

export default ShipmentGrid;