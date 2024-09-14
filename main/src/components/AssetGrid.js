import React, {useState} from 'react';
import { Box, Button, Card, CardActions, CardContent, IconButton, Paper, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { DevicesOther, ExpandLess, ExpandMore, Remove } from '@mui/icons-material';
import { useModelOptions } from '../customHooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AssetDetailsCard = props => {
  const {asset, options, removeAssetFromParent, addNotif} = props;
  const [displayChildren, setDisplayChildren] = useState(false);
  const [noteText, setNoteText] = useState(asset.note);

  const theme = useTheme();
  const queryClient = useQueryClient();

  const toggleDisplayChildren = e => {
    e.preventDefault()
    setDisplayChildren(prev => !prev);
  }

  // Formatted Data
  let conditionText = '-';
  let conditionTextBgColor = null;
  let conditionTextFgColor = null;

  if (options.isSuccess){
    conditionText = options.data.model_fields['condition'].choices.find(c => c.value == asset.condition).display_name;
    conditionTextBgColor = theme.palette.conditions[conditionText.toLowerCase()].main;
    conditionTextFgColor = theme.palette.conditions[conditionText.toLowerCase()].contrastText;
  }

  return(
    <Card sx={{padding:1, width:"clamp(316px,33%,566px)", position:"relative"}}>
      <CardContent>
        
        <Box position="relative" display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} width="100%" height="auto">

          <Box display="flex" gap={1} mb={1} alignItems="flex-start" flexShrink={2} maxWidth="clamp(70%, 90%, 90%)">

            <Paper 
              sx={{
                padding:1.25,
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                border: "1px solid rgba(0,0,0,0.06)",
                backgroundColor: "info.main",
              }}
            >
              <DevicesOther/>
            </Paper>

            <Box maxWidth="66%" flexShrink={2}>
              <Typography noWrap fontWeight="bold">{asset.label}</Typography>
              <Typography fontSize="0.80rem">Condition: <Typography variant="code" sx={{backgroundColor: conditionTextBgColor, color: conditionTextFgColor}}>{conditionText}</Typography></Typography>
            </Box>

          </Box>
          
          <Tooltip title="Remove asset from shipment">
            <IconButton sx={{ width:"40px", height:"40px", position:"relative", top:"-18px"}} onClick={e => removeAssetFromParent(asset)}>
              <Remove/>
            </IconButton>
          </Tooltip>

        </Box>

        <TextField label="Note" multiline fullWidth rows={2} value={noteText} disabled/>

      </CardContent>
      <CardActions>
        {asset.is_container ? <Button endIcon={displayChildren ? <ExpandLess/> : <ExpandMore />} onClick={toggleDisplayChildren}>Show ({asset.assets.length}) assets</Button> : null}
      </CardActions>
    </Card>
  )
}

const AssetGrid = props => {

  // PROPS DESTRUCTURING
  const {fromQuery, assets, addNotif} = props;

  // HOOKS
  const theme = useTheme();
  const assetOptions = useModelOptions('asset');

  // QUERIES/MUTATIONS
  const clearAssetParent = useMutation({
    onSettled: async (res, error, vars) => {

      if (!res.ok || error != undefined){
        addNotif({severity:"error", message:"Failed to remove asset."})
      }

      else {
        addNotif({message: "Successfully removed asset."});
        fromQuery.refetch()
      }

    }
  })

  // CALLBACK FUNCTIONS
  const removeAssetFromParent = asset => {

    let payload = {
      ...asset,
      parent_content_type: null,
      parent_object_id: null
    }

    clearAssetParent.mutate({model: {modelName: "asset"}, data: payload})
  }

  // FORMATTED DATA

  // RENDER
  return(
    <Paper elevation={3} sx={{padding: 2, width:"100%"}} flex>

      {assets.length > 0 &&
        <Box width="100%" minHeight="20vh" border={`1px dashed ${theme.palette.grey[700]}`} display="flex" gap={2} flexWrap="wrap" padding={3}>

        {assets.map( asset => 
          <AssetDetailsCard asset={asset} options={assetOptions} addNotif={addNotif} removeAssetFromParent={removeAssetFromParent}/>
        )}

        </Box>
      }

      {assets.length == 0 &&
        <Box width="100%" minHeight="20vh" border={`1px dashed ${theme.palette.grey[700]}`} display="flex" justifyContent="center" alignItems="center" padding={3}>
          <Typography>No Assets</Typography>
        </Box>
      }

    </Paper>
  )
}

export default AssetGrid