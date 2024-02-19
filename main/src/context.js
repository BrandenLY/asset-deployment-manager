import React from 'react';
import { createContext, useContext, useState } from "react";
import { useBackend } from "./customHooks";
import { useQuery } from '@tanstack/react-query';

// Helper Functions
const getCookie = (name) => {
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
                {name: 'preceding_shipment', inputType: 'autoComplete', related: {modelName:'shipment', returnPropertyName: 'id'}},
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
    const { data:authUser, isLoading:isLoadingAuthUser } = useQuery({
        queryKey: ['current-user']
    });

    return (
        <backendApiContext.Provider value={{baseUrl:baseUrl, csrftoken:csrftoken, user:authUser, models:models }}>
            {children} 
        </backendApiContext.Provider>
    )
}