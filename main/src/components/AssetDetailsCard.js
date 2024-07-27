import { Close, Delete, DevicesOther, ExpandLess, ExpandMore, Save } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, {useState} from 'react'
import AssetIcon from './AssetIcon';
import DictInfo from './DictInfo';

const SmallDetailsCard = props => {

    const { asset, paperProps={} } = props;

    const model = useQuery({
        queryKey: ['assetModel', asset.model ], // asset.model is the id of this asset's model.
        staleTime: 'Infinity' // This data is not regularly updated, so we will not need to update this regularly.
    })

    const removeAssetFromParent = e => {

    }
    
    const containerStyles = {
        ...paperProps.sx,
        flexBasis:"366px",
        flexGrow:1,
        flexShrink:1,

        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        maxWidth: "166px",
        gap:"1rem",
        paddingY:3,
        paddingX:2
    }

    const popoverDetails = {...asset};
    delete popoverDetails.label;
    delete popoverDetails.note;

    return(
        <Paper
            elevation={4}
            {...paperProps}
            variant='outlined'
            sx={containerStyles}
        >
            {/* {model.isSuccess &&
                <AssetIcon iconName={model.data.icon.source_name}/>
            } */}
            {/* Remove the below */}
            <Box>
                <Paper 
                    sx={{
                        width: "40px", 
                        height: "40px", 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center",
                        border: "1px solid rgba(0,0,0,0.06)",
                        backgroundColor: "info.main",
                    }}
                >
                    <DevicesOther/>
                </Paper>
            </Box>
            <Typography sx={{textAlign:"center"}}>{model.data?.label}</Typography>
            <DictInfo label={asset.label} info={popoverDetails}>
                <Typography>{asset.code}</Typography>
            </DictInfo>
            <Box>
                <IconButton size="small" onClick={removeAssetFromParent} color={"error"}><Delete/></IconButton>
            </Box>
            {/* Remove the above */}
        </Paper>
    )
}

const AssetDetailsCard = props => {

    const { asset, paperProps={} } = props;
    //

    const [displayChildren, setDisplayChildren] = useState(false);
    const [noteText, setNoteText] = useState(asset.note);

    const model = useQuery({
        queryKey: ['assetModel', asset.model ], // asset.model is the id of this asset's model.
        staleTime: 'Infinity' // This data is not regularly updated, so we will not need to update this regularly.
    })

    const removeAssetFromParent = () => {

    }

    const updateNoteText = e => {
        setNoteText(e.target.value);
    }

    const toggleDisplayChildren = () => {
        setDisplayChildren(prev => !prev);
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
    const containerStyles = {
        ...paperProps.sx,
        flexBasis:"366px",
        padding:1,
        flexGrow:1,
        minWidth: asset.is_container ? "100%" : "unset",
        maxWidth: asset.is_container ? "unset" : "366px"
    }
    const popoverDetails = {...asset};
    delete popoverDetails.label;
    delete popoverDetails.note;
    return (
        <Paper
            elevation={3}
            {...paperProps}
            sx={containerStyles}
        >
            <Box sx={{display: "flex", width:"100%", justifyContent: "space-between"}}>
                {/* {Img, Name, Info Popup, and Remove action} */}
                <Box sx={{display: "flex", gap:2, alignItems: "center"}}>
                    {/* {model.isSuccess &&
                        <AssetIcon iconName={model.data.icon.source_name}/>
                    } */}
                    {/* Remove the below */}
                    <Box>
                        <Paper 
                            sx={{
                                width: "40px", 
                                height: "40px", 
                                display: "flex", 
                                justifyContent: "center", 
                                alignItems: "center",
                                border: "1px solid rgba(0,0,0,0.06)",
                                backgroundColor: "info.main",
                            }}

                        >
                            <DevicesOther/>
                        </Paper>
                    </Box>
                    {/* Remove the above */}
                    <Box>
                        <DictInfo label={asset.label} info={popoverDetails}>
                            <Typography>{asset.label}</Typography>
                        </DictInfo>
                        <Typography>Last modified: {(new Date(asset.last_modified)).toLocaleDateString()}</Typography>
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
                        
                        {/* Display 'Save' button */}
                        {asset.note != noteText && 
                            <Box sx={{marginTop:2}}>
                                <Button 
                                    onClick={toggleDisplayChildren}
                                    startIcon={<Save/>}
                                >
                                    <Typography variant="button">Save</Typography>
                                </Button>
                            </Box>
                        }
                        
                        {/* Display 'Show (x) Assets' button */}
                        {asset.is_container && 
                            <Box sx={{marginTop:2}}>
                                <Button 
                                    onClick={toggleDisplayChildren}
                                    endIcon={displayChildren ? <ExpandLess/> : <ExpandMore/> }
                                >
                                    <Typography variant="button">{displayChildren ? "Hide" : "Show"} ({asset.assets.length}) Assets</Typography>
                                </Button>
                            </Box>
                        }

                        {displayChildren &&
                            <Box sx={{marginTop:1}}>
                                {asset.assets.map( a => <SmallDetailsCard asset={a} paperProps={{}}/>)}
                            </Box>
                        }
                    </Box>
                </Box>
            </Box>
        </Paper>
    )
}

export default AssetDetailsCard