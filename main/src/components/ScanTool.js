import { CameraAlt } from "@mui/icons-material";
import { Box, Button, IconButton, Paper, TextField, Typography, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Html5Qrcode} from "html5-qrcode";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { backendApiContext, notificationContext } from "../context";
import CustomDialog from "./CustomDialog";
import { ModelAutoComplete } from "./ModelAutoComplete";
import ScanLog from "./ScanLog";

// Primary Component
const ScanTool = props => {
    
    console.assert(props.shipment != undefined, "Scan tool expected to receive shipment prop but instead received undefined.")

    // Props Destructuring
    const { 
        shipment, // You should pass the object you want to scan into if it is known.
        elevation = 1,
        visible = true,
        variant = "block",
        onSuccessfulScan = () => {}
    } = props;
    
    // Hooks
    const inputElement = useRef(null);

    const theme = useTheme();
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
            
            const submittedAssetCode = vars.payload.asset_code;

            setScanLog( prev => {
                let data = {...prev};
                data[submittedAssetCode] = null;
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
                const submittedAssetCode = vars.payload.asset_code;
                const _data = await data.json();

                // Update State
                setScanLog(prev => {
                    let data = {...prev}
                    data[submittedAssetCode] = {data:_data, error};
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
                const submittedAssetCode = vars.payload.asset_code;
                const _data = await data.json();
                setScanLog(prev => {
                    let data = {...prev}
                    data[submittedAssetCode] = {data:null, error:_data['detail']};
                    return data;
                })
            }

        }
    })

    // Effects
    useEffect(() => {
        return(() => {
            setDestination(undefined);
            setDestinationContentType('shipment');
            setInputData("");
            setScanLog({});
            setDisplayScanUi(false);
        })
    }, [])

    useEffect(() => {
        if (destinationContentType == shipment && destination.id == shipment.id){

            setDestination(shipment)
            setDestinationContentType('shipment')
        
        }
    }, [shipment]) // reset destination state when shipment changes

    useEffect(() => {
        return () => {
            if (scanLog.length > 0){
                queryClient.invalidateQueries({queryKey:['shipment']})
            }
        }
    },[scanLog]) // Provide cleanup function

    useEffect(() => {
        if(inputElement.current){
            inputElement.current.focus();
        }
    })

    // Callback Functions
    const updateInputValue = e => {
        setInputData(e.target.value);
    }

    const submitAssetCode = useCallback(e => {

        // Ignore blank values
        if (inputData == "" && e.target.value == ""){
            return;
        }

        // Do scan logic
        if(e.type == "keydown" && e.key == "Enter"){

            const payload = {
                destination_content_type: destinationContentType,
                destination_object_id: destination.id,
                asset_code: e.target.value,
                shipment: shipment.id,
            }

            scanAssetMutation.mutate({ method: "POST", payload });
            setInputData("");
            e.preventDefault()
        }
        
        if(e.type == "click"){

            const payload = {
                destination_content_type: destinationContentType,
                destination_object_id: destination.id,
                asset_code: inputData,
                shipment: shipment.id,
            }

            scanAssetMutation.mutate({ method: "POST", payload })
            setInputData("");
            e.preventDefault()
        }

    }, [inputData, destination.id, destinationContentType, shipment.id])

    const openScanDialog = e => {
        setDisplayScanUi(true);
    }
    const closeScanDialog = e => {
        setDisplayScanUi(false);
    }

    const handleQrScannerFeedback = data => {

        if(data.result == "success" && scanAssetMutation.isIdle){

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
    const destinationContentTypeDisplay = destinationContentType == 'asset' ? 'container' : destinationContentType;
    const inlineHelperText = `Currently scanning into ${destinationContentType} ${destinationName}`
    const styles = getScanToolStyles(variant);
    const scanUiDialogId = "scan-tool-camera-dialog";

    // Render primary form
    return(
        <Paper sx={{...styles.paperStyles, display: visible ?  "flex" : "none"}} elevation={elevation}>
            <Box sx={{...styles.boxStyles, gap:0, flexDirection:'column', minWidth: variant=="in-line" ? "200px" : "unset"}}>
                <Typography variant="body1" sx={{marginX:1, textAlign: variant == 'block' ? 'center' : 'left'}}>Scan an asset tag</Typography>
                <Typography variant="body2" sx={{marginX:1}}>or, enter an asset code</Typography>
            </Box>

            <Box sx={styles.boxStyles} width="calc(100% - 44px)">
                <Box display="flex" alignItems="center" justifyContent="center" rowGap={1} flexWrap={"wrap"} flexGrow={1} position="relative">
                    <Box display="flex" gap={1}>
                        <IconButton onClick={openScanDialog} sx={{alignSelf: "center"}}>
                            <CameraAlt/>
                        </IconButton>
                        <TextField 
                            label="Asset code"
                            inputRef={inputElement}
                            variant="outlined"
                            value={inputData}
                            onChange={updateInputValue}
                            onKeyDown={submitAssetCode}
                            helperText={variant == "in-line" ? inlineHelperText : ""}
                            sx={{minWidth: "200px"}}
                        />
                    </Box>
                    <Button variant="outlined" onClick={submitAssetCode} sx={{marginLeft:1}}>
                        Submit
                    </Button>
                </Box>
            </Box>
            
            { variant == "block" &&
                <React.Fragment>
                    
                    <Box sx={styles.boxStyles}>
                        <Typography variant="subtitle1">Currently scanning into {destinationContentTypeDisplay}<br/>
                            <Typography variant="code">{destinationName}</Typography>
                        </Typography>
                    </Box>
                    
                    { destinationAssetCounts > 0 &&
                        <Box sx={styles.boxStyles}>
                            <Typography variant="subtitle2">{destinationAssetCounts} Assets</Typography>
                        </Box>
                    }

                    <Box sx={styles.boxStyles}>
                        <ScanLog data={scanLog}/>
                    </Box>

                </React.Fragment>
            }

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

export default ScanTool;
