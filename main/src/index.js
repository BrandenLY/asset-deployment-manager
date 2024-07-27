import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Material UI
import {ThemeProvider} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

// Tanstack Query
import CustomQueryClientProvider from "./queryConfig";

// Page Views
import TasklistView from "./views/TasklistView";
import CustomPage from "./components/CustomPage";
import EventDetailView from "./views/EventDetailView";
import ManageShipmentView from "./views/ManageShipmentView";
import ShipmentDetailView from "./views/ShipmentDetailView";
import primaryDarkTheme from "./themes/primary-dark";

// Primary React Component
const App = () => {

  return (
    <React.StrictMode>
      <CustomQueryClientProvider>
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
      </CustomQueryClientProvider>
    </React.StrictMode>
  );
};

const root = createRoot(document.getElementById("main-content"));
root.render(<App />);
