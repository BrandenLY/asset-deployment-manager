import React, {
  useState,
  useEffect,
  useContext,
} from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Divider,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { backendApiContext } from "../context";
import { ModelAutoComplete } from "./ModelAutoComplete";

// Primary Component

export const ShipmentDetailPanel = (props) => {

  // State Hooks
  const { user, models } = useContext(backendApiContext);
  const [isEditing, setIsEditing] = useState(false);

  // Helper Functions
  const toggleEditMode = ({ event }) => {
    setIsEditing(!isEditing);
  };

  return (
    <Paper>
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
        <ShipmentDetailsForm isEditing={isEditing} current={props.shipment}/>
      </ListItem>

      {isEditing && (
        <ListItem sx={{ justifyContent: "center"}}>
          <Button
            color="primary"
            variant="contained"
            onClick={props.setShipment
            }
          >
            Save
          </Button>
        </ListItem>
      )}
      </List>
    </Paper>
  );
};

export const ShipmentDetailsForm = (props) => {
  // State Hooks
  const { user, models } = useContext(backendApiContext);

  const [id, setId] = useState(props.current?.id);
  const [status, setStatus] = useState(0);
  const [carrier, setCarrier] = useState("");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(null);
  const [event, setEvent] = useState(null);

  // FIXME: It's 4am and I have no idea if I even have to do this but... i see no other choice.
  const stateMap = { 
    id, setId,
    status, setStatus,
    carrier, setCarrier,
    origin, setOrigin,
    destination, setDestination,
    departure_date:departureDate, setDeparture_date:setDepartureDate,
    arrival_date:arrivalDate, setArrival_date:setArrivalDate,
    event, setEvent
  }

  // FIXME: It's 4am and I have no idea if I even have to do this but... i see no other choice.
  useEffect(() => {
    // test loading effect
    if (props.current){
      
      models.shipment.fields.forEach(field => {

        // Get State Value and Setter-Function names
        const valueVarName = field.name;
        const setterVarName = `set${field.name[0].toUpperCase()}${field.name.slice(1, field.name.length)}`;
        
        // Set state variables for this field
        if (field.formatValue) {
          console.log(field.formatValue(props.current[valueVarName]))
          stateMap[setterVarName](
            field.formatValue(props.current[valueVarName])
          );
          return;
        }

        else if (field.related){
          
          const displayValue = models[field.related.modelName].getLabelName(props.current[valueVarName])

          console.log({
            ...props.current[valueVarName],
            label: displayValue
          });
          stateMap[setterVarName]({
            ...props.current[valueVarName],
            label: displayValue
          });
          return;
        }

        else {
          stateMap[setterVarName](
            props.current[valueVarName]
          )
        }

      
      })


    }

  }, [props.current])

  // JSX
  return (
    <form className="shipment-detail-form">
      {models.shipment.fields.map(field => {
        const htmlInputId = `shipment-${field.name}`;
        const valueVarName = field.name;
        const setterVarName = `set${field.name[0].toUpperCase()}${field.name.slice(1, field.name.length)}`;

        if (field.inputType == 'autoComplete') {
          return (
            <FormControl id={htmlInputId}>
              <ModelAutoComplete
                value={stateMap[field.name]}
                field={field}
                isEditing={props.isEditing}
                inputId={htmlInputId}
                onChange={(e, v) => stateMap[setterVarName](v)}
              />

              {!!field.helpText ? (
                <FormHelperText children={field.helpText} />
              ) : null}
            </FormControl>
          );
        } else {
          return (
            <FormControl id={htmlInputId}>
              <InputLabel shrink variant="outlined">
                {field.name}
              </InputLabel>

              <OutlinedInput
                id={htmlInputId}
                type={field.inputType}
                disabled={field.readOnly ? true : !props.isEditing}
                value={stateMap[field.name]}
                label={field.name}
                notched={true}
                onChange={(e, v) => stateMap[setterVarName](e.target.value)}
              />

              {!!field.helpText ? (
                <FormHelperText children={field.helpText} />
              ) : null}
            </FormControl>
          );
        }
      })}
    </form>
  );
};