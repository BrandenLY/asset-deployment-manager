import { Box, Button, Paper, Typography } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ScanTool from '../components/ScanTool'
import { ModelAutoComplete } from '../components/ModelAutoComplete';
import Section from '../components/Section';
import {AssetTableRow} from '../components/ContentAssetsList';
import { useModelOptions } from '../customHooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backendApiContext } from '../context';
import { Delete } from '@mui/icons-material';

const ScanView = () => {

  // Hooks
  const backend = useContext(backendApiContext);
  const assetOptions = useModelOptions('asset');
  
  // State
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [shipment, setShipment] = useState({
    current: null,
    errors: [],
    label: "Shipment"
  });

  // Queries
  const selectedShipment = useQuery({
    queryKey: selectedShipmentId != null ? ['shipment', selectedShipmentId] : null,
    enabled: selectedShipmentId != null
  })

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
      setShipment(prev => {
        return ({...prev, current: null})
      });
      selectedShipment.remove();
    })
  }, []) // Setup cleanup function

  useEffect(() => {

    if (selectedShipment.data != undefined){

      setShipment(prev => {
        let newState = {...prev};
        newState.current = {...selectedShipment.data};

        // Add selection state
        newState.current.assets = newState.current.assets.map(asset => {
          let assetData = {...asset};
          assetData._meta = { ...assetData._meta, selected:false };
          return assetData;
        })

        return newState;
      })

    }

  }, [selectedShipment.data]) // Parse selectedShipment query to shipment state.

  useEffect(() => {
    if(selectShipmentInputId != null){
      refetchState();
    }
  }, [selectedShipmentId]) // Refetch Query

  // Callback Functions
  const refetchState = () => {
    selectedShipment.refetch();
  }

  const updateShipment = (e, value) => {
    console.log(e, value);
    if (value == null){
      setSelectedShipmentId(null);
      return;
    }
    setSelectedShipmentId(value.id);
  }

  const onRowSelect = selectedAsset => {
    setShipment( prev => {
      let newState={...prev};
      newState.current.assets = newState.current.assets.map(asset => {
        if(asset == selectedAsset){
          let assetData = {...selectedAsset};
          assetData._meta = { ...assetData._meta, selected:!assetData._meta.selected };
          return assetData;
        }
        return asset;
      })
      return newState;
    })
  }

  const getSelectedAssets = () => {
    return shipment.current?.assets
    .map( a => [a, ...a.assets]).flat()
    .filter( a => a._meta.selected )
  }

  const removeSelectedAssets = e => {
    const selectedAssets = getSelectedAssets();

    selectedAssets.forEach( asset => {
      updateAsset.mutate({...asset, location:shipment.current.origin, parent_object_id:null, parent_content_type:null})
    })

    refetchState();
  }

  // Formatted Data
  const selectShipmentInputId = 'scan-tool-shipment-select';
  const shipmentIsSelected = shipment.current != null;
  const canRemoveAssetsFromObj = backend.auth.user ? backend.auth.user.checkPermission(`change_asset`) : false;
  const hasAssetSelections = shipment.current ? shipment.current.assets
  .map( a => [a, ...a.assets]).flat()
  .map( a => a._meta.selected )
  .includes(true)
  : false;

  // Render
  return (
    <Box padding={1}>

      <Box padding={1} margin={1}>
        <Box>
          <Typography variant="h5">1. Select a shipment</Typography>
        </Box>
        <Paper sx={{padding:2, marginY:1}}>
          <Box display="flex" justifyContent="center" margin={1}>
            <ModelAutoComplete 
              field={shipment}
              dataModel='shipment'
              inputId={selectShipmentInputId}
              onChange={updateShipment}
              inputProps={{sx:{minWidth:"250px"}}}
            />
          </Box>
        </Paper>
      </Box>

      {shipmentIsSelected && 
      <Box padding={1} margin={1}>
        <Box>
          <Typography variant="h5">2. Scan</Typography>
        </Box>
        <ScanTool shipment={shipment.current} onSuccessfulScan={refetchState}/>
      </Box>
      }

      {(shipmentIsSelected && shipment.current.assets.length > 0) &&
      <Box padding={1} margin={1}>
        <Box>
          <Typography variant="h5">3. Review</Typography>
        </Box>
        <Box>
          <Section
            title={`Assets (${shipment.current.assets.length})`}
            defaultExpanded={true}
            actions={[
              hasAssetSelections && canRemoveAssetsFromObj ? <Button startIcon={<Delete/>} variant="outlined" onClick={removeSelectedAssets}>Remove selected</Button> : null,
            ]}
          >
            <Box display="flex" flexDirection="column" alignItems="stretch" gap={1}>
              {shipment.current.assets.map( asset => {
                return <AssetTableRow asset={asset} selectRow={onRowSelect}/>;
              })}
            </Box>
          </Section>
        </Box>
      </Box>
      }

    </Box>
  )
}

export default ScanView