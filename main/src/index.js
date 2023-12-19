import React, { Component, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { render } from "react-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import TasklistView from "./views/TasklistView";
import CustomPage from "./components/CustomPage";
import EventDetailView from "./views/EventDetailView";
import AssetsView from "./views/AssetsView";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import ManageShipmentView from "./views/ManageShipmentView";
import ShipmentDetailView from "./views/ShipmentDetailView";

// Data Classes
const queryClient = new QueryClient()

// Primary React Component
const App = () => {
  // Load Data
  const theme = createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      h1: {
        fontSize: "2.5rem",
      },
      h2: {
        fontSize: "2.25rem",
      },
      h3: {
        fontSize: "2rem",
      },
      h4: {
        fontSize: "1.75rem",
      },
      h5: {
        fontSize: "1.5rem",
      },
      h6: {
        fontSize: "1.25rem",
      },
      navtitle: {
        fontSize: "1.75rem",
        fontWeight: "500",
        textTransform: "uppercase",
      },
      projectDetailHeading: {
        fontSize: "1.25rem",
      },
      ProjectDetailLabel: {
        fontSize: "medium",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      },
      personInitial: {
        textTransform: "uppercase",
      }
    }
  });

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
