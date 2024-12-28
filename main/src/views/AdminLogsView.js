import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { OpenInNew } from "@mui/icons-material";
import SortingGrid from "../components/SortingGrid";
import ModelListControls from "../components/ModelListControls";
import { backendApiContext, notificationContext } from "../context";
import ChangeLogTableRow from "../components/ChangeLogTableRow";

const MODELNAME = "logentry";
const SORTINGGRIDDEFAULTCOLUMNS = ["id", "label"];

// Primary Component
const AdminLogsView = props => {

    // Hooks
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // Mutations

    // Queries
    const logs = useInfiniteQuery({
        queryKey: [MODELNAME],
    });

    const contentTypes = useInfiniteQuery({queryKey: ['contenttype']});

    // Effects
    useEffect(() => { // Load all logs
         
    },[logs.isFetching, logs.hasNextPage])

    // Callback Functions
    
    // Asset Row Actions

    // Formatted Data

    return (
        <Box className="AdminLogsView">
            <SortingGrid 
                title="Logs"
                modelName={MODELNAME}
                dataQuery={logs}
                initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
            />
        </Box>
    );
};

export default AdminLogsView;
