import React, { useRef } from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import { useBackend } from "./customHooks";
import { useQuery } from '@tanstack/react-query';

// Helper Functions
export const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const toHtmlInputDate = date => {
    const _date = new Date(date);
    return `${_date.getFullYear()}-${String(_date.getMonth() + 1).padStart(2, '0')}-${String(_date.getDate()).padStart(2, '0')}`
}

// Context & Provider Component Definitions
export const backendApiContext = createContext(null);
export const BackendContextProvider = ({children}) => {

    const baseUrl = `${window.location.protocol}${window.location.host}/api`;
    const csrftoken = getCookie('csrftoken');
    const models = {
        shipment : {
            modelName: 'shipment',
            getLabelName : (obj) => `Shipment ${obj.id} to ${obj.destination}`,

            fields:[
                {name: 'id', inputType: 'number', readOnly:true},
                {name: 'status', inputType: 'autoComplete', options: ["Scheduled", "Packed", "In Transit", "Delivered", "Canceled"]},
                {name: 'carrier', inputType: 'text'},
                {name: 'origin', inputType: 'autoComplete', related: {modelName:'location', returnPropertyName: 'id'}},
                {name: 'destination', inputType: 'autoComplete', related: {modelName:'location', returnPropertyName: 'id'}},
                {name: 'departure_date', inputType: 'date', formatValue: toHtmlInputDate },
                {name: 'arrival_date', inputType: 'date', formatValue: toHtmlInputDate },
                {name: 'event', inputType: 'autoComplete', related: {modelName:'event', returnPropertyName: 'id'}},
                {name: 'send_back_shipment', inputType: 'autoComplete', related: {modelName:'shipment', returnPropertyName: 'id'}},
            ],

            meta: {
                statuses : {
                    0:"Scheduled", 
                    1:"Packed", 
                    2:"In Transit", 
                    3:"Delivered",
                    4:"Canceled"
                }
            },
        },
        event : {
            modelName: 'event',
            getLabelName: (obj) => `[ ${obj.project.production_show_code} ] ${obj.name}`,
        },
        location : {
            modelName: 'location',
            getLabelName: (obj) => `${obj.address_line_1}, ${obj.city}, ${obj.state} ${obj.zipcode}`,
        }
    }
    const { data:authUser, isLoading:isLoadingAuthUser, isSuccess:isSuccessAuthUser, isFetching } = useQuery({
        queryKey: ['current-user']
    });

    useEffect(() => {
        if (!isLoadingAuthUser && isSuccessAuthUser) {

            const has_perm = function(codename) {
                const _hasPermission = this.data.user_permissions.find( perm => perm.codename == codename );
                if(_hasPermission){
                    return true;
                }

                return false;
            }

            authUser.hasPerm = has_perm;
        }

    }, [isLoadingAuthUser, isSuccessAuthUser, isFetching])

    // Formatted Data
    
    return (
        <backendApiContext.Provider value={{baseUrl:baseUrl, csrftoken:csrftoken, user:authUser, models:models }}>
            {children} 
        </backendApiContext.Provider>
    )
}

export const sessionContext = createContext(null);
export const SessionContextProvider = props => {
    
    // PROPS DESTRUCTURING
    const {children} = props;
    
    // HOOKS

    // FORMATTED DATA
    let api = {
        baseUrl: `${window.location.protocol}${window.location.host}/api`,
        models: null,
    }
    
    let auth = {
        user: null,
        csrfToken: getCookie('csrftoken')
    }

    let ctx = {api, auth};

    return(
        <sessionContext.Provider value={ctx}>
            {children}
        </sessionContext.Provider>
    )
}

const NotificationDisplayTimeInSeconds = 2;

export const notificationContext = createContext(null);
export const NotificationContextProvider = props => {
    
    // PROPS DESTRUCTURING
    const {children} = props;

    // HOOKS
    const [onScreenNotification, setOnScreenNotification] = useState(null);
    const notificationQueue = useRef([]);

    // EFFECTS
    useEffect(() => {
        if(onScreenNotification == null && notificationQueue.current.length > 0){
            let newNotif = notificationQueue.current.pop();
            setOnScreenNotification(newNotif);
        }
    }, [onScreenNotification])

    // CALLBACK FUNCTIONS
    const addNotification = notifObject => {

        if(onScreenNotification == null){
            // Update state directly
            setOnScreenNotification(notifObject)
        }
        else{
            // Update notification queue
            let notifs = [...notificationQueue.current];
            notifs.push(notifObject);
    
            notificationQueue.current = notifs;
        }

    }

    const clearOnScreenNotification = e => {
        setOnScreenNotification(null);
    }

    const clearAllNotifications = e => {
        notificationQueue.current = [];
        setOnScreenNotification(null);
    }

    // Formatted Data
    const value = {
        add: addNotification,
        close: clearOnScreenNotification,
        clear: clearAllNotifications,
        active: onScreenNotification,
        displayDuration: NotificationDisplayTimeInSeconds * 1000
    }

    return(
        <notificationContext.Provider value={value}>
            {children}
        </notificationContext.Provider>
    )
}