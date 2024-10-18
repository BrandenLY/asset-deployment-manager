import { Box, Button, IconButton, Popover, Typography } from '@mui/material';
import React from 'react'

const ActionButton = props => {
    const { 
        popoverText,
        actionElement:ActionElement=Button,
        elementProps={},
        callbackFn,
    } = props;

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handlePopoverClose = () => {
      setAnchorEl(null);
    };

    const handleActionButtonClick = event => {
        setAnchorEl(null);
        callbackFn(event);
        event.preventDefault();
    }
  
    const open = Boolean(anchorEl);

    return (
        <Box>
                
            <ActionElement 
                {...elementProps} 
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                onClick={handleActionButtonClick}
            >
                {props.children}
            </ActionElement>

            <Popover
                id="mouse-over-popover"
                sx={{
                pointerEvents: 'none',
                transform: "translateY(-5px)"
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
                }}
                transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <Typography sx={{padding: 0.5}}>{popoverText}</Typography>
            </Popover>
            
        </Box>
    )
}

export default ActionButton