import React, { Component, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { render } from "react-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { GenericContextProvider } from "./context";
import DebugView from "./components/DebugView";
import CustomPage from "./components/CustomPage";

// Data Classes

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
      }
    }
  });

  return (
    <React.StrictMode>
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
        <GenericContextProvider>
          <Routes>
              <Route
                path="/"
                element={<CustomPage view={DebugView}/>}
              >
              </Route>
              <Route
                path="/assets"
                element={<CustomPage view={null}/>}>
              </Route>
              <Route
                path="/wiki"
                element={<CustomPage view={null}/>}>
              </Route>
              <Route
                path="/event/:id"
                element={<CustomPage view={null}/>}>
              </Route>
            </Routes>
        </GenericContextProvider>
        </Router>
        </ThemeProvider>
    </React.StrictMode>
  );
};

const appContainer = document.getElementById("main-content");
render(<App />, appContainer);
