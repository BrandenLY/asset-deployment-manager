import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Material UI
import {ThemeProvider, CssBaseline} from "@mui/material";
import primaryDarkTheme from "./themes/primary-dark";

// Tanstack Query
import CustomQueryClientProvider from "./queryConfig";

// Page Views
import TasklistView from "./views/TasklistView";
import CustomPage from "./components/CustomPage";
import EventDetailView from "./views/EventDetailView";
import ManageShipmentView from "./views/ManageShipmentView";
import ShipmentDetailView from "./views/ShipmentDetailView";

// Primary React Component
const App = () => {

  return (
    <React.StrictMode>
      <CustomQueryClientProvider>
        <ThemeProvider theme={primaryDarkTheme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Model related list views */}
              <Route
                path="/"
                element={
                  <CustomPage view={ManageShipmentView} title="Homepage" />
                }
              />

              {/* Shipment Related Views */}
              <Route
                path="/shipments"
                element={
                  <CustomPage view={ManageShipmentView} title="Manage Shipments" />
                }
              />
              <Route
                path="/shipments/:id"
                element={
                  <CustomPage view={ShipmentDetailView} title="Shipment Details" />
                }
              />

              {/* Asset Related Views */}
              <Route
                path="/assets"
                element={
                  <CustomPage view={null} title="Manage Assets" />
                }
              />
              <Route
                path="/assets/:id"
                element={
                  <CustomPage view={null} title="Asset Details"/>
                }
              />

              {/* Location Related Views */}
              <Route
                path="/locations"
                element={
                  <CustomPage view={null} title="Manage Locations" />
                }
              />
              <Route
                path="/locations/:id"
                element={
                  <CustomPage view={null} title="Location Details"/>
                }
              />

            </Routes>
          </Router>
        </ThemeProvider>
      </CustomQueryClientProvider>
    </React.StrictMode>
  );
};

// Entry Point
const root = createRoot(document.getElementById("main-content"));
root.render(<App />);
