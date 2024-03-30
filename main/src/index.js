import React, { Component, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { render } from "react-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { getCookie } from "./context";
import TasklistView from "./views/TasklistView";
import CustomPage from "./components/CustomPage";
import EventDetailView from "./views/EventDetailView";
import ManageShipmentView from "./views/ManageShipmentView";
import ShipmentDetailView from "./views/ShipmentDetailView";
import primaryDarkTheme from "./themes/primary-dark";

// React Query Configuration
// Docs: https://tanstack.com/query/latest/docs/react/overview
const defaultQueryFn = async ({queryKey}) =>{

  const formattedUrl = new URL(
      `${window.location.protocol}${window.location.host}/api/${queryKey[0]}/${!!queryKey.at(1) ? queryKey.at(1) + "/" : ""}`
    )

  const res = await fetch(formattedUrl);
  const data = await res.json();
  return data;
}
const defaultMutationFn = async ({model, data}) =>{

  const updateUrl = new URL(`${window.location.protocol}${window.location.host}/api/${model.modelName}/${data.id ? data.id + '/' : ''}`)
  const requestHeaders = new Headers();
  requestHeaders.set('Content-Type', 'application/json');
  requestHeaders.set('X-CSRFToken', getCookie('csrftoken'))

  return fetch( updateUrl, {method:"PUT", headers:requestHeaders, body:JSON.stringify(data)} )
}
const defaultGetNextPageFn = (lastPage, pages) => {
  if (!lastPage.next) {
    return undefined;
  }
  const nextPage = new URL(lastPage.next);
  return nextPage.searchParams.get('page');
}
const defaultHasNextPageFn = (lastPage, pages) => new Boolean(lastPage.next);

const defaultStaleTimeInHours = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      getNextPageParam: defaultGetNextPageFn,
      hasNextPage: defaultHasNextPageFn,
      staleTime: defaultStaleTimeInHours * 60 * 60 * 1000
    },
    mutations: {
      mutationFn: defaultMutationFn,
    }
  }
})

// Primary React Component
const App = () => {
  // Load Data
  const theme = createTheme(primaryDarkTheme);

  return (
    <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
            <CssBaseline />
              <Router>
                <Routes>
                    <Route
                      path="/"
                      element={<CustomPage view={ManageShipmentView} title="Homepage"/>}
                    >
                    </Route>
                    <Route
                      path="/shipments"
                      element={<CustomPage view={ManageShipmentView} title="Manage Shipments"/>}
                    >
                    </Route>
                    <Route
                      path="/shipments/:id"
                      element={<CustomPage view={ShipmentDetailView} title="Manage Shipment"/>}
                    >
                    </Route>
                    <Route
                      path="/assets"
                      element={<CustomPage view={null}/>}>
                    </Route>
                    <Route
                      path="/tasklist"
                      element={<CustomPage view={TasklistView} title="Tasklist"/>}>
                    </Route>
                    <Route
                      path="/wiki"
                      element={<CustomPage view={null}/>}>
                    </Route>
                    <Route
                      path="/events/:id"
                      element={
                        <CustomPage view={EventDetailView}/>
                      }>
                    </Route>
                  </Routes>
              </Router>
            </ThemeProvider>
          </QueryClientProvider>
    </React.StrictMode>
  );
};

const appContainer = document.getElementById("main-content");
render(<App />, appContainer);
