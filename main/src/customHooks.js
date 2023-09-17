import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";

const apiBaseUrl = "http://127.0.0.1:8000/api/";

export const useBackend = ({model, id=null, makeInfinate=false}={}) => {
    const formattedUrl = new URL(`${apiBaseUrl}${model}/${id ? id + "/": ""}`);
    const defaultStaleTime = 1000 * 60 * 15;
    const queryKey = [model, id];

    if (makeInfinate) {
        return useInfiniteQuery({
            queryKey: queryKey,
            queryFn: async ({pageParam = 1}) => {
                formattedUrl.searchParams.set('page', pageParam)
                const data  = await fetch(formattedUrl);
                return data.json();
            },
            getNextPageParam: (lastPage, pages) => {
                if (lastPage.next) {
                    const nextPage = new URL(lastPage.next);
                    return nextPage.searchParams.get('page');
                }
                return undefined;
            },
            hasNextPage: (lastPage, pages) => new Boolean(lastPage.next),
            staleTime : defaultStaleTime,
        })
    }

    return useQuery({
        queryKey : queryKey,
        queryFn : async () => {
            const data = await fetch(formattedUrl);
            return data.json();
        },
        staleTime : defaultStaleTime,
    })
}