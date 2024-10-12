import { Box, Button, Dialog, FormControl, IconButton, InputLabel, OutlinedInput, Paper, TextField, Typography, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useRef, useState } from "react";
import { backendApiContext, getCookie, notificationContext } from "../context";
import { ModelAutoComplete } from "./ModelAutoComplete";
import ScanLog from "./ScanLog";
import { CameraAlt } from "@mui/icons-material";
import {Html5Qrcode, Html5QrcodeScanner} from "html5-qrcode";
import CustomDialog from "./CustomDialog";

// Primary Component
const ScanTool = props => {
  
    // Props Destructuring
    const { 
        shipment, // You should pass the object you want to scan into if it is known.
        elevation = 1,
        visible = true,
        variant = "block",
        onSuccessfulScan = () => {}
    } = props;
    
    // Hooks
    const theme = useTheme();
    const inputElement = useRef(null);

    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const notifications = useContext(notificationContext);

    // State
    const [ destination, setDestination ] = useState(shipment); // Individual 'shipment' or 'asset' Id
    const [ destinationContentType, setDestinationContentType ] = useState("shipment"); // Either 'shipment' or 'asset'
    
    const [ inputData, setInputData ] = useState(""); // The code to be entered
    const [ scanLog, setScanLog ] = useState({}); // Log of Scans Sent to Backend
    const [ displayScanUi, setDisplayScanUi ] = useState(false); // Whether or not to show the scan dialog.

    // Mutations
    const scanAssetMutation = useMutation({
        mutationFn: async (vars) => {
            
            console.log('mutate', vars)

            const { method , payload } = vars;

            // Scanning logic is handled primarily by the backend, we will just pass back the shipment id and asset code.
            const scanUrl = new URL(`${backend.api.baseUrl}/scan/`);
            const requestHeaders = backend.api.getRequestHeaders();

            return await fetch( scanUrl, {
                method:method,
                headers:requestHeaders,
                body:JSON.stringify(payload)
            })
        },
        onMutate: vars => {
            setScanLog(prev=>{
                let data = {...prev};
                data[vars] = null;
                return data;
            })
        },
        onSettled: async (data, error, vars, context) => {

            if(error){
                notifications.add({message: new String(error), severity: "error"})
            }
            
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
                    setDestination(_data);
                    setDestinationContentType('asset');
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
    },[scanLog]) // Provide cleanup function

    useEffect(() => {
        if (inputElement.current != null){
            inputElement.current.scrollIntoView({behavior: 'smooth', block: 'center'});
            inputElement.current.focus();
        }
    }, [inputElement.current]) // Focus input on render

    // Callback Functions
    const updateInputValue = e => {
        console.log('set input data')
        setInputData(e.target.value);
    }
    const submitAssetCode = e => {

        console.log('submit asset code')
        // Ignore blank values
        if (inputData == "" && e.target.value == ""){
            return false;
        }

        // Do scan logic
        if(e.type == "keydown"){

            const payload =  {
                destination_content_type: destinationContentType,
                destination_object_id: destination.id,
                asset_code: e.target.value,
                shipment: shipment?.id,
            }

            scanAssetMutation.mutate({ method: "POST", payload })
        }
        
        if(e.type == "click"){

            const payload =  {
                destination_content_type: destinationContentType,
                destination_object_id: destination.id,
                asset_code: inputData,
                shipment: shipment?.id,
            }

            scanAssetMutation.mutate({ method: "POST", payload })
        }
        
        // Clear State
        setInputData("");
        e.preventDefault();
    }

    const openScanDialog = e => {
        console.log('open dialog')
        setDisplayScanUi(true);
    }
    const closeScanDialog = e => {
        console.log('close dialog')
        setDisplayScanUi(false);
    }

    const handleQrScannerFeedback = data => {

        if(data.result == "success" && scanAssetMutation.isIdle){

            console.log('make mutation from qr')
            
            const payload = {
                shipment : shipment.id,
                destination_content_type: destinationContentType,
                destination_object_id: destination.id,
                asset_code: data.decodedData
            }

            scanAssetMutation.mutate({method:"POST", payload});

            setDisplayScanUi(false);
        }

    }

    // Formatted Data
    const destinationName = destination?.label;
    const destinationAssetCounts = destination?.assets.length;
    const inlineHelperText = `Currently scanning into ${destinationContentType} ${destinationName}`
    const styles = getScanToolStyles(variant);
    const scanUiDialogId = "scan-tool-camera-dialog";

    // Render primary form
    return(
        <Paper sx={styles.paperStyles} elevation={elevation}>
            <Box sx={{...styles.boxStyles, gap:0, flexDirection:'column', minWidth: variant=="in-line" ? "200px" : "unset"}}>
                <Typography variant="body1" sx={{marginX:1, textAlign: variant == 'block' ? 'center' : 'left'}}>Scan an asset tag</Typography>
                <Typography variant="body2" sx={{marginX:1}}>or, enter an asset code</Typography>
            </Box>

            <Box sx={styles.boxStyles} width="calc(100% - 44px)">
                <Box display="flex" alignItems="center" justifyContent="center" rowGap={1} flexWrap="wrap" flexGrow={1} position="relative" width="min-content">
                    <IconButton color="primary" onClick={openScanDialog}>
                        <CameraAlt/>
                    </IconButton>
                    <TextField 
                        label="Asset code"
                        inputRef={inputElement}
                        variant="outlined"
                        value={inputData}
                        onChange={updateInputValue}
                        helperText={variant == "inline" ? inlineHelperText : ""}
                        sx={{minWidth: "200px"}}
                    />
                    <Button variant="outlined" onClick={submitAssetCode} sx={{marginLeft:1}}>
                        Submit
                    </Button>
                </Box>
            </Box>
            
            { variant == "block" &&
                <React.Fragment>
                    
                    <Box sx={styles.boxStyles}>
                        <Typography variant="subtitle1">Currently scanning into<br/>
                            <Typography variant="code">{destinationName}</Typography>
                        </Typography>
                    </Box>
                    
                    { destinationAssetCounts &&
                        <Box sx={styles.boxStyles}>
                            <Typography variant="subtitle2">{destinationAssetCounts} Assets</Typography>
                        </Box>
                    }


                </React.Fragment>
            }

            <Box sx={styles.boxStyles}>
                <ScanLog data={ScanLog} />
            </Box>

            <CustomDialog
                open={displayScanUi}
                fullWidth={false}
                title="Scan an asset tag"
                onClose={closeScanDialog}
                paperStyles={{maxWidth: "fit-content !important"}}
            >
                <Box display="flex" id={scanUiDialogId} marginX="auto" width="200px" height="200px" border={`6px solid rgba(0,0,0,0.25)`} overflow="clip">
                    <QrScanner parentId={scanUiDialogId} onSettled={handleQrScannerFeedback}/>
                </Box>
            </CustomDialog>

        </Paper>
    )
  
};

const QrScanner = props => {
    
    // Props destructuring
    const { parentId, onSettled=() => {}} = props;

    const QrReader = useRef(null);

    useEffect(() => {

        // Instantiate QR Reader
        QrReader.current = new Html5Qrcode(parentId, false);
        const QrConfig = { 
            fps: 10, 
            qrbox: {width: 200, height:200}, 
            aspectRatio:1 
        };

        // Start QR Reader
        QrReader.current.start(
            {facingMode: "environment"},
            QrConfig,
            completeSuccess,
            completeFailure
        )
        .catch( error => {
            onSettled({result: "error", error})
        })

        // Cleanup
        return(() => {
            if(QrReader.current.getState() == 2){
                QrReader.current.stop()
            }
        })

    },[])

    const completeSuccess = (decodedData, decodedResult) => {
        onSettled({result: "success", decodedData, decodedResult})
        QrReader.current.stop();
    }

    const completeFailure = error => {
        onSettled({result: "error", error})
    }

    return(<React.Fragment />)
}

const getScanToolStyles = variant => {

    const isInline = variant == "in-line";

    let paperStyles = {
        display:"flex",
        marginY:1,
        padding:1,
        gap:1,
        flexGrow: 1,
        flexDirection: isInline ? "unset" : "column",
        minHeight: isInline ? "unset" : "30vh",
        alignItems: isInline ? "center" : "unset",
        justifyContent: isInline ? "space-between" : "unset",
        maxHeight: isInline ? "min-content" : "unset",

        
    }

    let boxStyles = {
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        rowGap: 1,
        columnGap: 1,
        flexDirecction: isInline ? "unset" : "column",
        flexGrow: isInline ? "unset" : 1,
        alignItems: isInline ? "unset" : "center",
        textAlign: isInline ? "unset" : "center",
        width: isInline ? "unset" : "100%"
    };

    return({paperStyles,boxStyles});

}

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

export default ScanTool;
