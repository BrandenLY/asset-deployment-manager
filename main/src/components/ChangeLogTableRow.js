import { useQueries, useQuery } from '@tanstack/react-query';
import React, {useRef, useState, useEffect} from 'react'
import { useModelOptions } from '../customHooks';
import { TableRow, TableCell, Typography, Link, Skeleton} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { NavLink as RouterLink } from 'react-router-dom';

const ChangeLogTableRow = props => {

    // Props
    const {data, columns, actions, modelName, objectContentType} = props;
    
    // Hooks
    const [user, setUser] = useState(null);
    const modelOptions = useModelOptions(modelName);
    const fieldOptions = modelOptions.data?.model_fields;
    const queriesOrdering = useRef();
    
    queriesOrdering.current = [];

    // Queries
    const changelogUser = useQuery({
        queryKey: ["user", data.user_id]
    })

    const queries = useQueries({
        queries: modelOptions.isFetched ?
            columns.filter(columnName => {
                if (fieldOptions[columnName]?.type == 'related object'){
                    return true
                }
            }).map(columnName => {
                queriesOrdering.current.push(columnName)

                return ({
                    queryKey:[fieldOptions[columnName].related_model_name, data[columnName]],
                    enabled: !!fieldOptions
                })
            })
        :
            [] // If shipment options haven't loaded, an empty array will be returned instead.
    });

    // Callback Functions
    const getDisplayValue = (column) =>{

        if(column == 'action'){
            // Override specifically for log entries to display an icon
            switch(data["action_flag"]){
                case 1:
                    return(<Add color="success"/>)
                case 2:
                    return(<Edit color="warning"/>)
                case 3:
                    return(<Delete color="error"/>)
                default:
                    return null
            }
        }

        if(column == 'user'){
            // Override specifically for log entries as they do not have a 'user' property, rather they have only a 'user_id' property.
            return user?.email;
        }

        if(column == 'change_message'){
            // Override specifically for log entries. This simply formats the 'change_message' property of the log entry
            
            const changeActionText = Object.keys(JSON.parse(data["change_message"])[0])[0]
            const changeActionBody = Object.values(JSON.parse(data["change_message"])[0])[0]
            
            switch(changeActionText){
                case 'added':
                    return(`created ${objectContentType}`)
                
                case 'changed':
                    return(`modified ${objectContentType} field(s) '${changeActionBody["fields"].join(', ')}.'`)
            }
        }

        const columnOptions = modelOptions.data?.model_fields[column];

        switch(columnOptions.type){
            case 'datetime':
                return (new Date(data[column])).toLocaleTimeString(undefined, { year: 'numeric', month: 'short', day: '2-digit'});
            case 'choice':
                return columnOptions.choices.find(o => o.value == data[column]).display_name
            default:
                return new String(data[column]);
        }
    }

    const triggerAction = (actionText, event) => {
        actions[actionText].callbackFn(data, event);
    }
    
    // Side Effects
    useEffect(() =>{
        if (!changelogUser.isFetching && changelogUser.isSuccess){
            setUser(changelogUser.data);
        }
    }, [changelogUser.isFetching, changelogUser.isSuccess])


    // Formatted Data
    return (
        <TableRow key={data.id}>
            {columns.map(c => {
                return(
                    <TableCell sx={{paddingTop:0.5, paddingBottom: 0.5}}>
                        <Typography variant="body2" noWrap>
                        { c == 'id' ?
                            <Link component={RouterLink} to={`/${modelName}s/${data.id}/`}>
                                { !!fieldOptions ? getDisplayValue(c) : null }
                            </Link>
                        :
                            !!fieldOptions ? getDisplayValue(c) : <Skeleton variant="text"/>
                        }
                        </Typography>
                    </TableCell>
                )
            })}

            {   actions ? 
                <TableCell sx={{paddingTop:0.5, paddingBottom: 0.5}}>
                    <Typography variant="body2">
                        <Stack direction="row">
                           { Object.keys(actions).map(actionKey => <ActionButton actionObject={actions[actionKey]} actionText={actionKey} callbackFn={triggerAction}/>) }
                        </Stack>
                    </Typography>
                </TableCell> : 
                null
            }
        </TableRow>
    )

}

export default ChangeLogTableRow