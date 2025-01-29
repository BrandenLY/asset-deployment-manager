import { Autocomplete, Box, Button, Paper, Table, TableBody, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ScanTool from '../components/ScanTool'
import { ModelAutoComplete } from '../components/ModelAutoComplete';
import Section from '../components/Section';
import ContentAssetsList, {AssetTableRow, InternalAssetRow} from '../components/ContentAssetsList';
import { useModelOptions, usePermissionCheck } from '../customHooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backendApiContext } from '../context';
import { Delete } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const ScanView = () => {

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const locationShipmentId = (new URLSearchParams(location.search)).get('shipment');

  const backend = useContext(backendApiContext);
  const assetOptions = useModelOptions('asset');
  const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);
  
  // State
  const [selectedShipmentId, setSelectedShipmentId] = useState(locationShipmentId);

  // Queries

  console.log(selectedShipmentId);

  const selectedShipment = useQuery({
    queryKey: ['shipment', selectedShipmentId],
    enabled: selectedShipmentId !== null
  });

  const availableShipments = useQuery({
    queryKey: ['shipment', 'filter-by-status', 0 /* Scheduled Status */],
    queryFn: async () => {

      const formattedUrl = new URL(`${backend.api.baseUrl}/shipment/`);

      // Only get shipments that are in 'scheduled' status.
      formattedUrl.searchParams.set('status', 0 /* Scheduled Status */);

      const res = await fetch(formattedUrl);
      const data = await res.json();

      return data;
    
    }
  });

  // Mutations
  const updateAsset = useMutation({
      mutationFn: (data, method="PUT") => {

          const updateUrl = new URL(`${backend.api.baseUrl}/asset/${data.id}/`);
          const requestHeaders = backend.api.getRequestHeaders(updateUrl);

          // Updates
          let payload = {};

          Object.entries(assetOptions.data.model_fields)
          .forEach( ([fieldName, fieldDetails], _) => {
              if(fieldDetails.read_only){
                  return;
              }
              if(data[fieldName] === undefined){
                  return;
              }
              payload[fieldName] = data[fieldName];
          });

          return fetch(updateUrl, {
              method: method,
              headers: requestHeaders,
              body: JSON.stringify(payload),
          });

      },
      onSettled: (data, error, variables, context) => {

          if (error == null && data.ok){
              // Update state
          }

          refetchState();
      }
  })
  
  // Effects
  useEffect( () => {
    return(() => {
      // Clear state
      setSelectedShipmentId(null);
      selectedShipment.remove();
    })
  }, []) // Setup cleanup function

  useEffect( () => {
    
    if(locationShipmentId == null){
      return;
    }

    setSelectedShipmentId(locationShipmentId);

  }, [locationShipmentId]); // Sync location with selectedShipmentId state var

  useEffect(() => {
    if(selectedShipmentId != null){
      refetchState();
    }
  }, [selectedShipmentId]) // Refetch Query

  // Callback Functions

  const refetchState = () => {
    selectedShipment.refetch();
  }

  const updateShipment = (e, value) => {

    if (value == null){
      setSelectedShipmentId(null);
      return;
    }
    navigate({pathname:"/scan/", search:`?shipment=${value.id}`});
  }

  // Formatted Data
  const selectShipmentInputId = 'scan-tool-shipment-select';
  const selectedShipmentLoaded = selectedShipment.data !== undefined;

  // Render
  return (
    <Box padding={1}>

      <Box padding={1} margin={1}>
        <Paper sx={{padding:2, marginY:1}}>
          <Typography variant="h2">1. Select a shipment</Typography>
          <Box display="flex" justifyContent="center" margin={1} paddingY={2}>
            <Autocomplete 
              id={selectShipmentInputId}
              options={availableShipments.data?.results}
              value={selectedShipment.data}
              onChange={updateShipment}
              renderInput={(params) => <TextField {...params} label="Shipment"/>}
              isOptionEqualToValue={(opt, val) => opt.id == val.id}
              label="Shipment"
              loading={availableShipments.isInitialLoading || availableShipments.isFetching}
              sx={{minWidth:"250px"}}
            />




          </Box>
        </Paper>
      </Box>

      {console.log(selectedShipment, availableShipments)}

      {selectedShipmentLoaded && 
      <Box padding={1} margin={1}>
        <Paper sx={{padding:2, marginY:1}}>
          <Typography variant="h2">2. Scan</Typography>
          <Box paddingY={2}>
            <ScanTool shipment={selectedShipment.data} onSuccessfulScan={refetchState} elevation={2}/>
          </Box>
        </Paper>
      </Box>
      }

      {(selectedShipmentLoaded && selectedShipment.data.asset_counts.total_assets > 0) &&
      <Box padding={1} margin={1}>
        <Paper sx={{padding:2, marginY:1}}>
          <Typography variant="h2">3. Review</Typography>
          <Box>
            <ContentAssetsList 
              obj={selectedShipment.data}
              objContentType="shipment"
            />
          </Box>
        </Paper>
      </Box>
      }

    </Box>
  )
}

export default ScanView