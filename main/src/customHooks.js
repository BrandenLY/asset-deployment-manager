import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const apiBaseUrl = "http://127.0.0.1:8000/api/";

export const useEvents = (id = null) => {
    const formattedUrl = `${apiBaseUrl}event/${id ? id + "/": ""}`
    return useQuery({
        queryKey : (id ? id : 'events'),
        queryFn : async () => {
            const data = await fetch(formattedUrl);
            return data.json();
        },
    });
}

export const useUsers = (id=null) => {
    const formattedUrl = `${apiBaseUrl}user/${id ? id + "/": ""}`
    return useQuery({
        queryKey : (id ? id : 'users'),
        queryFn : async () => {
            const data = await fetch(formattedUrl);
            return data.json();
        },
    });
}

export const useBackend = (model, id=null) => {
    const formattedUrl = new URL(`${apiBaseUrl}${model}/${id ? id + "/": ""}`);
    return useQuery({
        queryKey : [model, id],
        queryFn : async () => {
            const data = await fetch(formattedUrl);
            return data.json();
        }
    })
}