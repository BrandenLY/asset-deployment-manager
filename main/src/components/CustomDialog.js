import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const CustomDialog = (props) => {

    // Props
    const {
        open,
        title,
        subtitle="",
        children:innerContent,
        onClose:externalOnClose,
        actions={}
    } = props;

    // Hooks
    const theme = useTheme();
    const clientIsMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const closeDialog = e => {
        externalOnClose(e);
    }

  return (
    <React.Fragment>

        {/* DIALOG COMPONENT */}
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={!clientIsMobile ? 'md' : false}
            maxHeight
            PaperProps={{sx:{padding:2, maxHeight: "78vh"}}}
            onClose={closeDialog}
        >
            <Box sx={{display: 'flex', alignItems: 'center', gap:3, justifyContent:'space-between'}}>
                <Box sx={{padding:1}}>
                    <Typography variant='h4'>{title}</Typography>
                    <Typography variant='subtitle2' sx={{fontWeight:400}}>{subtitle}</Typography>
                </Box>
                <IconButton onClick={closeDialog}>
                    <Close/>
                </IconButton>
            </Box>
            <Divider sx={{borderBottomWidth: "3px", marginBottom: theme.spacing(1)}}></Divider>
            <DialogContent sx={{padding:1, display: "flex", flexDirection:"column", gap:2}}>
                {innerContent}
            </DialogContent>
            <DialogActions>
                {actions}
            </DialogActions>
        </Dialog>

    </React.Fragment>
  );
};

export default CustomDialog;
