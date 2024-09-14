import { Box, useTheme } from '@mui/material';
import React, { useRef, useEffect } from 'react'

const SwipeButton = props => {
    const {
        onSwipeLeft=(()=>{}), 
        onSwipeRight=(()=>{}), 
        onSwipeUp=(()=>{}), 
        onSwipeDown=(()=>{}),
        onClick=(()=>{}),
        containerProps, 
        fullWidth=false
    } = props;
    
    // State Hooks
    const ButtonElement = useRef(null);
    const touch = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const theme = useTheme();
    // Register event listeners
    useEffect(() => {
        const element = ButtonElement.current;

        if (element){
            element.addEventListener('touchstart', handleTouchStart);
            element.addEventListener('touchmove', handleTouchMove);
            element.addEventListener('touchend', handleTouchEnd);
            element.addEventListener('click', onClick);
        }

        return(() => {
            // Cleanup Function
            if (element){
                element.removeEventListener('touchstart', handleTouchStart);
                element.removeEventListener('touchmove', handleTouchMove);
                element.removeEventListener('touchend', handleTouchEnd);
                element.removeEventListener('click', onClick);
            }
        })

    },[])

    // Custom Event Handlers
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

        // Calculate Movement Change
        const startX = touchStartX.current, startY = touchStartY.current;
        const newX = touch_event.clientX, newY = touch_event.clientY;
        const deltaX = startX - newX;

        // Drag animation
        const parent = e.target.parentElement;
        
        parent.style.position = 'relative';

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
        parent.style.position = 'static';
        parent.style.left = null;
        parent.style.right = null;

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
    let mode = null;
    let buttonRect = null;

    if( ButtonElement.current != null) {

        buttonRect = ButtonElement.current.getBoundingClientRect();

        if(buttonRect.width > buttonRect.height){
            mode = "horizontal"
        }else{
            mode = "vertical"
        }

    }   


    return (
        <Box
            {...containerProps}
            ref={ButtonElement}
            sx={{
                ...containerProps.sx,
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Box 
                bgcolor={theme.palette.common.black}
                width={ mode == 'horizontal' ? '66%' : theme.spacing(0.5)}
                height={ mode == 'vertical' ? '66%' : theme.spacing(0.5)}
                borderRadius={theme.spacing(0.25)}
                sx={{pointerEvents: 'none', opacity:"33%"}}
                boxShadow={theme.shadows[3]}
            >
            </Box>
        </Box>
    )
}

export default SwipeButton;