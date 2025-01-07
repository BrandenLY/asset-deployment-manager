import React from 'react'
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from '@mui/material'
import { Help } from '@mui/icons-material';

const PageNotFound = () => {
  const navigate = useNavigate()

  return (
    <Box
    sx={{height:"100%", display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", gap:2, marginY:"auto"}}>
        <Box>
            <Typography sx={{fontSize:100, lineHeight:"100px", textAlign:"center"}}><Help sx={{fontSize: 'inherit'}}/></Typography>
            <Typography sx={{fontSize:70}}>OOPS</Typography>
        </Box>
        <Typography sx={{fontSize:25}}>Page not found.</Typography>
        <Button onClick={e => navigate("/")}>Return Home</Button>
    </Box>
  )
}

export default PageNotFound