import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { useBackend } from "./customHooks";

const serviceContext = createContext(null);


export const ServiceContextProvider = ({children}) => {
    const [services, setServices] = useState([]);
    const {data, isLoading} = useBackend("service");

    useEffect(() => {
        if (!isLoading){
            setServices(data.results);
        }
    }, [isLoading]);

    return(
        <serviceContext.Provider value={services}>
            {children}
        </serviceContext.Provider>
    )
}