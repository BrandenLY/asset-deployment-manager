import React, { useCallback, useRef } from 'react';
import { createContext, useState, useEffect } from "react";
import { useCurrentUser } from './customHooks';

// Constants
const NotificationDisplayTimeInSeconds = 2;

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

// Context, and Provider Component Definitions
export const backendApiContext = createContext(null);
export const BackendContextProvider = ({children}) => {

    // Hooks
    const authenticatedUser = useCurrentUser();
    
    // Formatted Data
    let auth = {
        csrfToken: getCookie('csrftoken'),
        user: authenticatedUser ? authenticatedUser : null,
    }

    let api = {
        baseUrl : `${window.location.protocol}${window.location.host}/api`
    };
    
    let value = {
        api: api,
        auth: auth
    }

    // Callback Functions
    const getRequestHeaders = useCallback(() => {
        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("X-CSRFToken", auth.csrfToken);

        return headers;
    }, );
    api['getRequestHeaders'] = getRequestHeaders;

    return (
        <backendApiContext.Provider value={value}>
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