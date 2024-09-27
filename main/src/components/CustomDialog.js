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
        openDialogButtonText,
        openDialogButtonIcon,
        title,
        subtitle="",
        children:innerContent,
        onClose:externalOnClose,
        actions={}
    } = props;

    // Hooks
    const theme = useTheme();
    const clientIsMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isOpen, setIsOpen] = useState(false);

    // Callback Functions
    const openDialog = e => {
        setIsOpen(true);
    }

    const closeDialog = e => {
        setIsOpen(false);
        externalOnClose();
    }

  return (
    <React.Fragment>
        {/* OPEN DIALOG BUTTON */}
        <Button
            variant="contained"
            startIcon={openDialogButtonIcon ? openDialogButtonIcon : undefined}
            onClick={openDialog}
        >
            {openDialogButtonText}
        </Button>


        {/* DIALOG COMPONENT */}
        <Dialog
            open={isOpen}
            fullWidth={true}
            maxWidth={!clientIsMobile ? 'md' : false}
            maxHeight
            PaperProps={{sx:{padding:2, maxHeight: "78vh"}}}
        >
            <Box sx={{display: 'flex', alignItems: 'center', gap:3, justifyContent:'space-between'}}>
                <Box sx={{padding:1}}>
                    <Typography variant='h6'>{title}</Typography>
                    <Typography variant='subtitle2' sx={{fontWeight:400}}>{subtitle}</Typography>
                </Box>
                <IconButton onClick={closeDialog}>
                    <Close/>
                </IconButton>
            </Box>
            <Divider></Divider>
            <DialogContent sx={{padding:1, display: "flex", flexDirection:"column", gap:2}}>
                {innerContent}
            </DialogContent>
            <DialogActions>
                {actions.map(
                    ( {buttonText, onClickFn} ) => (
                        <Button onClick={onClickFn} variant="contained">
                            {buttonText}
                        </Button>
                    )    
                )}
            </DialogActions>
        </Dialog>
    </React.Fragment>
  );
};

export default CustomDialog;
