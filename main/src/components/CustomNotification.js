import { Alert, Snackbar } from '@mui/material';
import React, { useState } from 'react'

export const CustomNotification = props => {

    const [open, setOpen] = useState(true);

    return (
        <Snackbar open={open} autoHideDuration={3000} anchorOrigin={{vertical:"bottom", horizontal:"right"}} onClose={() => setOpen(false)}>
            <Alert
                onClose={() => setOpen(false)}
                severity={props.level}
            >
                {props.text}
            </Alert>
        </Snackbar>
    )
}
