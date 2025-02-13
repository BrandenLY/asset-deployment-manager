import { Archive, Delete, ExpandLess, ExpandMore, PriorityHigh } from '@mui/icons-material';
import { Badge, Box, Button, Checkbox, IconButton, Table, TableBody, TableCell, TableRow, Tooltip, Typography, useTheme } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { backendApiContext } from '../context';
import { useModelOptions, usePermissionCheck } from '../customHooks';
import AssetIcon from './AssetIcon';
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
    const nestingLevelMarginModifier = 15;

    return(
        <>
            <TableRow 
                selected={asset._meta.selected}
                sx={{
                    backgroundColor:`rgba(0,0,0,${nestingLevel / (theme.mode == "dark" ? 25 : 10)})`,
                    border: `3px solid ${theme.palette.divider}`
                }}
            >
                
                {/* Selection Checkbox */}
                <TableCell align="left" sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Checkbox checked={asset._meta.selected} onChange={() => onCheckboxToggle(asset)}/>
                    </Box>
                </TableCell>
                
                {/* Model Icon */}
                <TableCell align="left" sx={{borderBottom: 'none'}}>
                { asset.is_container ?
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Badge color="primary" badgeContent={asset.assets.length}>
                            <AssetIcon iconName={modelIcon.data?.source_name} />
                        </Badge>
                    </Box>
                :
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <AssetIcon iconName={modelIcon.data?.source_name} />
                    </Box>
                }
                </TableCell>
                
                {/* Asset Code */}
                <TableCell sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Typography variant="dataPointLabel">Asset Code</Typography>
                        <Typography whiteSpace="nowrap">{asset.code}</Typography>
                    </Box>
                </TableCell>

                {/* Model Label */}
                <TableCell sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Typography variant="dataPointLabel">Model</Typography>
                        <Typography whiteSpace="nowrap">{model.data?.label}</Typography>
                    </Box>
                </TableCell>

                {/* Asset Condition */}
                <TableCell sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
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
                    </Box>
                </TableCell>

                {/* Supplementary Actions Actions */}
                <TableCell sx={{borderBottom: 'none'}}>

                </TableCell>
                
                {/* Expand Button */}
                <TableCell align="right" sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        { asset.is_container &&
                            <IconButton onClick={toggleExpanded} disabled={!asset.assets}>
                                { expanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        }
                    </Box>
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

export const AssetRequirementRow = props => {

    // Props Destructuring
    const {
        asset,
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

    // Formatted Data
    const nestingLevelMarginModifier = 15;
    const backgroundColor = nestingLevel == 0 ? "rgba(255,0,0,0.05)" : `rgba(255,0,0,${nestingLevel / (theme.mode == "dark" ? 25 : 10)})`;
    
    return(
        <>
            <TableRow 
                selected={asset._meta.selected}
                sx={{
                    backgroundColor:backgroundColor,
                }}
            >
                
                {/* Selection Checkbox */}
                <TableCell align="left" sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Tooltip title="This item was packed in a prior shipment, and was marked to return with this shipment but has not been scanned.">
                            <PriorityHigh/>
                        </Tooltip>
                    </Box>
                </TableCell>
                
                {/* Model Icon */}
                <TableCell align="left" sx={{borderBottom: 'none'}}>
                { asset.is_container ?
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Badge color="primary" badgeContent={asset.assets.length}>
                            <AssetIcon iconName={modelIcon.data?.source_name} />
                        </Badge>
                    </Box>
                :
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <AssetIcon iconName={modelIcon.data?.source_name} />
                    </Box>
                }
                </TableCell>
                
                {/* Asset Code */}
                <TableCell sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Typography variant="dataPointLabel">Asset Code</Typography>
                        <Typography whiteSpace="nowrap">{asset.code}</Typography>
                    </Box>
                </TableCell>

                {/* Model Label */}
                <TableCell sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        <Typography variant="dataPointLabel">Model</Typography>
                        <Typography whiteSpace="nowrap">{model.data?.label}</Typography>
                    </Box>
                </TableCell>

                {/* Asset Condition */}
                <TableCell sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
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
                    </Box>
                </TableCell>

                {/* Supplementary Actions Actions */}
                <TableCell sx={{borderBottom: 'none'}}>

                </TableCell>
                
                {/* Expand Button */}
                <TableCell align="right" sx={{borderBottom: 'none'}}>
                    <Box width="fit-content" marginLeft={`${nestingLevel * nestingLevelMarginModifier}px`}>
                        { asset.is_container &&
                            <IconButton onClick={toggleExpanded} disabled={!asset.assets}>
                                { expanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        }
                    </Box>
                </TableCell>

            </TableRow>

            { expanded && 
                asset.assets.map( childAsset => (
                    
                    <AssetRequirementRow
                        {...props}
                        asset={childAsset}
                        nestingLevel={nestingLevel + 1}
                    />

                ))
            }
        </>
    )

}

export const ReservationRequirementRow = props => {

    // Props Destructuring
    const {model, quantity} = props;

    // Hooks
    const theme = useTheme();

    const modelQuery = useQuery({queryKey:['model', model]});
    const modelIcon = useQuery({queryKey:['asseticon', modelQuery.data?.icon], enabled:modelQuery.isSuccess});

    return(
        <TableRow sx={{backgroundColor: "rgba(255,0,0,0.05)"}}>
                    
            {/* Selection Checkbox */}
            <TableCell align="left" sx={{borderBottom:"none"}}>
                <Box width="fit-content">

                </Box>
            </TableCell>
            
            {/* Model Icon */}
            <TableCell align="left" sx={{borderBottom:"none"}}>
                <Box width="fit-content">
                    <AssetIcon iconName={modelIcon.data?.source_name} />
                </Box>
            </TableCell>
            
            {/* Asset Code */}
            <TableCell sx={{borderBottom:"none"}}>
                <Box width="fit-content">
                    <Typography variant="dataPointLabel">Model Code</Typography>
                    <Typography whiteSpace="nowrap">{modelQuery.data?.model_code}</Typography>
                </Box>
            </TableCell>

            {/* Model Label */}
            <TableCell sx={{borderBottom:"none"}}>
                <Box width="fit-content">
                    <Typography variant="dataPointLabel">Model</Typography>
                    <Typography whiteSpace="nowrap">{modelQuery.data?.label}</Typography>
                </Box>
            </TableCell>

            {/* Asset Condition */}
            <TableCell sx={{borderBottom:"none"}}>
                <Box width="fit-content">
                    <Typography variant="dataPointLabel">Quantity</Typography>
                    <Typography>
                        <Typography component="span" sx={{opacity: "0.75"}}>x</Typography>
                        <Typography component="span" fontWeight="bolder" fontSize="1.5rem">{quantity}</Typography>
                    </Typography>
                </Box>
            </TableCell>

            {/* Supplementary Actions Actions */}
            <TableCell sx={{borderBottom:"none"}}>
                <Box width="fit-content">

                </Box>
            </TableCell>
            
            {/* Expand Button */}
            <TableCell align="right" sx={{borderBottom:"none"}}>
                <Box width="fit-content">

                </Box>
            </TableCell>

        </TableRow>
    )
}

const ContentAssetsList = props => {

    // Props Destructuring
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

    // State
    const [objData, setObjData] = useState(false);
    const [requiredItems, setRequiredItems] = useState([]);
    const [requiredAssets, setRequiredAssets] = useState([]);

    // Queries
    const contentTypes = useQuery({
        queryKey: ['contenttype'],
    });

    const objQuery = useQuery({
        queryKey: [objContentType, obj.id],
        enabled: obj.id != undefined,
        initialData: obj
    });

    const reservationsQuery = useQuery({
        queryKey: ['reservation', 'by-shipment', obj.id],
        enabled: obj.id != undefined && objContentType == "shipment",
        queryFn: async () => {
            const formattedUrl = new URL(`${backend.api.baseUrl}/equipmenthold/`);
            formattedUrl.searchParams.set('shipment', obj.id);

            const res = await fetch(formattedUrl);
            const data = await res.json();

            return data;
        }
    });

    const sourceShipmentsQuery = useQuery({
        queryKey: ['shipment', 'by-successor-shipment', obj.id],
        enabled: obj.id != undefined && objContentType == "shipment",
        queryFn: async () => {
            const formattedUrl = new URL(`${backend.api.baseUrl}/shipment/`);
            formattedUrl.searchParams.set('return_shipment', obj.id);

            const res = await fetch(formattedUrl);
            const data = await res.json();

            return data;
        }
    });;

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
    useEffect(() => { // Sync objData state value with objQuery results

        if (!contentTypes.isSuccess){
            // contentTypes must be loaded before selectAsset() function can work properly. Prevent populating objData state before contentTypes query is successful.
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



    }, [objQuery.data, contentTypes.isSuccess, objQuery.isSuccess]);

    useEffect(() => { // Ensure objQuery refetches when obj prop changes.
        objQuery.refetch();
    }, [obj]);

    useEffect(() => { // Sync requiredItems state value with reservationsQuery query results.

        if(!objData){ // Abort if objData is not loaded
            return;
        }

        if(reservationsQuery.data){

            // Get Model counts for reservations
            const reservationItems = {};
            reservationsQuery.data.results.forEach(r => {

                r.reservation_items.forEach( i => {

                    const currentModelCount = reservationItems[i.model];
                    reservationItems[i.model] = typeof(currentModelCount) == 'number' ? currentModelCount + i.quantity : i.quantity;

                })

            });

            // Get Model count for currently contained assets
            const currentItems = {};
            objData.assets.forEach( asset => {

                const currentParentModelCount = currentItems[asset.model];
                currentItems[asset.model] = typeof(currentParentModelCount) == 'number' ? currentParentModelCount + 1 : 1;

                asset.assets.forEach( a => {
                    
                    const currentChildModelCount = currentItems[a.model];
                    currentItems[a.model] = typeof(currentChildModelCount) == 'number' ? currentChildModelCount + 1 : 1;

                });

            });

            // Calculate difference in reservation items vs current contents
            const requiredItems = Object.entries(reservationItems).map( ([modelId, qty]) => {

                if(typeof(currentItems[modelId]) == 'number'){

                    const difference = qty - currentItems[modelId];

                    return [modelId, difference];

                }
                else{
                    return [modelId, qty];
                }

            }).filter( ([modelId, qty]) => qty > 0);


            // Update state
            setRequiredItems(requiredItems);

        }
    
    }, [reservationsQuery.data, objData]);

    useEffect(() => { // Sync requiredAssets state value with sourceShipmentsQuery query results.
        
        if (!objData){ // Abort if objData is not loaded
            return;
        }

        if (sourceShipmentsQuery.data){

            const rawAssets = sourceShipmentsQuery.data.results.map(sourceShipment => sourceShipment.packed_assets).flat();
            const formattedAssets = rawAssets.map( asset => parseAssetData(asset) );

            // FIXME: Ensure you're only adding assets that are not currently contained in the shipment to the requiredAssets state.
            setRequiredAssets(formattedAssets);
        }
    }, [sourceShipmentsQuery.data, objData]);

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

    if (objContentType == 'shipment'){
        //If the shipment is 'Delivered' or 'Cancelled', allow receiving assets from it.
        canReceiveAssetsFromObj = obj.status >= 3 && canReceiveAssetsFromObj;
        //If the shipment is 'scheduled' then allow removing assets.
        canRemoveAssetsFromObj = obj.status == 0 && canRemoveAssetsFromObj;
    }

    const hasAssetSelections = objData ? objData.assets
    .map( a => [a, ...a.assets]).flat()
    .map( a => a._meta.selected )
    .includes(true)
    : false;

    return (
        <Section
            title={<Box textTransform="capitalize">{objContentType} Contents ({objData.asset_counts?.total_assets})</Box>}
            actions={[
                hasAssetSelections && canReceiveAssetsFromObj ? <Button startIcon={<Archive/>} variant="outlined" onClick={receiveSelectedAssets}>Receive selected</Button> : null,
                hasAssetSelections && canRemoveAssetsFromObj ? <Button startIcon={<Delete/>} variant="outlined" onClick={removeSelectedAssets}>Remove selected</Button> : null,
            ]}

            defaultExpanded={true}
        >
            <Box sx={{overflowX:"auto"}}>
                <Table size="small" className={'asset-content-list'} sx={{borderSpacing:"0 10px", borderCollapse:"separate"}}>
                    <TableBody>

                        {requiredItems.map( requiredItem => (
                            <ReservationRequirementRow 
                                model={requiredItem[0]}
                                quantity={requiredItem[1]}
                            />
                        ))}

                        {requiredAssets.map( requiredAsset => (
                            <AssetRequirementRow
                                asset={requiredAsset}
                            />
                        ))}

                        {objData.assets?.map( asset => (
                            <InternalAssetRow
                                asset={asset}
                                selectRow={selectAsset}
                            />
                        ))}

                        {objData.assets?.length == 0 &&
                            <TableRow>
                                <TableCell align='center' sx={{borderBottom: "none"}} colSpan={7}>
                                    <Typography sx={{opacity:"70%"}}>
                                        This {objContentType} does not contain any assets.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        }

                    </TableBody>
                </Table>
            </Box>

        </Section>
    )
}

export default ContentAssetsList;