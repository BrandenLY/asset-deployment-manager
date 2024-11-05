import React, { useContext, useState } from "react";
import { Box, FormControl, InputLabel, OutlinedInput, Paper, TextField, Typography } from "@mui/material";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const {addNotif} = props;

  // Hooks
  const backend = useContext(backendApiContext);

  // State
  const [reserveQty, setReserveQty] = useState({});
  const [newReservationEndDate, setNewReservationEndDate] = useState(null);
  const [newReservationsStartDate, setNewReservationStartDate] = useState(null);

  // Queries
  const models = useInfiniteQuery({queryKey:['model']});
  const equipmentholds = useInfiniteQuery({queryKey:[MODELNAME]});

  // Mutations
  const pushReservations = useMutation({
    mutationFn : (reservation) => {

      const updateUrl = new URL(`${backend.api.baseUrl}/${MODELNAME}/`);
      const requestHeaders = backend.api.getRequestHeaders();
    
      return fetch(updateUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(data),
      });

    },
    onSuccess: (data, error, variables, context) => {
      
    }
  })

  // Callback Functions
  const updateModelQty = (modelId, qty) => {
    setReserveQty(prev => {
      let newQty = {...prev};
      newQty[modelId] = qty;
      return(newQty);
    })
  }

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
                allLoadedModels.map(m => {

                  const mQty = reserveQty[m.id]
                  const value = mQty != undefined ? mQty : 0;

                  return(
                    <EquipmentSelectionRow
                      key={m.id} 
                      model={m} 
                      onChange={qty => { updateModelQty(m.id, qty) }} 
                      value={value}
                    />
                  )

                })
              }
            </Box>
          </Box>
        }

      </Section>
      <Section
        title="Existing Reservations"
        actions={[<ModelListControls model={MODELNAME} createObjectsFormLayout={CREATEEQUIPMENTHOLDFORMLAYOUT}/>]}
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
  const {model, value, onChange} = props;

  return(
    <Box display="flex" maxWidth="450px" width="100%">
      <Box flexGrow={1} display="flex" alignItems="center">{model.label}</Box>
      <Box>
        <IntegerSelector onChange={onChange} value={value}/>
      </Box>
    </Box>
  );

}

export default EquipmentHolds