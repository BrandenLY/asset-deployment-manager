import { Box } from '@mui/material';
import React, { useRef, useEffect, useState } from 'react'

const SwipeButton = props => {

    const {
        onSwipeLeft=(()=>{}), 
        onSwipeRight=(()=>{}), 
        onSwipeUp=(()=>{}), 
        onSwipeDown=(()=>{}), 
        containerProps, 
        fullWidth=false
    } = props;
    
    // // State Hooks
    // const [offsetX, setOffsetX] = useState(0); // Used to move the button's parent element visually as a swipe interaction occurs.
    // const [offsetY, setOffsetY] = useState(0); // Used to move the button's parent element visually as a swipe interaction occurs.

    const ButtonElement = useRef(null);
    const touch = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    // Register event listeners
    useEffect(() => {

        ButtonElement.current.addEventListener('touchstart', handleTouchStart);
        ButtonElement.current.addEventListener('touchmove', handleTouchMove);
        ButtonElement.current.addEventListener('touchend', handleTouchEnd);

        return(() => {
            // Cleanup Function
            ButtonElement.current.removeEventListener('touchstart', handleTouchStart);
            ButtonElement.current.removeEventListener('touchmove', handleTouchMove);
            ButtonElement.current.removeEventListener('touchend', handleTouchEnd);
        })

    },[])

    const handleTouchStart = e => {
        
        if (e.targetTouches.length > 1){
            return;
        }

        const touch_event = e.targetTouches[0];
        touch.current = touch_event.identifier;
        touchStartX.current = touch_event.clientX;
        touchStartY.current = touch_event.clientY;

        // Prevent default behaviors & propagation.
        e.preventDefault();
    }
    const handleTouchMove = e => {

        const touch_event = [...e.changedTouches].filter(t => t.identifier == touch.current)[0];

        // Drag animation
        const parent = e.target.parentElement;
        const parentBox = parent.getBoundingClientRect();

        // Calculate Movement Change
        const startX = touchStartX.current, startY = touchStartY.current;
        const newX = touch_event.clientX, newY = touch_event.clientY;

        const deltaX = startX - newX;
        const deltaY = startY - newY;

        // Calculate New Element Position
        const curX = parentBox.x, curY = parentBox.y;

        parent.style.position = 'relative';
        parent.style.border = '1px solid red';

        switch( getMovementDirection([startX, startY],[newX, newY]) ){
            case 'right':
                parent.style.right = `${deltaX}px`;
                break;
            case 'left':
                parent.style.left = `${deltaX * -1}px`;
                break;
        }

        // Prevent default behaviors & propagation.
        e.preventDefault();
    }
    const handleTouchEnd = e => {
        const touch_event = [...e.changedTouches].filter(t => t.identifier == touch.current)[0];
        const parent = e.target.parentElement;
        const endX = touch_event.clientX, endY = touch_event.clientY;
        const startX = touchStartX.current, startY = touchStartY.current;

        // Call External Handlers
        switch( getMovementDirection([startX, startY],[endX, endY]) ){
            case 'up':
                onSwipeUp();
                break;
            case 'right':
                onSwipeRight();
                break;
            case 'down':
                onSwipeDown();
                break;
            case 'left':
                onSwipeLeft();
                break;
        }

    }

    const getMovementDirection = (startCoords, endCoords) =>{

        const [startX, startY] = startCoords;
        const [endX, endY] = endCoords;

        // Calculate the change in the x and y coordinates.
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        if (Math.abs(deltaX) > Math.abs(deltaY)){
            // The X Axis has changed more than the Y Axis
            if (deltaX > 0){
                // mostly right
                return 'right'
            }
            else{
                // mostly left
                return 'left'
            }
        }
        else{
            // The Y Axis has changed more than the X Axis
            if (deltaY < 0){
                // mostly up
                return 'up'
            }
            else{
                //mostly down
                return 'down'
            }
        }
    }
    // Formatted Data

    return (
        <Box
            {...containerProps}
            ref={ButtonElement}
            sx={{
                ...containerProps.sx,
            }}
        >

        </Box>
    )
}

export default SwipeButton