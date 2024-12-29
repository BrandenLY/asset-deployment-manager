import { Box, Button, FormControl, InputLabel, OutlinedInput, Paper, TextField, Typography, useTheme } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import dayjs from 'dayjs';
import React, { useCallback, useContext, useReducer } from "react";
import AssetIcon from "../components/AssetIcon";
import IntegerSelector from '../components/IntegerSelector';
import ModelListControls from "../components/ModelListControls";
import Section from '../components/Section';
import SortingGrid from "../components/SortingGrid";
import { backendApiContext, notificationContext } from "../context";
import ReserveTool from "../components/ReserveTool";

const MODELNAME = 'equipmenthold';
const SORTINGGRIDDEFAULTCOLUMNS = ['id', 'start_date', 'end_date'];
const CREATEEQUIPMENTHOLDFORMLAYOUT = [
  ['start_date', 'end_date'],
  ['event']
];

const EquipmentHolds = props => {

  // Props Destructuring
  const { } = props;

  // Queries
  const equipmentholds = useInfiniteQuery({ queryKey: [MODELNAME] });

  return (
    <Box className="EquipmentHoldView">

      <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEEQUIPMENTHOLDFORMLAYOUT} />
      <SortingGrid
        title="Equipment Reservations"
        modelName={MODELNAME}
        dataQuery={equipmentholds}
        initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
      />

    </Box>
  )

}

export default EquipmentHolds