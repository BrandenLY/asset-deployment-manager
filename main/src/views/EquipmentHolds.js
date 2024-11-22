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
const SORTINGGRIDDEFAULTCOLUMNS = ['id', 'model', 'quantity', 'start_date', 'end_date'];
const CREATEEQUIPMENTHOLDFORMLAYOUT = [
  ['start_date', 'end_date'],
  ['model', 'quantity'],
  ['event']
];

const EquipmentHolds = props => {

  // Props Destructuring
  const { } = props;

  // Queries
  const equipmentholds = useInfiniteQuery({ queryKey: [MODELNAME] });


  // Formatted Data
  const allLoadedEquipmentHolds = equipmentholds.data?.pages.map(p => p.results).flat();
  const equipmentHoldCount = equipmentholds.data?.pages.reduce((count, page) => count + page.results.length, 0);

  return (
    <Box className="EquipmentHoldView">

      <ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEEQUIPMENTHOLDFORMLAYOUT} />
      <SortingGrid
        title="Equipment Reservations"
        modelName={MODELNAME}
        data={allLoadedEquipmentHolds}
        count={equipmentHoldCount}
        initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
        paperProps={{ elevation: 2 }}
      />

    </Box>
  )

}

const EquipmentSelectionRow = props => {

  // Props Destructuring
  const { model, value, onChange } = props;

  const modelIcon = useQuery({ queryKey: ['asseticon', model.icon] });

  return (
    <Box display="flex" maxWidth="450px" width="100%">

      <Box flexGrow={1} gap={1} display="flex" alignItems="flex-start">

        {modelIcon.isSuccess ? <AssetIcon iconName={modelIcon.data.source_name} /> : null}

        <Box>
          <Typography fontSize="1.15rem" fontWeight="bold">{model.label}</Typography>
          <Typography fontSize="0.85rem" fontWeight="lighter">Manufacturer: {model.manufacturer}</Typography>
          {model.isContainer ? <Typography variant="code">Container</Typography> : null}
        </Box>

      </Box>

      <Box>
        <IntegerSelector onChange={onChange} value={value} />
      </Box>

    </Box>
  );

}

export default EquipmentHolds