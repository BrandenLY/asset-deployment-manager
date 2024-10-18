import { Box } from '@mui/material'
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'

const ReserveEquipmentView = props => {

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const equipmentHolds = useQuery({
        queryKey: ['equipmenthold']
    });


  return (
     <Box id="reserve-equipment">

     </Box>
  )
}

export default ReserveEquipmentView