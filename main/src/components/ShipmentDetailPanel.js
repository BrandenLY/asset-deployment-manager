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
  Autocomplete
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
        <ShipmentDetailsForm isEditing={isEditing} setIsEditing={setIsEditing} updateShipment={props.updateShipment} current={props.shipment}/>
      </ListItem>

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
  const [precedingShipment, setPreceding_shipment] = useState(null);

  // FIXME: It's 4am and I have no idea if I even have to do this but... i see no other choice.
  const stateMap = { 
    id, setId,
    status, setStatus,
    carrier, setCarrier,
    origin, setOrigin,
    destination, setDestination,
    departure_date:departureDate, setDeparture_date:setDepartureDate,
    arrival_date:arrivalDate, setArrival_date:setArrivalDate,
    event, setEvent,
    preceding_shipment:precedingShipment, setPreceding_shipment:setPreceding_shipment
  }

  // FIXME: It's 4am and I have no idea if I even have to do this but... i see no other choice.
  useEffect(() => {
    // test loading effect
    if (props.current){
      models.shipment.fields.forEach(field => {

        // Get State Value and Setter-Function names
        const setterVarName = `set${field.name[0].toUpperCase()}${field.name.slice(1, field.name.length)}`;
        const fieldNotNull = !!props.current[field.name]

        // Set state variables for this field
        if (field.formatValue) {
          stateMap[setterVarName](
            field.formatValue(props.current[field.name])
          );
          return;
        }

        else if (field.related && fieldNotNull){
          
          const displayValue = models[field.related.modelName].getLabelName(props.current[field.name])

          stateMap[setterVarName]({
            ...props.current[field.name],
            label: displayValue
          });
          return;
        }

        else if (field.options && fieldNotNull){

          const displayValue = field.options[props.current[field.name]]

          stateMap[setterVarName]({
            id: props.current[field.name],
            label: displayValue
          })

        }

        else {
          stateMap[setterVarName](
            props.current[field.name]
          )
        }

      
      })


    }

  }, [props.current, props.isEditing])

  const parseStateToShipment = () => {
    let value = {id, status, carrier, origin, destination, departure_date:departureDate, arrival_date:arrivalDate, event, preceding_shipment:precedingShipment};

    models.shipment.fields.forEach( f => {
      // serialize values
      if (f.related || f.options){
        value[f.name] = stateMap[f.name]?.['id']
      }
      else if (f.inputType == 'date'){
        value[f.name] = new Date(stateMap[f.name])
      }
    })

    return value;
  }

  // JSX
  return (
    <form className="shipment-detail-form">

      {models.shipment.fields.map(field => {

        const htmlInputId = `shipment-${field.name}`;
        const setterVarName = `set${field.name[0].toUpperCase()}${field.name.slice(1, field.name.length)}`;

        if (field.inputType == 'autoComplete' && field.related) {
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
        } else if (field.inputType == 'autoComplete' && field.options) {

          const dataOptions = field.options.map(
            optionValue => {
              return({
                id: field.options.indexOf(optionValue),
                label: optionValue
              })
            }
          )

          return(
            <FormControl id={htmlInputId}>
              <Autocomplete
                id={htmlInputId}
                options={dataOptions}
                disabled={field.readOnly ? true : !props.isEditing}
                renderInput={(params) => <TextField {...params} label={field.name} />}
                value={stateMap[field.name]}
                onChange={(e,v) => stateMap[setterVarName](v)}
              />

              {!!field.helpText ? (
                <FormHelperText children={field.helpText} />
              ) : null}
            </FormControl>
          )
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
      
      {props.isEditing && (
        <Box className="form-actions">
          <Button
            color="primary"
            variant="contained"
            onClick={() => props.updateShipment({model: models.shipment, data:
              parseStateToShipment()})}
          >
            Save
          </Button>
          <Button
            color="primary"
            onClick={() => props.setIsEditing(false)}
          >
            Reset
          </Button>
        </Box>
      )}

    </form>
  );
};