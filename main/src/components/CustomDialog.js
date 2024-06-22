import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const CustomDialog = (props) => {
    // Props
    const {openDialogButtonText, openDialogButtonIcon, title, subtitle="", children:innerContent, actions={}} = props;

    // Hooks
    const theme = useTheme();
    const clientIsMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // State
    const [isOpen, setIsOpen] = useState(false);

    // Callback Functions
    const openDialog = e => {
        setIsOpen(true);
    }

    const closeDialog = e => {
        setIsOpen(false);
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
            PaperProps={{sx:{padding:2}}}
        >
            <Box sx={{display: 'flex', alignItems: 'center', gap:2, justifyContent:'space-between'}}>
                <Box sx={{padding:1}}>
                    <Typography variant='h6'>{title}</Typography>
                    <Typography variant='subtitle2' sx={{fontWeight:400}}>{subtitle}</Typography>
                </Box>
                <IconButton onClick={closeDialog}>
                    <Close/>
                </IconButton>
            </Box>
            <Divider></Divider>
            <DialogContent>
                {innerContent}
            </DialogContent>
            <DialogActions>
                { Object.entries(actions).map(([name,data]) => {
                    return(<Button onClick={data.callbackFn} variant="contained">{name}</Button>)
                }) }
            </DialogActions>
        </Dialog>
    </React.Fragment>
  );
};

export default CustomDialog;
