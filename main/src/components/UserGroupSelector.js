import { CheckBox, Loop } from "@mui/icons-material";
import { Box, Button, Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper } from "@mui/material";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect } from "react";

const UserGroupSelector = (props) => {

    // Props Destructuring
    const { 
        userFormDetails,
        onSelect = () => {},
        onDeselect = () => {}
    } = props;

    // Queries
    const groups = useInfiniteQuery({queryKey:['group']});

    // Effects
    useEffect(() => { // Load all groups
        
        if(groups.isFetching){
            return;
        }
        
        if(!groups.hasNextPage){
            return;
        }

        groups.fetchNextPage();

    }, [groups.isFetching, groups.hasNextPage]);

    // Callback Functions
    const toggleUserGroup = useCallback(groupId => {

        if (userFormDetails.groups.current.includes(groupId)){
            onDeselect(groupId);
        }
        else{
            onSelect(groupId);
        }

    }, []);

    // Formatted Data
    const allLoadedGroups = groups.data?.pages.map(p => p.results).flat();

    // Render
    return(
        <Box>
            <List>
                
                { (groups.isInitialLoading || groups.hasNextPage) && // Display Loading State
                    <ListItem disablePadding>
                        <ListItemIcon><Loop sx={{animationName:'rotate'}}/></ListItemIcon>
                        <ListItemText primary="Loading"/>
                    </ListItem>
                }

                { groups.isSuccess && // Display Groups

                    allLoadedGroups.map( group => (
                        <ListItem key={group.id} disablePadding>
                            <ListItemButton onClick={() => toggleUserGroup(group.id)} dense>
                                <ListItemIcon>
                                    <Checkbox 
                                        edge="start"
                                        checked={userFormDetails.groups.current.includes(group.id)}
                                        tabIndex={-1} // Prevent this element from being directly targeted.
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText primary={group.label} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }

            </List>
        </Box>
    );
};

export default UserGroupSelector;
