import { Info } from '@mui/icons-material';
import { Box, Popover, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react'

const DictInfo = props => {

    const {children, info={}, label, last_modified_datetime, created_at_datetime, last_modified_user} = props;
    
    const [isOpen, setIsOpen] = useState(false);
    const [anchor, setAnchor] = useState(null);
    const anchorElement = useRef(null);

    useEffect(()=>{
        if(anchorElement.current){
            anchorElement.current.addEventListener("mouseover", handlePopoverOpen);
            anchorElement.current.addEventListener("mouseout", handlePopoverClose);
        }

        return(() => {
            if(anchorElement.current){
                anchorElement.current.removeEventListener();
                anchorElement.current.removeEventListener();
            }
        })
    },[])
    const onClose = e => {

    }

    const handlePopoverOpen = e => {
        e.preventDefault();
        setAnchor(e.target);
    };
    
    const handlePopoverClose = e => {
        e.preventDefault();
        setAnchor(null);
    };

    const parseValue = val => {

        if (val == null){
            // Handle Blank Values
            return(<Typography component="span" variant='nullValue'>Null</Typography>)
        }
        if (Array.isArray(val)){
            // Handle Arrays
            return(`${val.length} items`)
        }

        if (typeof val == 'object'){
            // Handle Misc Objects
            return val.label;
        } 
        
        // Default
        return new String(val);
 
    }

    const open = Boolean(anchor);

    return (
        <>
            <Box sx={{display: "flex"}}>
                { children }
                <Info ref={anchorElement} sx={{fontSize:"18px", position: "relative", left:2, bottom:2}} focusable={true}/>
            </Box>
            <Popover
                id={info?.id}
                open={open}
                anchorEl={anchor}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                    }}
                sx={{
                    pointerEvents: 'none',
                    }}
            >
                <TableContainer sx={{padding:1}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{color: "primary.main"}} colSpan={2}>{label}</TableCell>
                            </TableRow>
                            <TableRow sx={{fontWeight:"bold"}}>
                                <TableCell>
                                    Property
                                </TableCell>
                                <TableCell>
                                    Value
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(info).map(([k,v], i) =>{
                                return(
                                    <TableRow>
                                        <TableCell>{k}</TableCell>
                                        <TableCell><Typography component='code' variant='code'>
                                            {parseValue(v)}
                                        </Typography></TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Popover>
        </>
    )
}

export default DictInfo