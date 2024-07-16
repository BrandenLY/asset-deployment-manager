import { Close, Delete, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, {useState} from 'react'
import AssetIcon from './AssetIcon';

const AssetDetailsCard = props => {

    const { asset, paperProps, variant="individual-asset" } = props;
    //

    const [displayChildren, setDisplayChildren] = useState(false);
    const [noteText, setNoteText] = useState(asset.note);

    const model = useQuery({
        queryKey: ['assetModel', asset.model ], // asset.model is the id of this asset's model.
        staleTime: 'Infinity' // This data is not regularly updated, so we will not need to update this regularly.
    })

    const removeAssetFromParent = () => {

    }
    const updateNoteText = () => {

    }
    const toggleDisplayChildren = () => {

    }

    if(asset == undefined){
        return(
            <Paper
                sx={{
                    minWidth:"433px",
                    padding:1
                }}
                {...paperProps}
                elevation={3}
            >
                Loading
            </Paper>
        )
    }

    // Formatted Data
    const modelName = model.isSuccess ? model.data.label : model.status;

    return (
        <Paper
            elevation={3}
            {...paperProps}
            sx={{
                ...paperProps.sx,
                maxWidth:"433px",
                minWidth:"280px",
                padding:1,
                flexGrow:1,
            }}
        >
            <Box sx={{display: "flex", width:"100%", justifyContent: "space-between"}}>
                {/* {Img, Name, Info Popup, and Remove action} */}
                <Box sx={{display: "flex", gap:2}}>
                    {model.isSuccess &&
                        <AssetIcon iconName={model.data.icon.source_name}/>
                    }
                    <Box>
                        <Typography>{asset.label}</Typography>
                        <Typography>Model: {modelName}</Typography>
                    </Box>
                </Box>
                <Box>
                    <IconButton size="small" onClick={removeAssetFromParent} color={"error"}><Delete/></IconButton>
                </Box>

            </Box>
            <Box sx={{marginTop: 1, padding: 1}}>
                {/* {Notes, Expand action, supplementary actions} */}
                <Box>
                    <Box>
                        <Typography>Note:</Typography>
                        <TextField multiline fullWidth rows={2} value={noteText} onChange={updateNoteText}/>
                        <Box sx={{marginTop:2}}>
                            <Button 
                                onClick={toggleDisplayChildren}
                                endIcon={displayChildren ? <ExpandLess/> : <ExpandMore/> }
                            >
                                <Typography variant="button">Show ({asset.assets.length}) Assets</Typography>
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Paper>
    )
}

export default AssetDetailsCard