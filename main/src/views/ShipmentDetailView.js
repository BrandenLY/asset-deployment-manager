import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import { ShipmentDetailPanel } from "../components/ShipmentDetailPanel";
import { useModelOptions, useRichQuery } from "../customHooks";
import ScanTool from "../components/ScanTool";
import ProgressStatusAction from "../components/ProgressStatusAction";
import AssetGrid from "../components/AssetGrid";
import SortingGrid from "../components/SortingGrid";
import Section from "../components/Section";
import { Close, Delete } from "@mui/icons-material";

const ShipmentDetailView = props =>{

    const { addNotif, removeNotif } = props;

    const locationParams = useParams();
    const modelOptions = useModelOptions('shipment');
    const [displayScanTool, setDisplayScanTool] = useState(false);
    const theme = useTheme();

    const state = useRichQuery({
        modelOptions,
        id: locationParams.id
    });

    const refetchState = _ => {
        state.initialQuery.refetch()
    }

    // CALLBACK FUNCTIONS
    const toggleScanTool = e => {
        setDisplayScanTool(prev => {
            return(!prev);
        });
    }

    return (
        <Box className="ShipmentDetailView">
            <ShipmentDetailPanel
                shipmentId={locationParams.id}
                addNotif={props.addNotif}
                shipment={state.value}
            />
            <Box className="ShipmentDetailContent">
                <Box padding={1}>
                    <Typography variant="h3">{state.value?.label}</Typography>
                    <Box sx={{display: "flex", justifyContent: "flex-end", gap:1}}>
                        <ProgressStatusAction model="shipment" object={state.value} actions={{}}/>
                        <Button color="error" startIcon={<Delete/>}>Delete</Button>
                    </Box>
                </Box>

                <Section
                    title={`Assets (${state.value?.asset_counts.total_assets})`}
                    actions={[
                        <Button startIcon={displayScanTool ? <Close/> : undefined } color={displayScanTool ? 'error' : 'primary'} onClick={toggleScanTool}>Scan</Button>
                    ]}
                    defaultExpanded={true}
                >
                    {state.value &&
                        <ScanTool visible={displayScanTool} variant="in-line" elevation={4} shipment={state.value} onSuccessfulScan={refetchState}/>
                    }

                    {state.value &&
                        <AssetGrid fromQuery={state.initialQuery} assets={state.value.assets} addNotif={addNotif}/>
                    }

                </Section>

                <Section
                    title={`History`}
                >
                    <SortingGrid></SortingGrid>
                </Section>

            </Box>
        </Box>
    );
};

export default ShipmentDetailView;