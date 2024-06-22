import React, { useEffect } from 'react'
import { useModelOptions, useModelFormFields } from "../customHooks";
import { Grid } from '@mui/material';

const CreateShipmentForm = props => {
  
  const { onChange:externalOnChange, initialValue, key } = props;
  const shipmentOptions = useModelOptions('shipment');

  const formFields = useModelFormFields({modelOptions:shipmentOptions, excludeReadOnly:true});

  useEffect(() => {
    // console.log(formFields);
  })

  return (
    <Grid container spacing={2} sx={{padding:1}}>

      <Grid item xs={3}>{formFields.fields["id"]?.inputComponent}</Grid>

      <Grid item xs={6}>{formFields.fields["departure_date"]?.inputComponent}</Grid>
      <Grid item xs={6}>{formFields.fields["arrival_date"]?.inputComponent}</Grid>
      
      <Grid item xs={12}>{formFields.fields["carrier"]?.inputComponent}</Grid>

      <Grid item xs={6}>{formFields.fields["origin"]?.inputComponent}</Grid>
      <Grid item xs={6}>{formFields.fields["destination"]?.inputComponent}</Grid>

      <Grid item xs={6}>{formFields.fields["status"]?.inputComponent}</Grid>

    </Grid>
  )
}

export default CreateShipmentForm