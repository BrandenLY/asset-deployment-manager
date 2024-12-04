// REACT
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// MATERIAL UI
import {ThemeProvider, CssBaseline, Typography} from "@mui/material";

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
import { DocumentScanner, QrCodeScanner, Summarize } from "@mui/icons-material";
import ReserveEquipmentView from "./views/ReserveEquipmentView";
import UsersView from "./views/UsersView";

const betaFlagStyles = {color:"crimson", padding:1, backgroundColor:"rgba(18,18,18,0.66"};
const titleIconSize = "45pt";
const BetaFlag = <Typography sx={betaFlagStyles}>BETA</Typography>;
const applicationRoutes = [
  { 
    path: '/',
    component: Dashboard,
    pageTitle: <>Homepage {BetaFlag}</>
  },
  {
    path: '/reports',
    component: Reporting,
    pageTitle: <>Reporting {BetaFlag}</>
  },
  {
    path: '/scan',
    component: ScanView,
    pageTitle: <><QrCodeScanner fontSize={titleIconSize}/> Scan {BetaFlag}</>
  },
  {
    path: '/reserve',
    component: ReserveEquipmentView,
    pageTitle: <><Summarize fontSize={titleIconSize}/> Reserve Equipment {BetaFlag}</>
  },
  {
    path:'/users',
    component:UsersView, 
    pageTitle: 'Manage Users'
  },
  {
    path:'/shipments',
    component:ShipmentsView, 
    pageTitle: 'Manage Shipments'
  },
  {
    path:'/shipments/:id',
    component:ShipmentDetailView,
    pageTitle: 'Shipment Details'
  },
  {
    path:'/assets',
    component:AssetsView,
    pageTitle: 'Manage Equipment'
  },
  {
    path:'/assets/:id',
    component:AssetDetailView,
    pageTitle: 'Equipment Details'
  },
  {
    path:'/models',
    component:ModelsView,
    pageTitle: 'Manage Models'
  },
  {
    path:'/models/:id',
    component:ModelDetailView,
    pageTitle: 'Model Details'
  },
  {
    path:'/locations',
    component:LocationsView,
    pageTitle: 'Manage Locations'
  },
  {
    path:'/locations/:id',
    component:LocationDetailView,
    pageTitle: 'Location Details'
  },
  {
    path:'/equipmentholds',
    component:EquipmentHolds,
    pageTitle: 'Manage Equipment Holds'
  },
  {
    path:'/equipmentholds/:id',
    component:EquipmentHoldsDetailView,
    pageTitle: 'Equipment Hold Details'
  },
  {
    path:'*',
    component:PageNotFound,
    pageTitle: null
  }
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
                {applicationRoutes.map(({path, component, pageTitle}) => {
                  return(
                    <Route 
                      path={path}
                      element={
                        <CustomPage view={component} title={pageTitle}/>
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