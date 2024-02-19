import React from 'react'
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from '@mui/material'

export const PageNotFound = () => {
  const navigate = useNavigate()
  return (
    <Box className="NotFoundPage">
        <Typography sx={{fontSize:75}}>ERR 404</Typography>
        <Typography sx={{fontSize:100}}>{"(סּ︵סּ)"}</Typography>
        <Typography sx={{fontSize:25}}>Page not found</Typography>
        <Button onClick={e => navigate("/")}>Return Home</Button>
    </Box>
  )
}
