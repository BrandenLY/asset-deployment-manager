import { Box, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, ListSubheader, Paper, Popover, Typography } from '@mui/material';
import { CheckCircle, Error, Pending } from '@mui/icons-material'
import React, {useEffect, useRef, useState} from 'react'

const LogRow = props => {

    // Props
    const {log, logName} = props;
    
    // State
    const [anchor, setAnchor] = useState(null); //Type: HTML Element | Null

    // Callback Functions
    const handlePopoverOpen = (event) => {
        setAnchor(event.currentTarget);
      };
    
      const handlePopoverClose = () => {
        setAnchor(null);
      };

    // Formatted Data
    const isLoading = log == null;
    let isSuccess = false;
    let isError = false;
    let logColor = null;

    if(!isLoading){
        isSuccess = log.data != null;
        isError = log.error != undefined;
    }
    if(isSuccess){ logColor = 'success'; }
    if(isError){ logColor = 'error'; }
    const open = Boolean(anchor);

    return(
        <ListItem disablePadding sx={{padding:1}}>
            <ListItemIcon>
                {/* Status Icons */}
                {isLoading&& <Pending />}
                {isSuccess&& <CheckCircle color='success' />}
                {isError&& <Error color='error'/>}
            </ListItemIcon>
            {/* Text */}
            <ListItemText primary={
                <>
                    <Popover
                        id="mouse-over-popover"
                        sx={{
                            pointerEvents: 'none',
                        }}
                        open={open}
                        anchorEl={anchor}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose}
                    >
                        <Typography
                            onMouseEnter={handlePopoverOpen}
                            onMouseLeave={handlePopoverClose}
                            color={logColor}
                            sx={{margin:1}}
                        >
                            {log != null ? log.error : null}
                            {(log != null && log.data != undefined)&& 

                                Object.entries(log.data).map(([key,value]) => <Typography><Typography component='span' sx={{fontWeight: 'bold', marginRight: 2}}>{key}</Typography>&nbsp;{new String(value)}</Typography>)
                            }
                        </Typography>
                    </Popover>
                    <Typography
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                        color={logColor}
                    >
                        {logName}
                    </Typography>
                </>
            }/>

        </ListItem>
    )
}

const ScanLog = props => {
    // Destructuring Props
    const {data} = props;

    // HOOKS
    const scanList = useRef(null);
    
    useEffect(() => {
        if (scanList.current != null){
            scanList.current.scrollTop = scanList.current.scrollHeight
        }
    }) // Ensure ScanLog always shows The latest result (bottom)

    // Formatted Data
    const LogEntries = Object.entries(data);

  return (
    <Paper elevation={3}>
        <List ref={scanList} dense={true} subheader={<ListSubheader>Scans ({LogEntries.length})</ListSubheader>} sx={{minWidth: "225px", maxHeight: 32*(LogEntries.length + 1)+48, overflowY: "scroll"}} color="inherit">
            {LogEntries.map(
                ([logName, logData]) => <LogRow logName={logName} log={logData}/>
            )}
        </List>
    </Paper> 
  )
}

export default ScanLog