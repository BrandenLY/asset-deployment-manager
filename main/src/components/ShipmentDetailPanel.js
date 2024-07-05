import React, {
  useState,
  useEffect,
  useContext,
} from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Divider,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
  Container
} from "@mui/material";
import { Edit, Save } from "@mui/icons-material";
import { backendApiContext } from "../context";
import { ModelAutoComplete } from "./ModelAutoComplete";
import ModelForm from "./ModelForm";
import { useModelOptions } from "../customHooks";

// Primary Component

export const ShipmentDetailPanel = (props) => {

  const {shipment, updateShipment:externalUpdateShipmentFn} = props;

  // State Hooks
  const shipmentOptions = useModelOptions('shipment');
  const { user } = useContext(backendApiContext);
  const [isEditing, setIsEditing] = useState(false);
  const [shipmentForm, setShipmentForm] = useState();

  // Helper Functions
  const toggleEditMode = ({ event }) => {
    setIsEditing(!isEditing);
  };

  const updateShipment = (_index, data, fieldName=null) => {

    setShipmentForm(previous => {
      
      let tmp = {...previous};

      if (fieldName == null){
        // Expecting a fully formed form state object
        tmp = data;
      }

      else{
        // Expecting a partial update to the form state object
        tmp[fieldName].current = data;
      }

      return tmp;
    });

  }

  const resetForm = () => {
    setShipmentForm(undefined);
  }

  const saveShipment = () => {
    let payload = {};

    Object.entries(shipmentForm).forEach(([fieldName, data]) => {
      
      // Empty values can be ignored
      if(data.current == null){
        return null;
      }

      // Certain data types will need to be handled differently
      switch(data.type){

        case 'computed value':
          return;

        case 'related object':
          return payload[fieldName] = data.current.id;

        case 'choice':
          return payload[fieldName] = data.current.value;

      }

      // Other data types can be saved directly
      return payload[fieldName] = data.current;

    });

    externalUpdateShipmentFn(payload);
  }

  return (
    <Paper className="ShipmentDetailsColumn">
    <List className="ShipmentDetailsColumn" sx={{padding: 1, height: "100%"}} dense>

      <ListItem
        secondaryAction={user?.is_staff && (
          <IconButton size="small" onClick={toggleEditMode}>
            <Edit />
          </IconButton>
        )}
        disableGutters
      >
        <ListItemText primary="Edit Details" primaryTypographyProps={{variant:"formHeader"}}/>
      </ListItem>

      <Divider flexItem />

      <ListItem sx={{flexGrow: 1, alignItems:"flex-start"}} disableGutters>

        { shipment && // Wait for shipment to load before displaying the Model Form Component
          <ModelForm 
            disabled={!isEditing}
            formState={shipmentForm}
            initialValue={shipment}
            onChange={updateShipment}
            modelOptions={shipmentOptions}
            layout={[
              ['id', null],
              ['status'],
              ['carrier'],
              ['origin'],
              ['destination'],
              ['event'],
              ['departure_date', 'arrival_date']
            ]}
          />
        }

      </ListItem>
      {isEditing && 
        <ListItem sx={{position: 'relative', bottom:0, justifyContent: 'center', gap:2}}>
            <Button variant="text" onClick={resetForm}>Reset</Button>
            <Button variant="contained" startIcon={<Save/>} onClick={saveShipment}>Save</Button>
        </ListItem>
      }
      </List>
    </Paper>
  );
};