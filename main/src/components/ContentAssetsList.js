import { Archive, Close, Delete, DocumentScanner, ExpandLess, ExpandMore, SubdirectoryArrowRight } from '@mui/icons-material';
import { Badge, Box, Button, Checkbox, IconButton, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useContext, useEffect, useState } from 'react';
import { backendApiContext, getCookie } from '../context';
import { useModelOptions } from '../customHooks';
import AssetIcon from './AssetIcon';
import ScanTool from './ScanTool';
import Section from './Section';

const ASSETMODELNAME = 'asset';

const AssetSectionTitle = props => {

    const {asset} = props;

    const theme = useTheme();
    const assetOptions = useModelOptions(ASSETMODELNAME);

    const model = useQuery({
        queryKey: ['model', asset.model]
    })
    const modelIcon = useQuery({
        queryKey: ['asseticon', model.data.icon.id],
        enabled: model.isSuccess
    })

    const modelIconName = modelIcon.isSuccess ? modelIcon.data.source_name : "DevicesOther";
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
                        borderRadius: theme.spacing(0.25),
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
                    width="100%"
                >
                    <IconButton onClick={toggleExpanded}>
                        { expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Box
                        display="flex"
                        flexBasis="300px"
                        flexShrink={1}
                        flexGrow={1}
                        alignItems="center"
                        gap={theme.spacing(1)}
                        padding={theme.spacing(1)}
                        paddingLeft={theme.spacing(3)}
                        borderRadius={theme.shape.borderRadius}
                        backgroundColor={theme.palette.divider}
                        border={`3px solid ${theme.palette.divider}`}
                        sx={{[theme.breakpoints.down('md')]:{
                            paddingLeft: "unset",
                        }}}
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
                        sx={{
                            [theme.breakpoints.down('md')]:{
                                paddingLeft: theme.spacing(2),
                            }
                        }}
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
                                        sx={{
                                            [theme.breakpoints.down('md')]:{
                                                paddingLeft: "unset",
                                            }
                                        }}
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
                    <IconButton disabled={true}>
                        <ExpandMore />
                    </IconButton>
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
                        <Checkbox checked={asset._meta.selected} onChange={() => {onCheckboxToggle(asset)}}/>
                        <AssetSectionTitle asset={asset}/>
                    </Box>
                </Box>
            </Paper>
        )
    }
}

const ContentAssetsList = props => {

    // Props
    const {
        obj,
        objContentType,
    } = props;

    // Hooks
    const theme = useTheme();
    const queryClient = useQueryClient();
    const backend = useContext(backendApiContext);
    const assetOptions = useModelOptions(ASSETMODELNAME);
    const viewingFromMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [objData, setObjData] = useState(false);
    const [displayScanTool, setDisplayScanTool] = useState(false);

    // Queries
    const contentTypes = useQuery({
        queryKey: ['contenttype'],
    })

    const objQuery = useQuery({
        queryKey: [objContentType, obj.id],
        enabled: obj.id != undefined,
        initialData: obj
    })

    // Mutations
    const updateAsset = useMutation({
        mutationFn: (data, method="PUT") => {

            const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/asset/${data.id}/`);
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
    useEffect(() => {

        if (!contentTypes.isSuccess){
            return;
        }
        
        if (!objQuery.isSuccess){
            return;
        }
            
        let temporaryState = {...objQuery.data}

        // Data manipulation
        temporaryState['assets'] = temporaryState['assets'].map( asset => parseAssetData(asset) );

        // Update state
        setObjData(temporaryState);



    }, [objQuery.data, contentTypes.isSuccess, objQuery.isSuccess])

    // Callback Functions
    const refetchState = () => {
        queryClient.invalidateQueries({queryKey : [objContentType, obj.id]})
    }

    const parseAssetData = data => {
        let tmpData = {...data,_meta:{selected:false}}
        tmpData['assets'] = tmpData['assets'].map( a => ({...a,_meta:{selected:false}}))
        return(tmpData)
    }

    const getSelectedAssets = () => {
        return objData.assets
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

        refetchState();
    }

    const removeSelectedAssets = e => {
        const selectedAssets = getSelectedAssets();

        selectedAssets.forEach( asset => {
            if (objContentType == "shipment"){
                updateAsset.mutate({...asset, location:obj.origin.id, parent_object_id:null, parent_content_type:null})
            }
            else{
                updateAsset.mutate({...asset, location:obj.location, parent_object_id:null, parent_content_type:null})
            }
        })

        refetchState();
    }

    const toggleScanTool = e => {
        setDisplayScanTool(prev => !prev)
    }
    
    const selectAsset = asset => {

        setObjData(prev => {

            let temporaryState = {...prev}
            let temporaryAssets = [...temporaryState['assets']]
            const assetParentContentType = contentTypes.data.results.find(ct => ct.id == asset.parent_content_type);

            if (assetParentContentType.model == ASSETMODELNAME){
                const parentIndex = temporaryAssets.findIndex( a => a.id == asset.parent_object_id )
                const childIndex = temporaryAssets[parentIndex]['assets'].findIndex( a => a.id == asset.id)

                temporaryAssets[parentIndex]['assets'][childIndex] = {
                    ...temporaryAssets[parentIndex]['assets'][childIndex],
                    _meta: {
                        ...temporaryAssets[parentIndex]['assets'][childIndex]['_meta'],
                        selected: !asset._meta.selected
                    }
                }
            }

            else{
                const assetIndex = temporaryAssets.findIndex( a => a.id == asset.id );
            
                temporaryAssets[assetIndex] = {
                    ...temporaryAssets[assetIndex], 
                    _meta:{
                        ...temporaryAssets[assetIndex]['_meta'],
                        selected: !asset._meta.selected
                    }
                }
            }

            temporaryState['assets'] = temporaryAssets;

            return(temporaryState)
        })
    }

    // Formatted data
    let canReceiveAssetsFromObj = backend.auth.user ? backend.auth.user.checkPermission(`receive`) : false;
    let canRemoveAssetsFromObj = backend.auth.user ? backend.auth.user.checkPermission(`change_asset`) : false;
    let canMoveAssetsViaScan = backend.auth.user ? backend.auth.user.checkPermission(`scan_to_parent`) : false;

    if (objContentType == 'shipment'){
        //If the shipment is 'Delivered' or 'Cancelled', allow receiving assets from it.
        canReceiveAssetsFromObj = obj.status >= 3;
        //If the shipment is 'scheduled' then allow removing assets.
        canRemoveAssetsFromObj = obj.status == 0;
    }

    const hasAssetSelections = objData ? objData.assets
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
                canMoveAssetsViaScan ? <Button startIcon={displayScanTool ? <Close/> : <DocumentScanner sx={{transform:"rotate(90deg)"}}/> } variant="outlined" color={displayScanTool ? 'error' : 'primary'} onClick={toggleScanTool}>Scan</Button> : null,
            ]}

            defaultExpanded={true}
        >

            <ScanTool visible={displayScanTool} variant={viewingFromMobile ? "block" : "in-line"} elevation={3} shipment={obj} onSuccessfulScan={refetchState}/>
            <Box display="flex" flexDirection="column" alignItems="stretch" gap={theme.spacing(1)}>
                {objData.assets?.map( asset => {
                    return <AssetTableRow asset={asset} selectRow={selectAsset}/>;
                })}
            </Box>
        </Section>
    )
}

export default ContentAssetsList