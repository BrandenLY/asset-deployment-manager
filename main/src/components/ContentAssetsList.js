import { Archive, Close, Delete, DocumentScanner, ExpandLess, ExpandMore, SubdirectoryArrowRight } from '@mui/icons-material';
import { Badge, Box, Button, Checkbox, IconButton, Paper, Table, TableBody, TableCell, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { backendApiContext, getCookie } from '../context';
import { useModelOptions, usePermissionCheck } from '../customHooks';
import AssetIcon from './AssetIcon';
import ScanTool from './ScanTool';
import Section from './Section';

const ASSETMODELNAME = 'asset';

export const InternalAssetRow = props => {

    // Props Destructuring
    const {
        asset,
        selectRow = () => console.error('ContentAssetsList.js', 'InternalAssetRow', 'You must provide an implementation for `selectRow`.'),
        /*optional*/ paperProps = {},
        /*optional*/ nestingLevel= 0
    } = props;
    
    // Hooks
    const theme = useTheme();

    // State
    const [expanded, setExpanded] = useState();

    // Queries
    const model = useQuery({queryKey:['model', asset.model]});
    const modelIcon = useQuery({queryKey:['asseticon', model.data?.icon], enabled:model.isSuccess});

    // Callback Functions
    const toggleExpanded = useCallback(e => {
        setExpanded( prev => !prev );
    }, []);

    const onCheckboxToggle = useCallback(asset => {
        selectRow(asset);
    }, []);

    // Formatted Data
    const clientDeviceIsSmall = useMediaQuery(theme.breakpoints.down('sm'));
    return(
        <>
            <TableRow selected={asset._meta.selected} sx={{backgroundColor:`rgba(0,0,0,${nestingLevel / 10})`}}>
                
                {/* Selection Checkbox */}
                <TableCell align="left">
                    <Box width="fit-content" marginLeft={`${nestingLevel * 10}px`}>
                        <Checkbox checked={asset._meta.selected} onChange={() => onCheckboxToggle(asset)}/>
                    </Box>
                </TableCell>
                
                {/* Model Icon */}
                <TableCell align="left">
                { asset.is_container ?
                    <Box width="fit-content" marginLeft={`${nestingLevel * 10}px`}>
                        <Badge color="primary" badgeContent={asset.assets.length}>
                            <AssetIcon iconName={modelIcon.data?.source_name} />
                        </Badge>
                    </Box>
                :
                    <Box width="fit-content" marginLeft={`${nestingLevel * 10}px`}>
                        <AssetIcon iconName={modelIcon.data?.source_name} />
                    </Box>
                }
                </TableCell>
                
                {/* Asset Code */}
                <TableCell>
                    <Typography variant="dataPointLabel">Asset Code</Typography>
                    <Typography whiteSpace="nowrap">{asset.code}</Typography>
                </TableCell>

                {/* Model Label */}
                <TableCell>
                    <Typography variant="dataPointLabel">Model</Typography>
                    <Typography whiteSpace="nowrap">{model.data?.label}</Typography>
                </TableCell>

                {/* Asset Condition */}
                <TableCell>
                    <Typography variant="dataPointLabel">Condition</Typography>
                    <Typography>
                        <Box 
                            component="span"
                            paddingX={1}
                            color={theme.palette.conditions[asset.condition].contrastText}
                            backgroundColor={theme.palette.conditions[asset.condition].main}
                            borderRadius={theme.shape.borderRadius}
                        >
                            {theme.palette.conditions[asset.condition].label}
                        </Box>
                    </Typography>
                </TableCell>

                {/* Supplementary Actions Actions */}
                <TableCell>

                </TableCell>
                
                {/* Expand Button */}
                <TableCell align="right">
                    { asset.is_container &&
                        <IconButton onClick={toggleExpanded} disabled={!asset.assets}>
                            { expanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    }
                </TableCell>

            </TableRow>

            { expanded && 
                asset.assets.map( childAsset => (
                    
                    <InternalAssetRow
                        {...props}
                        asset={childAsset}
                        nestingLevel={nestingLevel + 1}
                    />

                ))
            }
        </>

    )

}

const AssetRequirementRow = props => {

    return(

        <TableRow selected={asset._meta.selected}>
                    
            {/* Expand Button */}
            <TableCell>
                { asset.is_container &&
                    <IconButton onClick={toggleExpanded} disabled={!asset.assets}>
                        { expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                }
            </TableCell>
            
            {/* Selection Checkbox */}
            <TableCell>
                <Checkbox checked={asset._meta.selected} onChange={() => onCheckboxToggle(asset)}/>
            </TableCell>
            
            {/* Model Icon */}
            <TableCell>
            { asset.is_container ?
                <Badge color="primary" badgeContent={asset.assets.length}>
                    <AssetIcon iconName={modelIcon.data?.source_name} />
                </Badge>
            :
                <Box width="fit-content">
                    <AssetIcon iconName={modelIcon.data?.source_name} />
                </Box>
            }
            </TableCell>
            
            {/* Data Columns */}
            {getDataColumnCells(asset)}

        </TableRow>
    )
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
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);
    const assetOptions = useModelOptions(ASSETMODELNAME);
    const viewingFromMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [objData, setObjData] = useState(false);

    // Queries
    const contentTypes = useQuery({
        queryKey: ['contenttype'],
    });

    const objQuery = useQuery({
        queryKey: [objContentType, obj.id],
        enabled: obj.id != undefined,
        initialData: obj
    });

    const reservations = useQuery({
        queryKey: ['reservation', 'by-shipment', obj.id],
        enabled: obj.id != undefined && objContentType == "shipment",
        queryFn: async () => {
            const formattedUrl = new URL(`${backend.api.baseUrl}/equipmenthold/`);
            formattedUrl.searchParams.set('shipment', obj.id);

            const res = await fetch(formattedUrl);
            const data = await res.json();

            return data;
        }
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
    let canReceiveAssetsFromObj = checkUserPermission(`receive`);
    let canRemoveAssetsFromObj = checkUserPermission(`change_asset`);
    let canMoveAssetsViaScan = checkUserPermission(`scan_to_parent`);

    if (objContentType == 'shipment'){
        //If the shipment is 'Delivered' or 'Cancelled', allow receiving assets from it.
        canReceiveAssetsFromObj = obj.status >= 3 && canReceiveAssetsFromObj;
        //If the shipment is 'scheduled' then allow removing assets.
        canRemoveAssetsFromObj = obj.status == 0 && canRemoveAssetsFromObj;
        //If the shipment is 'scheduled' then allow scanning new assets in.
        canMoveAssetsViaScan = obj.status == 0 && canMoveAssetsViaScan;
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
            ]}

            defaultExpanded={true}
        >
            
            <Paper variant="outlined" sx={{padding:1, overflowX: 'auto'}}>
                <Table size="small">
                    <TableBody>

                        {objData.assets?.map( asset => (
                            <InternalAssetRow
                                asset={asset}
                                selectRow={selectAsset}
                            />
                        ))}

                    </TableBody>
                </Table>
            </Paper>

        </Section>
    )
}

export default ContentAssetsList;