import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useCurrentUser, useModelOptions, usePermissionCheck } from '../customHooks';
import { backendApiContext, getCookie, notificationContext } from '../context';
import { Box, Button, Collapse, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Edit, InfoOutlined, Save } from '@mui/icons-material';
import ModelForm from './ModelForm';
import SwipeButton from './SwipeButton';

const DetailsPanel = props => {

    // Props
    const {model, query, data, formLayout} = props;

    // Hooks
    const theme = useTheme();
    const queryClient = useQueryClient();
    const modelOptions = useModelOptions(model);
    const backend = useContext(backendApiContext);
    const {check:checkUserPermission} = usePermissionCheck(backend.auth.user);
    const notifications = useContext(notificationContext);
    const userDeviceIsMobile = useMediaQuery("(max-width:1010px)");

    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [objForm, setObjForm] = useState();

    const formContainer = useRef(null);

    // Mutations
    const { mutate } = useMutation({
        mutationFn: async (payload, method="PUT") => {
            const updateUrl = new URL(`${backend.api.baseUrl}/${model}/${data.id}/`);
            const requestHeaders = backend.api.getRequestHeaders(updateUrl);

            return fetch(updateUrl, {
                method: method,
                headers: requestHeaders,
                body: JSON.stringify({...payload}),
              });

        },
        onSettled: (res, error, vars) => {

            // Frontend mutation error
            if (error){
              notifications.add({message: `Failed to update ${model}: unknown error.`, severity:'error'})
              return;
            }
      
            // Backend mutation error
            if (!res.ok){
              // Improper POST/PUT data
              if (res.status == 400){
                notifications.add({message: `Failed to update ${model}: invalid data`, severity:'error'})
                
                setObjForm( previous => {
                  let newValue = {...previous};

                  res
                  .json()
                  .then( data => {
                    Object.entries(data).forEach(([fieldName, fieldErrors], _) => {
                      newValue[fieldName].errors = fieldErrors;
                    })
                  })
                  
                  return newValue;
                
                })

                return;
              }
            }
      
              notifications.add({message:`Successfully updated ${model}`});
              res.json().then(resData => {
                query.refetch();
                setIsEditing(false);
              })
        }
    })

    // Effects
    useEffect(() => {
      if (!modelOptions.data || !data) {
          return;
      }
  
      let tmp = {};
  
      console.log("updating detail form state");
  
      Object.entries(modelOptions.data.model_fields).forEach(([fieldName, fieldDetails]) => {
          tmp[fieldName] = { ...fieldDetails, errors: [], current: data[fieldName] };
      });
  
      setObjForm(tmp);
    }, [data, modelOptions.data]);

    // Callback Functions
    const toggleEditMode = e => {
        setIsEditing(!isEditing);
    };

    const updateForm = (_, fieldName, value) => {

        setObjForm( prev => {

            let tmp = {...prev};
            tmp[fieldName].current = value;
            return tmp;

        });
    }

    const resetForm = () => {
      setObjForm(undefined);
      setIsEditing(false);
    }

    const saveModel = () => {
        let payload = {};
        
        Object.entries(objForm).forEach( ([fieldName, fieldDetails]) => {
          
          // Readonly fields cannot be saved.
          if (fieldDetails.read_only){
            return;
          }

          // Ignore undefined fields
          if (fieldDetails.current === undefined){
            return;
          }

          // Set null fields
          if (fieldDetails.current === null){
            payload[fieldName] = null;
            return;
          }

          const formFields = formLayout.flat();
          if (!formFields.includes(fieldName)){
            return;
          }

          // Format data before sending to backend.
          switch(fieldDetails.type){
            case 'field':
              
              if (fieldDetails.child?.type == 'related objects'){
                payload[fieldName] = fieldDetails.current;
                return;
              }
              
              payload[fieldName] = new String(fieldDetails.current);
              return;
              
            case 'boolean':
              payload[fieldName] = new Boolean(fieldDetails.current);
              return;
            case 'string':
              payload[fieldName] = new String(fieldDetails.current);
              return;
            case 'url':
              payload[fieldName] = new URL(fieldDetails.current);
              return;
            case 'regex':
              payload[fieldName] = new String(fieldDetails.current);
              return;
            case 'slug':
              payload[fieldName] = new String(fieldDetails.current);
              return;
            case 'time':
              payload[fieldName] = new Date(fieldDetails.current);
              return;
            case 'related object':
              payload[fieldName] = fieldDetails.current.id;
              return;
            default:
              payload[fieldName] = fieldDetails.current;
              return;
          }
        })

        mutate(payload);
    }

    const collapseSelf = () => {
        setIsCollapsed(true);
    }

    const expandSelf = () => {
        setIsCollapsed(false);
    }

    // Formatted Data
    const userCanModify = checkUserPermission(`change_${model}`);

    return (
      <Paper className={`${model}DetailPanel`}
        sx={{ 
          display:"flex",
          alignItems: "stretch",
          flexGrow: isCollapsed ? 0 : 1,
          maxWidth: userDeviceIsMobile ? 'none' : "340px",
          minHeight: "70vh",
          margin: `${theme.spacing(1)} 0`,
        }}
      >
          <Paper elevation={2} ref={formContainer} sx={{minHeight:"100%", flexGrow:1, display: isCollapsed ? 'none' : 'auto'}}>
            <List sx={{padding: 1, display: "flex", flexDirection:"column", minHeight:"100%", height:"100%"}} dense>

              <ListItem
                secondaryAction={userCanModify ? (
                  <IconButton size="small" onClick={toggleEditMode}>
                    <Edit />
                  </IconButton>
                ) : null}
                sx={{marginBottom:1}}
              >

                <ListItemText 
                  primary={<Box display="flex" alignItems="center" gap={1}><InfoOutlined fontSize="large"/>Details</Box>}
                  primaryTypographyProps={{variant:"h5"}}
                />

              </ListItem>

              <Divider sx={{borderBottomWidth: "3px", marginBottom: theme.spacing(1)}} flexItem />

              <ListItem sx={{flexGrow: 1, alignItems:"flex-start"}} disableGutters>

                { objForm && // Wait for data to load before displaying the Model Form Component
                  <ModelForm
                    index={0}
                    model={model} 
                    disabled={!isEditing}
                    formState={objForm}
                    onChange={updateForm}
                    layout={formLayout ? formLayout : undefined}
                  />
                }

              </ListItem>

              {isEditing && 
                <ListItem sx={{position: 'relative', bottom:0, justifyContent: 'center', gap:2}}>
                    <Button variant="text" onClick={resetForm}>Reset</Button>
                    <Button variant="contained" startIcon={<Save/>} onClick={saveModel}>Save</Button>
                </ListItem>
              }

            </List>
          </Paper>
        <SwipeButton 
          containerProps={{sx:{minWidth: "24px"}}}
          onSwipeLeft={collapseSelf}
          onSwipeRight={expandSelf}
          onClick={() => {setIsCollapsed(prev => !prev)}}
        />
      </Paper>
    )
}

export default DetailsPanel