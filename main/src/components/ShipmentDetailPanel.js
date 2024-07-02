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
      if (fieldName){
        return {...previous}[fieldName] = data;
      }
      else{
        return data;
      }
    })
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
        {shipment && <ModelForm 
          modelOptions={shipmentOptions}
          formState={shipmentForm}
          onChange={updateShipment}
          initialValue={shipment}
          layout={[
            ['id', null],
            ['status', null],
            ['carrier'],
            ['origin', 'destination'],
            ['event'],
            ['departure_date', 'arrival_date']
          ]}
        />}
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
  const [sendBackShipment, setSendBackShipment] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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
    send_back_shipment:sendBackShipment, setSend_back_shipment:setSendBackShipment
  }

  // FIXME: It's 4am and I have no idea if I even have to do this but... i see no other choice.
  useEffect(() => {
    // test loading effect
    if (props.current){
      models.shipment.fields.forEach(field => {

        // Get State Value and Setter-Function names
        const setterVarName = `set${field.name[0].toUpperCase()}${field.name.slice(1, field.name.length)}`;
        const fieldNotNull = props.current[field.name] != null && props.current[field.name] != undefined

        // Set state variables for this field
        if (field.formatValue && fieldNotNull) {
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

        else if (fieldNotNull){
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

  const addFieldErrors = errors =>{
    setFieldErrors(current => ({...current, ...errors}));
  }

  // JSX
  return (
    <form className="shipment-detail-form">

      {models.shipment.fields.map(field => {

        const htmlInputId = `shipment-${field.name}`;
        const setterVarName = `set${field.name[0].toUpperCase()}${field.name.slice(1, field.name.length)}`;

        if (field.inputType == 'autoComplete' && field.related) {
          return (
            <CustomFormControl helpText={field.helpText} fieldError={fieldErrors[field.name]} id={htmlInputId}>
              <ModelAutoComplete
                value={stateMap[field.name]}
                field={field}
                isEditing={props.isEditing}
                inputId={htmlInputId}
                onChange={(e, v) => stateMap[setterVarName](v)}
                error={!!fieldErrors[field.name]}
              />
            </CustomFormControl>
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
            <CustomFormControl helpText={field.helpText} fieldError={fieldErrors[field.name]} id={htmlInputId}>
              <Autocomplete
                id={htmlInputId}
                options={dataOptions}
                disabled={field.readOnly ? true : !props.isEditing}
                renderInput={(params) => <TextField error={!!fieldErrors[field.name]} {...params} label={field.name} />}
                value={stateMap[field.name]}
                onChange={(e,v) => stateMap[setterVarName](v)}
              />  
            </CustomFormControl>
          )
        } else {
          return (
            <CustomFormControl helpText={field.helpText} fieldError={fieldErrors[field.name]} id={htmlInputId}>
              <>
                <InputLabel shrink variant="outlined" error={!!fieldErrors[field.name]}>
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
                  error={!!fieldErrors[field.name]}
                />
              </>
            </CustomFormControl>
          );
        }
      })}
      
      {props.isEditing && (
        <Box className="form-actions">
          <Button
            color="primary"
            variant="contained"
            onClick={() => props.updateShipment({model: models.shipment, data:
              parseStateToShipment(), addFieldErrors})}
          >
            Save
          </Button>
          <Button
            color="primary"
            onClick={() => {setFieldErrors({}); props.setIsEditing(false)}}
          >
            Reset
          </Button>
        </Box>
      )}

    </form>
  );
};

export const CustomFormControl = (props) => {
  
  return(
    <FormControl id={props.id}>

    {props.children}

    {!!props.helpText ? (
      <FormHelperText children={props.helpText} />
    ) : null}

    
    {!!props.fieldError ? (
      <FormHelperText children={props.fieldError} sx={{color:"error.main"}}/>
    ) : null}
    </FormControl>
  )
};