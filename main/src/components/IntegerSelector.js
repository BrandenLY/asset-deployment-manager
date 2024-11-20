import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, IconButton, OutlinedInput, TextField, useTheme } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import StyledNumberInput from './StyledNumberInput';


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

    const setNumberValue = (e, value) => {
        setNumber(value);
    }

    useEffect(() => {
        onChange(number);
    }, [number]); // Update external state

    useEffect(() => {
        if(number != value){
            setNumber( value );
        }
    },[value]) // Sync state with prop
    
  return (
    <StyledNumberInput 
        value={number}
        onIncrement={increment}
        onDecrement={decrement}
        onChange={setNumberValue}
    />
  )
}

export default IntegerSelector