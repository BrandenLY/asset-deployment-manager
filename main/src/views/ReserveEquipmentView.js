import { Box } from '@mui/material'
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'
import ReserveTool from '../components/ReserveTool';

const ReserveEquipmentView = props => {

  return (
     <Box id="ReserveEquipmentView">
      <ReserveTool />
     </Box>
  )

}

export default ReserveEquipmentView