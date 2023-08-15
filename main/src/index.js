import React, { Component, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { render } from "react-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import DebugPage from "./components/DebugPage";

class Event {
  constructor(
    eventDataObject
  ) {
    this.id = eventDataObject['id'];
    this.name = eventDataObject['name'];
    this.dateCreated = new Date(eventDataObject['date_created']);
    this.lastModified = new Date(eventDataObject['last_modified']);
    this.startDate = new Date(eventDataObject['start_date']);
    this.endDate = new Date(eventDataObject['end_date']);
    this.travelInDate = new Date(eventDataObject['travel_in_date']);
    this.travelOutDate = new Date(eventDataObject['travel_out_date']);
    this.timetrackingUrl = eventDataObject['timetracking_url'];
    this.externalProjectUrl = eventDataObject['external_project_url'];
    this.sharepointUrl = eventDataObject['sharepoint_url'];
  }

  getCreated = () => 

  updateDB = () => {};
}

const App = () => {
  const [events, setEvents] = useState([]);
  const theme = createTheme({
    palette: {
      mode: "dark",
    }
  });
  useEffect(() => {
    fetch("/api/event/")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.map(event => new Event(event)));
      });
  }, []);

  return (
    <React.StrictMode>
      <Router>
        <ThemeProvider theme={theme}>
          <DebugPage events={events}/>
        </ThemeProvider>
      </Router>
    </React.StrictMode>
  );
};

const appContainer = document.getElementById("main-content");
render(<App />, appContainer);
