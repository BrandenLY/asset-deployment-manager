import React, {
  useState,
  useContext,
} from "react";
import {
  Paper,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Edit, Save } from "@mui/icons-material";
import { backendApiContext } from "../context";
import ModelForm from "./ModelForm";
import { useModelOptions } from "../customHooks";
import { queryClient } from "../index"
import { useMutation } from "@tanstack/react-query";

// Primary Component

export const ShipmentDetailPanel = (props) => {

  const {shipment, shipmentId} = props;

  // State Hooks
  const shipmentOptions = useModelOptions('shipment');
  const { user, csrftoken } = useContext(backendApiContext);
  const [isEditing, setIsEditing] = useState(false);
  const [shipmentForm, setShipmentForm] = useState();

  // Mutations
  const { mutate } = useMutation({
    mutationFn: async data => {
        const updateUrl = new URL(
          `${window.location.protocol}${window.location.host}/api/${shipmentOptions.data.model}/${shipmentId}/`
        );
        const requestHeaders = new Headers();
        requestHeaders.set("Content-Type", "application/json");
        requestHeaders.set("X-CSRFToken", csrftoken);
      
        return fetch(updateUrl, {
          method: "PUT",
          headers: requestHeaders,
          body: JSON.stringify(data),
        });
      },
    onSettled: (res, error, variables) => {

      // Frontend mutation error
      if (error != undefined){
        props.addNotif({message: `Failed to update shipment: unknown error.`, severity:'error'})
        // KEEP THIS CONSOLE LOG IN DEBUG MODE.
        console.log(error);
        return;
      }

      // Backend mutation error
      if (!res.ok){
        // Improper POST/PUT data
        if (res.status == 400){
          props.addNotif({message: `Failed to update shipment: invalid data`, severity:'error'})
          setShipmentForm(previous =>{
            
            let newValue = {...previous};
            res.json().then(data => {
              Object.entries(data).forEach(([fieldName, fieldErrors], index) => {
                newValue[fieldName].errors = fieldErrors;
              })
            })
            
            return newValue;
          
          })
          return;
        }
      }

        props.addNotif({message:'Successfully updated shipment'});
        res.json().then(data => queryClient.setQueryData(['shipment', shipmentId], data))
    },
});

  // Helper Functions
  const toggleEditMode = ({ event }) => {
    setIsEditing(!isEditing);
  };

  // Updates 'shipmentForm' state values.
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

  // Clears form state, causing the form to reset and re-render.
  const resetForm = () => {
    setShipmentForm(undefined);
    setIsEditing(false);
  }

  // Save the shipment form data to the database.
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

    mutate(payload);
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
        <ListItemText primary="Details" primaryTypographyProps={{variant:"h5"}}/>
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