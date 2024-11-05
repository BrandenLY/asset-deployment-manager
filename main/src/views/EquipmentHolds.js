import React, { useContext, useState } from "react";
import { Box, FormControl, InputLabel, OutlinedInput, Paper, TextField, Typography } from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import SortingGrid from "../components/SortingGrid";
import ModelListControls from "../components/ModelListControls";
import { backendApiContext, notificationContext } from "../context";
import Section from '../components/Section';
import IntegerSelector from '../components/IntegerSelector';

const MODELNAME = 'equipmenthold';
const SORTINGGRIDDEFAULTCOLUMNS = [];
const CREATEEQUIPMENTHOLDFORMLAYOUT = [];

const EquipmentHolds = props => {
  
  // Props Destructuring
  const {} = props;

  // State
  const [newReservationEndDate, setNewReservationEndDate] = useState(null);
  const [newReservationsStartDate, setNewReservationStartDate] = useState(null);

  // Queries
  const models = useInfiniteQuery({queryKey:['model']});
  const equipmentholds = useInfiniteQuery({queryKey:[MODELNAME]});

  // Formatted Data
  const allLoadedEquipmentHolds = equipmentholds.data?.pages.map(p => p.results).flat();
  const equipmentHoldCount = equipmentholds.data?.pages.reduce((count, page) => count + page.results.length, 0);
  const allLoadedModels = models.data?.pages.map(p => p.results).flat();
  const requiresDateSelections = newReservationEndDate == null || newReservationsStartDate == null;

  console.log(models, allLoadedModels);

  return (
    <Box className="EquipmentHoldView">
      <Section
        title="Reserve Equipment"
        defaultExpanded={true}
      >
        <Box padding={1}>
          <Typography variant="h5">1. Select the dates of reservation</Typography>
          <Box display="flex" gap={1} justifyContent="center" alignItems="center" paddingY={2}>


              <FormControl>
                  <InputLabel shrink variant="outlined" error={null}>
                      Start date
                  </InputLabel>
                  
                  <OutlinedInput
                      type="date"
                      value={newReservationsStartDate}
                      label="Start date"
                      notched={true}
                      onChange={(e) => {setNewReservationStartDate(e.target.value)}}
                      required={true}
                      sx={{appearance:"none"}}
                  />
              </FormControl>

              <Box>
                  <Typography>
                      To
                  </Typography>
              </Box>

              <FormControl>
                  <InputLabel shrink variant="outlined" error={null}>
                      End date
                  </InputLabel>
                  
                  <OutlinedInput
                      type="date"
                      value={newReservationEndDate}
                      label="End date"
                      notched={true}
                      onChange={(e) => {setNewReservationEndDate(e.target.value)}}
                      required={true}
                      sx={{appearance:"none"}}
                  />
              </FormControl>

          </Box>
        </Box>

        {!requiresDateSelections &&
          <Box padding={1}>
            <Typography variant="h5">2. Select reservation quantities</Typography>
            <Box display="flex" gap={1} justifyContent="center" alignItems="center" flexDirection="column">
              {allLoadedModels &&
                allLoadedModels.map(m => <EquipmentSelectionRow key={m.id} model={m} />)
              }
            </Box>
          </Box>
        }

      </Section>
      <Section
        title="Existing Reservations"
      >
        <SortingGrid 
          title="Equipment Reservations"
          modelName={MODELNAME}
          data={allLoadedEquipmentHolds}
          count={equipmentHoldCount}
          initialColumns={SORTINGGRIDDEFAULTCOLUMNS}
        />
      </Section>
    </Box>
  )

}

const EquipmentSelectionRow = props => {

  // Props Destructuring
  const {model} = props;

  return(
    <Box display="flex" maxWidth="450px" width="100%">
      <Box flexGrow={1} display="flex" alignItems="center">{model.label}</Box>
      <Box><IntegerSelector /></Box>
    </Box>
  );

}

export default EquipmentHolds