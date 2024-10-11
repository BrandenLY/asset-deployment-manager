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
import PageNotFound from "./views/PageNotFound";
import Dashboard from "./views/Dashboard";
import Reporting from "./views/Reporting";
import ScanView from "./views/ScanView";
import ShipmentsView from "./views/ShipmentsView";
import ShipmentDetailView from "./views/ShipmentDetailView";
import AssetsView from "./views/AssetsView";
import AssetDetailView from "./views/AssetDetailView";
import LocationsView from "./views/LocationsView";
import LocationDetailView from "./views/LocationDetailView";
import ModelsView from "./views/ModelsView";
import ModelDetailView from "./views/ModelDetailView";
import EquipmentHolds from "./views/EquipmentHolds";
import EquipmentHoldsDetailView from "./views/EquipmentHoldsDetailView";

import { useCustomTheme } from "./customHooks";
import { NotificationContextProvider } from "./context";

const applicationRoutes = [
  // [ PATH: String, VIEW: React Component, TITLE: String ]
  ['/', Dashboard, 'Homepage'],
  ['/reports', Reporting, 'Homepage'],
  ['/scan', ScanView, 'Scan'],
  ['/shipments', ShipmentsView, 'Manage Shipments'],
  ['/shipments/:id', ShipmentDetailView, 'Shipment Details'],
  ['/assets', AssetsView, 'Manage Assets'],
  ['/assets/:id', AssetDetailView, 'Asset Details'],
  ['/models', ModelsView, 'Manage Models'],
  ['/models/:id', ModelDetailView, 'Model Details'],
  ['/locations', LocationsView, 'Manage Locations'],
  ['/locations/:id', LocationDetailView, 'Location Details'],
  ['/equipmentholds', EquipmentHolds, 'Manage Equipment Reservations'],
  ['/equipmentholds/:id', EquipmentHoldsDetailView, 'Equipment Reservation Details'],
  ['*', PageNotFound, null] // Fallback/Default Route.
]

// Primary React Component
const App = () => {
  const theme = useCustomTheme();

  return (
    <React.StrictMode>
      <CustomQueryClientProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationContextProvider>
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
          </NotificationContextProvider>
        </ThemeProvider>
      </CustomQueryClientProvider>
    </React.StrictMode>
  );
};

// Entry Point
const root = createRoot(document.getElementById("main-content"));
root.render(<App />);
