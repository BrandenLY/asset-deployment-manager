import { Box, IconButton, Popover, Typography } from '@mui/material';
import React from 'react'

const ActionButton = props => {
    const { actionObject, actionText, callbackFn } = props;

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handlePopoverClose = () => {
      setAnchorEl(null);
    };

    const handleActionButtonClick = event => {
        callbackFn(actionText, event);
        event.preventDefault();
    }
  
    const open = Boolean(anchorEl);

    return (
        <Box>
        <IconButton aria-label={actionText} onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose} onClick={handleActionButtonClick}>
            <actionObject.icon></actionObject.icon>
        </IconButton>
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
            <Typography sx={{padding: 0.5}}>{actionText}</Typography>
        </Popover>
        </Box>
    )
}

export default ActionButton