import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Material UI
import {createTheme, ThemeProvider} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

// Page Views
import TasklistView from "./views/TasklistView";
import CustomPage from "./components/CustomPage";
import EventDetailView from "./views/EventDetailView";
import ManageShipmentView from "./views/ManageShipmentView";
import ShipmentDetailView from "./views/ShipmentDetailView";
import primaryDarkTheme from "./themes/primary-dark";

// Helper Functions
import { getCookie } from "./context";

// React Query Configuration
// Docs: https://tanstack.com/query/latest/docs/react/overview
const defaultQueryFn = async ({ queryKey }) => {
  const formattedUrl = new URL(
    `${window.location.protocol}${window.location.host}/api/${queryKey[0]}/${
      !!queryKey.at(1) ? queryKey.at(1) + "/" : ""
    }`
  );

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
  if (!lastPage.next) {
    return undefined;
  }
  const nextPage = new URL(lastPage.next);
  return nextPage.searchParams.get("page");
};
const defaultHasNextPageFn = (lastPage, pages) => new Boolean(lastPage.next);

const defaultStaleTimeInHours = 1;

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

// Primary React Component
const App = () => {

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={primaryDarkTheme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <CustomPage view={ManageShipmentView} title="Homepage" />
                }
              ></Route>
              <Route
                path="/shipments"
                element={
                  <CustomPage
                    view={ManageShipmentView}
                    title="Manage Shipments"
                  />
                }
              ></Route>
              <Route
                path="/shipments/:id"
                element={
                  <CustomPage
                    view={ShipmentDetailView}
                    title="Manage Shipment"
                  />
                }
              ></Route>
              <Route
                path="/assets"
                element={<CustomPage view={null} />}
              ></Route>
              <Route
                path="/tasklist"
                element={<CustomPage view={TasklistView} title="Tasklist" />}
              ></Route>
              <Route path="/wiki" element={<CustomPage view={null} />}></Route>
              <Route
                path="/events/:id"
                element={<CustomPage view={EventDetailView} />}
              ></Route>
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

const root = createRoot(document.getElementById("main-content"));
root.render(<App />);
