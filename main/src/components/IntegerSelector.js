import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, OutlinedInput, useTheme } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

const IntegerSelector = props => {

    const {

        value,
        onChange = () => {},
        onIncrement = () => {},
        onDecrement = () => {}

    } = props;

    const theme = useTheme();
    const inputEl = useRef(null);

    const [number, setNumber] = useState(value == undefined ? 0 : value);

    const increment = e => {
        setNumber( prev => {
            const newVal = ++prev;
            onIncrement(newVal); // Update external state
            return newVal;
        })
    }

    const decrement = e => {
        setNumber( prev => {
            if(prev > 0){ // Ensures positive number
                const newVal = --prev;
                onDecrement(newVal); // Update external state
                return newVal;
            }
        })
    }

    const setNumberValue = e => {
        setNumber(new Number(e.target.value));
    }

    // Effects
    useEffect(() => {
        const handleChange = e => {
            console.log(e);

            if (e.isComposing){
                return; // Wait for entry to be complete.
            }

            try{
                setNumber(new Number(e.data));
            }
            catch{
                setNumber(0);
            }
        }

        if(inputEl.current){
            inputEl.current.addEventListener("input", handleChange);
        }

        return(() => {
            if(inputEl.current){
                inputEl.current.removeEventListener("input", handleChange);
            }
        })
    }, [inputEl.current]); // Register input event handlers for input element

    useEffect(() => {
        onChange(number);
    }, [number]); // Update external state

    useEffect(() => {
        if(number != value){
            setNumber( value );
        }
    },[value]) // Sync state with prop
    
  return (
    <Box display="flex" flexDirection="column" border={`3px solid ${theme.palette.divider}`} maxWidth="100px">
        <Button onClick={increment} disableRipple color="inherit" sx={{borderRadius:0}}>
            <ExpandLess color="inherit" />
        </Button>

        <input 
            ref={inputEl}
            className="simple-number-input"
            type="number"
            inputMode="numeric" /* Removes some styles on mobile */
            value={number}
            style={{
                color: theme.palette.text.primary,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontStyle: 'inherit'
            }}
        />

        <Button onClick={decrement} disableRipple color="inherit" sx={{borderRadius:0}}>
            <ExpandMore color="inherit"/>
        </Button>
    </Box>
  )
}

export default IntegerSelector