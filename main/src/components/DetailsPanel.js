import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react'
import { useCurrentUser, useModelOptions } from '../customHooks';
import { getCookie } from '../context';
import { Button, Collapse, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Edit, Save } from '@mui/icons-material';
import ModelForm from './ModelForm';
import SwipeButton from './SwipeButton';

const DetailsPanel = props => {

    // Props
    const {model, data, formLayout} = props;

    // Hooks
    const queryClient = useQueryClient();
    const modelOptions = useModelOptions(model);
    const userDeviceIsMobile = useMediaQuery("(max-width:1010px)");
    const user = useCurrentUser();
    const theme = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [objForm, setObjForm] = useState();

    const formContainer = useRef(null);

    const { mutate } = useMutation({
        mutationFn: async data => {
            const updateUrl = new URL(
                `${window.location.protocol}${window.location.host}/api/${model}/${data.id}/`
            );
            const requestHeaders = new Headers();
            requestHeaders.set("Content-Type", "application/json");
            requestHeaders.set("X-CSRFToken", getCookie("csrftoken"));

            return fetch(updateUrl, {
                method: "PUT",
                headers: requestHeaders,
                body: JSON.stringify(data),
              });
        },
        onSettled: (res, error, vars) => {

            // Frontend mutation error
            if (error != undefined){
              props.addNotif({message: `Failed to update ${model}: unknown error.`, severity:'error'})
              // KEEP THIS CONSOLE LOG IN DEBUG MODE.
              console.log(error);
              return;
            }
      
            // Backend mutation error
            if (!res.ok){
              // Improper POST/PUT data
              if (res.status == 400){
                props.addNotif({message: `Failed to update ${model}: invalid data`, severity:'error'})
                
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
      
              props.addNotif({message:`Successfully updated ${model}`});
              res.json().then(data => {
                queryClient.invalidateQueries({queryKey:[model, obj.id]})
              })
        }
    })

    // Callback Functions
    const toggleEditMode = e => {
        setIsEditing(!isEditing);
    };

    const updateForm = (_, data, fieldName=null) => {
        setObjForm( prev => {
            let tmp = {...prev};

            if(fieldName == null){
                // Expecting a fully formed state data
                tmp = data;
            }
            else{
                // Expecting a partial update to the form state data
                tmp[fieldName].current = data;
            }

            return tmp;
        });
    }

    const resetForm = () => {

    }

    const saveModel = () => {
        let payload = {};

    }

    const collapseSelf = () => {
        setIsCollapsed(true);
    }

    const expandSelf = () => {
        setIsCollapsed(false);
    }

    // Formatted Data
    
    const userCanModify = user.data?.user_permissions?.find( p => p.codename == `change_${model}`);

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
        <Collapse in={!isCollapsed} orientation="horizontal">
          <Paper elevation={2} ref={formContainer} sx={{minHeight:"100%"}}>
            <List sx={{padding: 1, display: "flex", flexDirection:"column", minHeight:"100%", height:"100%"}} dense>

              <ListItem
                secondaryAction={userCanModify ? (
                  <IconButton size="small" onClick={toggleEditMode}>
                    <Edit />
                  </IconButton>
                ) : null}
                sx={{marginBottom:1}}
              >
                <ListItemText primary="Details" primaryTypographyProps={{variant:"h4"}}/>
              </ListItem>

              <Divider sx={{borderBottomWidth: "3px", marginBottom: theme.spacing(1)}} flexItem />

              <ListItem sx={{flexGrow: 1, alignItems:"flex-start"}} disableGutters>

                { data && // Wait for data to load before displaying the Model Form Component
                  <ModelForm 
                    disabled={!isEditing}
                    formState={objForm}
                    initialValue={data}
                    onChange={updateForm}
                    modelOptions={modelOptions}
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
        </Collapse>
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