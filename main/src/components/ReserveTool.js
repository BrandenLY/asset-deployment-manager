import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import dayjs from 'dayjs';
import React, { useCallback, useContext, useReducer } from "react";
import { backendApiContext, notificationContext } from "../context";


const DEFAULTRESERVATIONSTATE = { startDate: null, endDate: null, quantities: {}, trackedUpdates: [] };

const RESERVATIONSREDUCER = (prev, action) => {

    let state = { ...prev };

    switch (action.type) {

        case 'initial':
            // When initially loading, prev is actually the preferred initial state
            return state;

        case 'reset':
            return { ...DEFAULTRESERVATIONSTATE };

        case 'setStartDate':
            state.startDate = action.date;
            break;

        case 'setEndDate':
            state.endDate = action.date;
            break;

        case 'setQuantity':
            state.quantities[action.modelId] = action.quantity;
            break;

        case 'trackUpdate':
            state.trackedUpdates = [...state.trackedUpdates, action.data];
            break;

        case 'resolveUpdate':

            break;
    }

    return state;

}

const ReserveTool = props => {

    // Hooks
    const theme = useTheme();
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

            const updateUrl = new URL(`${backend.api.baseUrl}/${MODELNAME}/`);
            const requestHeaders = backend.api.getRequestHeaders();

            return fetch(updateUrl, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(reservation),
            });

        },
        onMutate: variables => {

            const trackingData = { ...variables, resolved: false, result: null, error: null };

            // Update state
            dispatchReservations({ type: "trackUpdate", data: trackingData });

        },
        onSettled: (data, error, variables, context) => {

            if (!data.ok) {
                notifications.add({ message: 'Failed to create equipment reservation', severity: 'error' });
                return;
            }

            if (error) {
                console.error(error);
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
        const nonZeroModelQuantities = Object.entries(_reservations.quantities).filter(([_, qty]) => qty > 0);

        nonZeroModelQuantities.forEach(([modelId, qty]) => {

            // Format Payload
            const formattedReservation = {
                model: modelId,
                quantity: qty,
                start_date: `${_reservations.startDate.getFullYear()}-${_reservations.startDate.getMonth() + 1}-${_reservations.startDate.getDate()}`,
                end_date: `${_reservations.endDate.getFullYear()}-${_reservations.endDate.getMonth() + 1}-${_reservations.endDate.getDate()}`,
            }

            // Make mutation
            pushReservations.mutate(formattedReservation);

        });

    }, [pushReservations, reservations]);

    const updateModelQty = useCallback((modelId, quantity) => {
        dispatchReservations({ type: 'setQuantity', modelId, quantity });
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
        <Box padding={1} margin={1}>
            <Box>
                <Typography variant="h5">1. Select the dates of reservation</Typography>
                <Paper sx={{padding:2, marginY:1}}>
                    <Box display="flex" gap={1} justifyContent="center" alignItems="center" paddingY={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                            <DatePicker
                                label="Start date"
                                value={dayjs(reservations.startDate)}
                                onChange={
                                    (value, ctx) => {
                                        dispatchReservations({ type: 'setStartDate', date: value.toDate() });
                                    }
                                }
                            />

                            <Box>
                                <Typography>
                                    To
                                </Typography>
                            </Box>

                            <DatePicker
                                label="End date"
                                value={dayjs(reservations.endDate)}
                                onChange={
                                    (value, ctx) => {
                                        dispatchReservations({ type: 'setEndDate', date: value.toDate() })
                                    }
                                }
                            />

                        </LocalizationProvider>
                    </Box>
                </Paper>
            </Box>

            {!requiresDateSelection &&
                <Box padding={1} margin={`${theme.spacing(1)} 0`}>
                    <Typography variant="h5">2. Select reservation quantities</Typography>
                    <Paper sx={{padding:2, marginY:1}}>
                        <Box display="flex" gap={1} justifyContent="center" alignItems="center" flexDirection="column">
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

export default ReserveTool