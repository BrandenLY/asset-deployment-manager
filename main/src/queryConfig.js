import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getCookie } from "./context";

// React Query Configuration
// Docs: https://tanstack.com/query/latest/docs/react/overview

// Default Query-related Functions
const defaultQueryFn = async ({ queryKey, pageParam }) => {

  const formattedUrl = new URL(
    `${window.location.protocol}${window.location.host}/api/${queryKey[0]}/${
      !!queryKey.at(1) ? queryKey.at(1) + "/" : ""
    }`
  );
  
  if(pageParam != undefined){
    formattedUrl.searchParams.set('page', pageParam);
  }

  const res = await fetch(formattedUrl);
  const data = await res.json();
  return data;
};

const defaultMutationFn = async ({ model, data }) => {
  const updateUrl = new URL(
    `${window.location.protocol}${window.location.host}/api/${
      model.modelName
    }/${data.id ? data.id + "/" : ""}`
  );
  const requestHeaders = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-CSRFToken", getCookie("csrftoken"));

  return fetch(updateUrl, {
    method: "PUT",
    headers: requestHeaders,
    body: JSON.stringify(data),
  });
};

const defaultGetNextPageFn = (lastPage, pages) => {
  if (lastPage.next == null) {
    return undefined;
  }

  const nextPage = new URL(lastPage.next);
  return nextPage.searchParams.get("page");
};

const defaultHasNextPageFn = (lastPage, pages) => new Boolean(lastPage.next);

// Default Query Settings
const defaultStaleTimeInHours = 1;

// Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      getNextPageParam: defaultGetNextPageFn,
      hasNextPage: defaultHasNextPageFn,
      staleTime: defaultStaleTimeInHours * 60 * 60 * 1000,
    },
    mutations: {
      mutationFn: defaultMutationFn,
    },
  },
});

// Query Client Provider
const CustomQueryClientProvider = ({children}) => {

    return(
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export default CustomQueryClientProvider;