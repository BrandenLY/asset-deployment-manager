import React from "react";
import { Box } from "@mui/material";
import GenericDetailView from "../components/GenericDetailView";

const MODELNAME = 'equipmenthold';

const EquipmentHoldsDetailView = props => {

  return (
    <GenericDetailView
      {...props}
      model={MODELNAME}
      detailFormLayout={[
        ['id', null],
        ['quantity', null],
        ['model'],
        ['start_date', 'end_date'],
        ['event']
      ]}
    >

      {/* Model/Page specific content can be added here */}

    </GenericDetailView>

  )

}

export default EquipmentHoldsDetailView 