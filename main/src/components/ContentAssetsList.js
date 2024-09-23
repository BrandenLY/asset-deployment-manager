import React, { useState } from 'react'
import Section from './Section';
import { Badge, Box, Button, Checkbox, IconButton, Paper, Typography, useTheme } from '@mui/material';
import { Archive, Close, Delete, DocumentScanner, ExpandLess, ExpandMore, SubdirectoryArrowRight } from '@mui/icons-material';
import ScanTool from './ScanTool';
import { useModelOptions } from '../customHooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AssetIcon from './AssetIcon';
import { getCookie } from '../context';

const AssetSectionTitle = props => {

    const {asset} = props;

    const theme = useTheme();
    const assetOptions = useModelOptions('asset');
    const model = useQuery({
        queryKey: ['model', asset.model]
    })

    const modelIconName = model.isSuccess ? model.data.icon.source_name : "DevicesOther"
    const conditionLabel = assetOptions.isSuccess ? assetOptions.data.model_fields.condition.choices
    .find( c => c.value == asset.condition ).display_name
    : "";
    const conditionBgColor = conditionLabel != "" ? theme.palette.conditions[conditionLabel.toLowerCase()].main : "gray";
    const conditionFgColor = conditionLabel != "" ? theme.palette.conditions[conditionLabel.toLowerCase()].contrastText : "black";
    
    return(
        <Box display="flex" alignItems="center" gap={theme.spacing(1)}>

            { asset.is_container ?
                <Badge color="secondary" badgeContent={asset.assets.length}>
                    <AssetIcon iconName={modelIconName}/>
                </Badge>
            :
                <AssetIcon iconName={modelIconName}/>
            }

            <Box marginLeft={theme.spacing(0.5)}>
                <Typography variant="body2" fontSize="1.15em">
                    {asset.label} 
                    <Typography component="span" sx={{
                        backgroundColor: conditionBgColor,
                        color: conditionFgColor,
                        borderRadius: theme.shape.borderRadius,
                        padding: theme.spacing(1),
                        paddingTop: 0,
                        paddingBottom: 0,
                        display: "inline",    
                        fontSize: "0.9em",
                        marginLeft: theme.spacing(0.5)
                    }}>{conditionLabel}</Typography>
                </Typography>
                <Typography variant="subtitle1" color={theme.palette.text.secondary} sx={{fontSize: "0.85em"}}>Note: {asset.note}</Typography>
            </Box>
        </Box>
    )
}

const AssetTableRow = props => {

    const {asset, defaultExpanded = false, paperProps, selectRow = () => console.error('AssetTableRow', 'You must provide an implementation for `selectRow`.')} = props;

    const [expanded, setExpanded] = useState(defaultExpanded);

    const theme = useTheme();

    const toggleExpanded = e => {
        setExpanded( prev => !prev )
    }

    const onCheckboxToggle = a =>{
        selectRow(a);
    }

    if(asset.is_container){
        return(
            <Paper elevation={2} {...paperProps}>
                <Box 
                    className="asset-table-row-title"
                    display="flex"
                    alignItems="center"
                    gap={theme.spacing(1)}
                    padding={theme.spacing(1)}
                >
                    <IconButton onClick={toggleExpanded}>
                        { expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={theme.spacing(1)}
                        padding={theme.spacing(1)}
                        paddingLeft={theme.spacing(3)}
                        borderRadius={theme.shape.borderRadius}
                        backgroundColor={theme.palette.divider}
                        border={`3px solid ${theme.palette.divider}`}
                        width="100%"
                    >
                        <Checkbox checked={asset._meta.selected} onChange={() => {onCheckboxToggle(asset)}}/>
                        <AssetSectionTitle asset={asset}/>
                    </Box>
                </Box>
    
                { expanded &&
                    <Box 
                        className="asset-table-row-body"
                        display="flex"
                        flexDirection="column"
                        alignItems="stretch"
                        gap={theme.spacing(1)}
                        padding={theme.spacing(1)}
                        paddingLeft={theme.spacing(8)}
                    >
                        { asset.assets.map( childAsset => {
                            return(
                                <Box display="flex" alignItems="center">
                                    <SubdirectoryArrowRight />
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={theme.spacing(1)}
                                        padding={theme.spacing(1)}
                                        paddingLeft={theme.spacing(3)}
                                        borderRadius={theme.shape.borderRadius}
                                        border={`3px solid ${theme.palette.divider}`}
                                        width="100%"
                                    >
                                        <Checkbox checked={childAsset._meta.selected} onChange={() => {onCheckboxToggle(childAsset)}}/>
                                        <AssetSectionTitle asset={childAsset}/>
                                    </Box>
                                </Box>
                            )
                        }) }
                    </Box>
                }
            </Paper>
        )
    }
    else{
        return(
            <Paper elevation={2} {...paperProps}>
                <Box 
                    className="asset-table-row-title"
                    display="flex"
                    alignItems="center"
                    gap={theme.spacing(1)}
                    padding={theme.spacing(1)}
                >
                    <IconButton onClick={toggleExpanded}>
                        { expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={theme.spacing(1)}
                        padding={theme.spacing(1)}
                        paddingLeft={theme.spacing(3)}
                        borderRadius={theme.shape.borderRadius}
                        backgroundColor={theme.palette.divider}
                        border={`3px solid ${theme.palette.divider}`}
                        width="100%"
                    >
                        <Checkbox checked={asset._meta.selected} onChange={() => {onCheckboxToggle(asset)}}/>
                        <AssetSectionTitle asset={asset}/>
                    </Box>
                </Box>
    
                { expanded &&
                    <Box 
                        className="asset-table-row-body"
                        display="flex"
                        flexDirection="column"
                        alignItems="stretch"
                        gap={theme.spacing(1)}
                        padding={theme.spacing(1)}
                        paddingLeft={theme.spacing(8)}
                    >
                        { asset.assets.map( childAsset => {
                            return(
                                <Box display="flex" alignItems="center">
                                    <SubdirectoryArrowRight />
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={theme.spacing(1)}
                                        padding={theme.spacing(1)}
                                        paddingLeft={theme.spacing(3)}
                                        borderRadius={theme.shape.borderRadius}
                                        border={`3px solid ${theme.palette.divider}`}
                                        width="100%"
                                    >
                                        <Checkbox checked={childAsset._meta.selected} onChange={() => {onCheckboxToggle(childAsset)}}/>
                                        <AssetSectionTitle asset={childAsset}/>
                                    </Box>
                                </Box>
                            )
                        }) }
                    </Box>
                }
            </Paper>
        )
    }
}

const ContentAssetsList = props => {

    // Props
    const {
        obj,
        objContentType,
        onSelect,
    
    } = props;

    // Hooks
    const [displayScanTool, setDisplayScanTool] = useState(false);
    const assetOptions = useModelOptions('asset');
    const theme = useTheme();
    const queryClient = useQueryClient();

    // Mutations
    const updateAsset = useMutation({
        mutationFn: (data) => {

            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/asset/${data.id}/`);

            const requestHeaders = new Headers();
            requestHeaders.set("Content-Type", "application/json");
            requestHeaders.set("X-CSRFToken", getCookie("csrftoken"));

            // Updates
            let payload = {};
            
            console.log('mutation data', data);

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

            console.log("payload", payload);

            return fetch(updateUrl, {
                method: "PUT",
                headers: requestHeaders,
                body: JSON.stringify(payload),
            });

        },
        onSettled: (data, error, variables, context) => {
            console.log(data, error, variables, context);

            if (error == null && data.ok){
                // Update state
            }
        }
    })

    // Callback Functions
    const refetchState = e => {
        queryClient.invalidateQueries({queryKey : [objContentType, obj.id]})
    }

    const getSelectedAssets = () => {
        return obj.assets
        .map( a => [a, ...a.assets]).flat()
        .filter( a => a._meta.selected )
    }

    const receiveSelectedAssets = e => {
        const selectedAssets = getSelectedAssets();

        selectedAssets.forEach(asset => {
            if (objContentType == "shipment"){
                updateAsset.mutate({...asset, location:obj.destination.id, parent_object_id:null, parent_content_type:null})
            }
            else{
                throw new Error("Cannot receive assets from another asset, must receive via a shipment");
            }
        })
    }

    const removeSelectedAssets = e => {
        const selectedAssets = getSelectedAssets();

        selectedAssets.forEach(asset => {
            if (objContentType == "shipment"){
                updateAsset.mutate({...asset, location:obj.origin.id, parent_object_id:null, parent_content_type:null})
            }
            else{
                updateAsset.mutate({...asset, location:obj.location, parent_object_id:null, parent_content_type:null})
            }
        })
    }

    const toggleScanTool = e => {
        setDisplayScanTool(prev => !prev)
    }
    
    // Formatted data
    let canReceiveAssetsFromObj = false;
    let canRemoveAssetsFromObj = false;
    
    if (objContentType == 'shipment'){
        //If the shipment is 'Delivered' or 'Cancelled', allow receiving assets from it.
        canReceiveAssetsFromObj = obj.status >= 3;
        //If the shipment is 'scheduled' then allow removing assets.
        canRemoveAssetsFromObj = obj.status == 0;
    }

    const hasAssetSelections = obj ? obj.assets
    .map( a => [a, ...a.assets]).flat()
    .map( a => a._meta.selected )
    .includes(true)
    : false;

    return (
        <Section
            title={`Assets (${obj.asset_counts?.total_assets})`}
            actions={[
                hasAssetSelections && canReceiveAssetsFromObj ? <Button startIcon={<Archive/>} variant="outlined" onClick={receiveSelectedAssets}>Receive selected</Button> : null,
                hasAssetSelections && canRemoveAssetsFromObj ? <Button startIcon={<Delete/>} variant="outlined" onClick={removeSelectedAssets}>Remove selected</Button> : null,
                <Button startIcon={displayScanTool ? <Close/> : <DocumentScanner sx={{transform:"rotate(90deg)"}}/> } variant={displayScanTool ? 'outlined' : 'text'} color={displayScanTool ? 'error' : 'primary'} onClick={toggleScanTool}>Scan</Button>,
            ]}
            defaultExpanded={true}
        >

            <ScanTool visible={displayScanTool} variant="in-line" elevation={3} shipment={obj} onSuccessfulScan={refetchState}/>
            <Box display="flex" flexDirection="column" alignItems="stretch" gap={theme.spacing(1)}>
                {obj.assets.map( asset => {
                    if(asset.is_container){
                        return <AssetTableRow asset={asset} selectRow={onSelect}/>
                    }
                    else{
                        return <></>
                    }
                })}
            </Box>
        </Section>
    )
}

export default ContentAssetsList