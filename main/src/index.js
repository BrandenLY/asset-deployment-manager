// REACT
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// MATERIAL UI
import {ThemeProvider, CssBaseline} from "@mui/material";
import primaryDarkTheme from "./themes/primary-dark";

// TANSTACK QUERY
import CustomQueryClientProvider from "./queryConfig";

// PAGE VIEWS
import CustomPage from "./components/CustomPage";
import ManageShipmentView from "./views/ManageShipmentView";
import ShipmentDetailView from "./views/ShipmentDetailView";
import PageNotFound from "./views/PageNotFound"
import AssetsView from "./views/AssetsView";
import LocationView from "./views/LocationView";

const applicationRoutes = [
  // [ PATH: String, VIEW: React Component, TITLE: String ]
  ['/', ManageShipmentView, 'Homepage'],
  ['/shipments', ManageShipmentView, 'Manage Shipments'],
  ['/shipments/:id', ShipmentDetailView, 'Shipment Details'],
  ['/assets', AssetsView, 'Manage Assets'],
  ['/assets/:id', null, 'Asset Details'],
  ['/locations', LocationView, 'Manage Locations'],
  ['/locations/:id', null, 'Location Details'],
  ['*', PageNotFound, null] // Fallback/Default Route.
]

// Primary React Component
const App = () => {

  return (
    <React.StrictMode>
      <CustomQueryClientProvider>
        <ThemeProvider theme={primaryDarkTheme}>
          <CssBaseline />
          <Router>
            <Routes>

              {/* Display Routes */}
              {applicationRoutes.map(([path, view, title]) => {
                return(
                  <Route 
                    path={path}
                    element={
                      <CustomPage view={view} title={title}/>
                    }
                  />
                )
              })}

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
