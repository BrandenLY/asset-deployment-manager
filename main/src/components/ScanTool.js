import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { getCookie } from "../context";
import { ModelAutoComplete } from "./ModelAutoComplete";
import ScanLog from "./ScanLog";

// Primary Component
const ScanTool = (props) => {
  
    // Props Destructuring
    const { shipment:initialShipmentData, onSuccessfulScan = () => {}, variant = "block", elevation = 1, visible = true} = props;
    
    // Hooks
    const queryClient = useQueryClient();
    const assetCodeInput = useRef(null);

    // State
    const [ destinationId, setDestinationId ] = useState(initialShipmentData.id); // Individual 'shipment' or 'asset' Id
    const [ destinationContentType, setDestinationContentType ] = useState("shipment"); // Either 'shipment' or 'asset'
    const [ destinationName, setDestinationName ] = useState(""); // For display purposes only
    const [ assetCode, setAssetCode ] = useState(""); // The code to be entered
    const [ scanLog, setScanLog ] = useState({}); // Log of Scans Sent to Backend

    // Queries
    const {data: shipment} = useQuery({
        queryKey: ['shipment', initialShipmentData.id],
        initialData: initialShipmentData,
    })

    // Mutations
    const scanAssetMutation = useMutation({
        mutationFn: async (vars) => {
            
            // Scanning logic is handled primarily by the backend, we will just pass back the shipment id and asset code.
            const scanUrl = new URL(`${window.location.protocol}${window.location.host}/api/scan/`);
            const requestHeaders = new Headers();
            requestHeaders.set('Content-Type', 'application/json');
            requestHeaders.set('X-CSRFToken', getCookie('csrftoken'));
        
            // Format Payload
            const payload = {
                destination_content_type: destinationContentType,
                destination_object_id: destinationId,
                asset_code: vars,
                shipment: shipment.id,
            }

            return await fetch( scanUrl, {method:"POST", headers:requestHeaders, body:JSON.stringify(payload)})
        },
        onMutate: vars => {
            setScanLog(prev=>{
                let data = {...prev};
                data[vars] = null;
                return data;
            })
        },
        onSettled: async (data, error, vars, context) => {
            
            // Backend has returned a http 200 response status
            if (data.ok){

                // Parse data
                const _data = await data.json();

                // Update State
                setScanLog(prev => {
                    let data = {...prev}
                    data[vars] = {data:_data, error};
                    return data;
                })
                
                // Update Scan Destination
                if (_data.is_container){
                    setDestinationId(_data.id);
                    setDestinationContentType('asset');
                    setDestinationName(_data.label);
                }

                // Execute callback
                onSuccessfulScan();

            }
            // Backend has returned an error (400/500) response status.
            else{
                const _data = await data.json();
                setScanLog(prev => {
                    let data = {...prev}
                    data[vars] = {data:null, error:_data['detail']};
                    return data;
                })
            }

        }
    })

    // Effects
    useEffect(() => {
        return () => {
            if (scanLog.length > 0){
                queryClient.invalidateQueries({queryKey:['shipment']})
            }
        }
    },[]) // Provide cleanup function

    useEffect(() => {
        if (assetCodeInput.current != null){
            assetCodeInput.current.scrollIntoView({behavior: 'smooth', block: 'center'});
            assetCodeInput.current.focus();
        }
    }) // Focus input on page load

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

    },[assetCodeInput.current]) // Focus input after submitting asset code

    useEffect(() => {

        // Set Defaults
        setDestinationContentType("shipment");
        setDestinationId(shipment.id);

        // Clear State
        setScanLog({});

    }, [initialShipmentData.id]) // Reset component defaults

  // CALLBACKS
  const updateDestinationId = ID => {
    setDestinationId(ID);
  }
  const updateAssetCode = e => {
    setAssetCode(e.target.value);
  }
  const submitAssetCode = e => {

    // Ignore blank values
    if (assetCode == "" && e.target.value == ""){
        return false;
    }

    // Do scan logic
    if(e.type == "keydown"){
        scanAssetMutation.mutate(e.target.value, destinationId, destinationContentType)
    }
    
    if(e.type == "click"){
        scanAssetMutation.mutate(assetCode)
    }
    
    // Clear State
    setAssetCode("");
    e.preventDefault();
  }

  // FORMATTED DATA
  let paperStyles = {
    marginY:1,
    padding:1,
    gap:1,
    display: visible ? 'flex' : 'none',
    flexGrow: 1,
  }
  let boxStyles = {
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  };
  switch(variant){
    case 'block':
        // Update paper styles
        paperStyles['flexDirection'] = "column";
        paperStyles['minHeight'] = '30vh';

        // Update box/segment styles
        boxStyles['flexDirection'] = 'column'
        boxStyles['flexGrow'] = 1
        boxStyles['alignItems'] = 'center'
        boxStyles['textAlign'] = 'center'
        boxStyles['width'] = '100%'
        boxStyles['rowGap'] = 1;
    case 'in-line':
        // Update paper styles1
        paperStyles["alignItems"] = "center";
        paperStyles["justifyContent"] = "space-between";
        paperStyles['maxHeight'] = 'min-content';
        paperStyles['marginY'] = 1;

        // Update box/segment styles
        boxStyles['columnGap'] = 1;
  };

  // Render
  if(destinationId == null){
    // Render shipment selection input
    return(<ShipmentSelector onSelect={updateDestinationId} variant={variant}/>)
  }
  else{
    // Render primary form
    return(
        <Paper sx={paperStyles} elevation={elevation}>
            <Box sx={{...boxStyles, flexDirection:'column', minWidth: variant=="in-line" ? "200px" : "unset"}}>
                <Typography variant="body1" sx={{marginX:1, textAlign: variant == 'block' ? 'center' : 'left'}}>Scan an asset tag</Typography>
                <Typography variant="body2" sx={{marginX:1}}>or, enter an asset code</Typography>
            </Box>

            { variant == 'block' ? 
            <ScanToolControls 
                boxStyles={boxStyles}
                assetCode={assetCode}
                inputOnChange={updateAssetCode}
                inputProps={{ref:assetCodeInput}}
                btnOnClick={submitAssetCode}
                scanLog={scanLog}
                scanLogRows={3}
            /> 
            : null }

            { variant == 'block' ? 
            <ScanToolDestinationDetails 
                {...{boxStyles, shipment, destinationContentType, destinationName, variant}}
            /> 
            : null }

            { variant == 'in-line' ? 
            <ScanToolControls 
                boxStyles={boxStyles}
                assetCode={assetCode}
                inputOnChange={updateAssetCode}
                inputProps={{ref:assetCodeInput}}
                helpText={destinationName ? `Currently scanning into ${destinationName}` : 'Currently scanning into shipment'}
                btnOnClick={submitAssetCode}
                scanLog={scanLog}
                scanLogRows={1}
            /> 
            : null }

        </Paper>
    )
  }
};

// Supplementary Components
const ShipmentSelector = props => {

    // Props Destructuring
    const {onSelect, variant} = props;

    // Hooks
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [shipmentFieldErrors, setShipmentFieldErrors] = useState([]);

    // Call Back Functions
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

const ScanToolControls = props => {
    const {boxStyles, assetCode, inputOnChange, inputProps, btnOnClick, scanLog, scanLogRows, helpText} = props;

    return (
        <Box sx={{...boxStyles}}>
            <TextField value={assetCode} onChange={inputOnChange} label="Asset Code" inputProps={inputProps} helperText={helpText} autoFocus/>
            <Button onClick={btnOnClick} sx={{alignSelf:"center", flexShrink:0}}>
                Submit
            </Button>
            <ScanLog data={scanLog} scanLogRows={scanLogRows}></ScanLog>
        </Box>
    )
}

const ScanToolDestinationDetails = props => {

    const {boxStyles, shipment, destinationContentType, destinationName, variant} = props;

    return (
        <Box sx={boxStyles}>
            {shipment.asset_counts.total_assets > 0 ? 
            <Typography variant="h4" sx={{marginY:3, fontWeight: "bold"}}>
                {shipment.asset_counts.total_assets}<br/>
                assets
            </Typography>
            : null}

            { variant == "block" && // Only display shipment full block scan tool variant
            <Typography variant="caption">
                Currently scanning into<br /> 
                <Typography component='code' variant='code'>{shipment.label}</Typography>
            </Typography>
            }

            {destinationContentType == 'asset' &&
            <Typography variant="caption" sx={{marginTop:1}}>
                Container<br />
                <Typography component='code' variant='code'>{destinationName}</Typography>
            </Typography>
            }

        </Box>
    );
}

export default ScanTool;
