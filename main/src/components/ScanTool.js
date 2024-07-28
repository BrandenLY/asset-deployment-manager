import { Button, Box, Paper, Typography, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { ModelAutoComplete } from "./ModelAutoComplete";
import { useModelOptions } from "../customHooks";
import { getCookie } from "../context";
import { useMutation } from "@tanstack/react-query";

const ShipmentSelector = props => {

    const {onSelect, variant} = props;
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [shipmentFieldErrors, setShipmentFieldErrors] = useState([]);


    const updateSelectedShipment = (_, shipment) => {
        setShipmentFieldErrors([]);
        setSelectedShipment(shipment);
    }

    const confirmSelection = () => {

        if (selectedShipment == null){
            setShipmentFieldErrors(prev => [...prev, 'You must select a shipment.']);
            return; // Do not proceed if the selection is blank.
        }

        // Update parent component with newly selected shipment.
        onSelect(selectedShipment.id)
    }

    // Formatted Data
    let paperStyles = {
        display: "flex",
        padding:1,
        marginY: 1,
    };
    switch(variant){
        case 'block':
            paperStyles = {
                ...paperStyles,
                minHeight:"30vh",
                flexDirection: "column",
                gap: 1.5,
                alignItems: "stretch",
                justifyContent: "center"
            }
        case 'in-line':
            paperStyles = {
                ...paperStyles,
                gap: 1,
                alignItems:"center",
                justifyContent: "flex-end"
            }
    }
    const boxStyles = {textAlign:"center", flexGrow:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%"};

    return <Paper id="ScanTool" sx={paperStyles}>
        <Box sx={boxStyles}>
            <Typography variant="h5" sx={{marginX:1}}>Select a shipment</Typography>
            <Typography variant="subtitle2" sx={{marginX:1}}>to begin scanning</Typography>
        </Box>
        <Box sx={{...boxStyles, height:"min-content", flexGrow:0, flexShrink:1}}>
            <ModelAutoComplete
                    field = {{current:selectedShipment, errors:shipmentFieldErrors, help_text:" "}}
                    dataModel = 'shipment'
                    disabled={false}
                    inputId={`select-shipment-to-scan`}
                    onChange={updateSelectedShipment}
                    inputProps={{
                        sx:{width:"30%", maxWidth:"345px", minWidth:"230px", flexShrink:0, flexGrow:1}
                    }}
            />
        </Box>
        <Box sx={boxStyles}>
            <Button onClick={confirmSelection}>
                Select
            </Button>
        </Box>

    </Paper>
}

const ScanTool = (props) => {
  
  // Props Destructuring
  const { shipmentId, variant = "block" } = props;
  
  // State Hooks
  const [ scanDestinationId, setScanDestinationId ] = useState(null); // Individual 'shipment' or 'asset' ID
  const [ destinationContentType, setDestinationContentType ] = useState('shipment'); // Either 'shipment' or 'asset'
  const [ assetCode, setAssetCode ] = useState("");
  const assetCodeInput = useRef(null);

  // Mutations
  const assetScans = useMutation({
    mutationFn: async (data) => {
        
        // Scanning logic is handled primarily by the backend, we will just pass back the shipment id and asset code.
        const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/scan/`);
        const requestHeaders = new Headers();
        requestHeaders.set('Content-Type', 'application/json');
        requestHeaders.set('X-CSRFToken', getCookie('csrftoken'));
    
        return fetch( updateUrl, {method:"DELETE", headers:requestHeaders} )
    },
  })
  
  // Setup event handlers
  useEffect(() => {

    // Trigger: Submitting via 'Enter' keypress
    if (assetCodeInput.current != null){
        assetCodeInput.current.addEventListener("keydown", e => { if(e.key == 'Enter'){submitAssetCode(e)} });
    }
    
    // Cleanup event handlers
    return(() => {
        if (assetCodeInput.current != null){
            assetCodeInput.current.removeEventListener("keydown", e => { if(e.key == 'Enter'){submitAssetCode(e)} });
        }
    })

  },[assetCodeInput.current])

  // Update component state when props are updated
  useEffect(() => {
    setScanDestinationId(shipmentId);
  }, [shipmentId])

  // Re-focus the input field when state changes
  useEffect(() => {
    if (assetCodeInput.current != null){
        assetCodeInput.current.focus()
    }
  })

  // Call Back Functions
  const updateDestinationId = ID => {
    setScanDestinationId(ID);
  }

  const updateAssetCode = e => {
    setAssetCode(e.target.value);
  }

  const submitAssetCode = e => {

    // Do scan logic
    if(e.type == "keydown"){
        console.log(e.target.value);
    }
    
    if(e.type == "click"){
        console.log(assetCode);
    }

    // Clear State
    setAssetCode("");
    e.preventDefault();
  }

  // Formatted Data
  let paperStyles = {
    marginY:1,
    padding:1,
    gap:1,
    display:'flex',
    minHeight: '30vh',
  }
  if(variant == 'block'){
    paperStyles['flexDirection'] = "column";
  }
  if(variant == 'in-line'){
    paperStyles["alignItems"] = "center";
  }
  const boxStyles = {textAlign:"center", flexGrow:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%"};
  
  // Requires Shipment Selection
  if(scanDestinationId == null){
    return(<ShipmentSelector onSelect={updateDestinationId} variant={variant}/>)
  }
  
  // Render primary form
  return(
    <Paper sx={paperStyles}>
        <Box sx={boxStyles}>
            <Typography variant="h5" sx={{marginX:1}}>Scan an asset tag</Typography>
            <Typography variant="subtitle2" sx={{marginX:1}}>or, enter an asset code</Typography>
        </Box>
        <Box sx={boxStyles}>
            <TextField value={assetCode} onChange={updateAssetCode} label="Asset Code" inputProps={{ref:assetCodeInput}} autoFocus/>
        </Box>
        <Box sx={boxStyles}>
            <Button onClick={submitAssetCode}>
                Submit
            </Button>
            <Typography variant="caption">Currently scanning into {destinationContentType == "asset" ? "container" : "shipment"} #{scanDestinationId}</Typography>
        </Box>
    </Paper>
  )
};

export default ScanTool;
