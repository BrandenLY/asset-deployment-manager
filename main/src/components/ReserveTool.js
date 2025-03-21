import { Box, Button, Paper, Typography, TextField } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import dayjs from 'dayjs';
import React, { useCallback, useContext, useReducer } from "react";
import { backendApiContext, notificationContext } from "../context";
import IntegerSelector from "./IntegerSelector";
import AssetIcon from "./AssetIcon";

// Constants
const DEFAULTRESERVATIONSTATE = { title:null, startDate: null, endDate: null, quantities: {} };

const RESERVATIONSREDUCER = (prev, action) => {

    let state = { ...prev };

    switch (action.type) {

        case 'initial':
            // When initially loading, prev is actually the preferred initial state
            return state;

        case 'reset':
            return { ...DEFAULTRESERVATIONSTATE };

        case 'setTitle':
            state.title = action.title;

        case 'setStartDate':
            state.startDate = action.date;
            break;

        case 'setEndDate':
            state.endDate = action.date;
            break;

        case 'setQuantity':
            state.quantities[action.modelId] = action.quantity;
            break;
        
        case 'resolveUpdate':

            break;
    }

    return state;

}

const MODELNAME = 'equipmenthold';

const FORMATDATE = date => {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;

}

// Primary Component
const ReserveTool = props => {

    // Hooks
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // State
    const [reservations, dispatchReservations] = useReducer(
        RESERVATIONSREDUCER,
        { ...DEFAULTRESERVATIONSTATE },
        initialArg => RESERVATIONSREDUCER(initialArg, { type: 'initial' })
    )

    // Queries
    const models = useInfiniteQuery({ queryKey: ['model'] });

    // Mutations
    const pushReservations = useMutation({
        mutationFn: (reservation) => {

            console.log('Mutating', reservation);

            const updateUrl = new URL(`${backend.api.baseUrl}/${MODELNAME}/`);
            const requestHeaders = backend.api.getRequestHeaders();

            return fetch(updateUrl, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(reservation),
            });

        },
        onSettled: (data, error, variables, context) => {

            if (error) {
                console.error(error);
                notifications.add({ message: 'Failed to create equipment reservation', severity: 'error' });
                return;
            }

            if (!data.ok) {
                notifications.add({ message: 'Failed to create equipment reservation', severity: 'error' });
                return;
            }

            notifications.add({ message: 'Successfully created equipment reservations' });

        }
    });

    // Callback Functions
    const resetState = useCallback(e => {
        dispatchReservations({ type: 'reset' });
    }, [dispatchReservations]);

    const submitReservations = useCallback(e => {

        const _reservations = { ...reservations };
        const reservationPayload = {}
        
        // Format Payload
        reservationPayload.title = _reservations.title;
        reservationPayload.start_date = FORMATDATE(_reservations.startDate);
        reservationPayload.end_date = FORMATDATE(_reservations.endDate);

        reservationPayload.reservation_items = Object.entries(_reservations.quantities)
        .filter(([modelId, qty]) => qty > 0)
        .map( ([modelId, qty]) => {
            return {
                model: modelId,
                quantity: qty
            }
        });

        console.log('Attempting mutation', reservationPayload);
        pushReservations.mutate(reservationPayload);

    }, [pushReservations, reservations]);

    const updateModelQty = useCallback((modelId, quantity) => {
        if ( quantity < 0){
            dispatchReservations({ type: 'setQuantity', modelId, quantity:0 });
        }
        else{
            dispatchReservations({ type: 'setQuantity', modelId, quantity });
        }
    }, [dispatchReservations]);

    // Formatted Data
    const allLoadedModels = models.data?.pages.map(p => p.results).flat();
    const requiresDateSelection = reservations.endDate == null || reservations.startDate == null;
    const reservationsIsModified = JSON.stringify(reservations) != JSON.stringify(DEFAULTRESERVATIONSTATE);
    const reservationsHaveNonZeroQty = Object.entries(reservations.quantities).map(([_, qty]) => qty > 0).includes(true);
    const reservationsHasRequiredData = (reservations.startDate != null && reservations.endDate != null) && reservationsHaveNonZeroQty;

    const submitButton = <Button variant="outlined" color="primary" onClick={submitReservations}>Submit</Button>;
    const resetButton = <Button variant="outlined" color="error" onClick={resetState}>Reset</Button>;

    return (
        <Box padding={1}>
            <Box padding={1} margin={1}>
                <Paper sx={{padding:2, marginY:1}}>
                    <Typography variant="h2">1. Enter reservation title (optional)</Typography>
                    <Box display="flex" gap={1} justifyContent="center" alignItems="center" paddingY={2}>
                        
                        <TextField 
                            label="Title"
                            variant="outlined"
                            value={reservations.title}
                            sx={{width: "320px"}}
                            onChange={e => {
                                dispatchReservations({type: 'setTitle', title: e.target.value})
                            }}
                        />

                    </Box>
                </Paper>
            </Box>

            <Box padding={1} margin={1}>
                <Paper sx={{padding:2, marginY:1}}>
                    <Typography variant="h2">2. Select the dates of reservation</Typography>
                    <Box display="flex" gap={1} justifyContent="center" alignItems="center" paddingY={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                            <DatePicker
                                label="Start date"
                                value={reservations.startDate ? dayjs(reservations.startDate) : null}
                                onChange={(value, ctx) => {
                                    dispatchReservations({ type: 'setStartDate', date: value.toDate() });
                                }}
                            />

                            <Box>
                                <Typography sx={{opacity:"70%"}}>
                                    To
                                </Typography>
                            </Box>

                            <DatePicker
                                label="End date"
                                value={reservations.endDate ? dayjs(reservations.endDate) : null}
                                onChange={(value, ctx) => {
                                    dispatchReservations({ type: 'setEndDate', date: value.toDate() })
                                }}
                            />

                        </LocalizationProvider>
                    </Box>
                </Paper>
            </Box>

            {!requiresDateSelection &&
                <Box padding={1} margin={1}>
                    <Paper sx={{padding:2, marginY:1}}>
                        <Typography variant="h2">3. Select reservation quantities</Typography>
                        <Box display="flex" paddingY={2} gap={1} justifyContent="center" alignItems="center" flexDirection="column" width="100%">
                            {allLoadedModels &&
                                allLoadedModels.map(m => {

                                    const mQty = reservations.quantities[m.id]
                                    const value = mQty != undefined ? mQty : 0;

                                    return (
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
                    </Paper>
                </Box>
            }

            <Box display="flex" justifyContent="center" gap={1}>
                {reservationsHasRequiredData ? submitButton : null}
                {reservationsIsModified ? resetButton : null}
            </Box>
        </Box>
    );
}

// Supplementary components
const EquipmentSelectionRow = props => {

    // Props Destructuring
    const { model, value, onChange } = props;
  
    const modelIcon = useQuery({ queryKey: ['asseticon', model.icon] });
  
    return (
      <Box display="flex" maxWidth="450px" width="100%">
  
        <Box flexGrow={1} gap={1} display="flex" alignItems="flex-start">
  
          {modelIcon.isSuccess ? <AssetIcon iconName={modelIcon.data.source_name} /> : null}
  
          <Box>
            <Typography fontSize="0.85rem" sx={{opacity:"80%"}}>{model.manufacturer}</Typography>
            <Typography fontSize="1.15rem" fontWeight="bold">{model.label}</Typography>
            {model.isContainer ? <Typography variant="code">Container</Typography> : null}
          </Box>
  
        </Box>
  
        <Box>
          <IntegerSelector onChange={onChange} value={value} />
        </Box>
  
      </Box>
    );
  
}

export default ReserveTool