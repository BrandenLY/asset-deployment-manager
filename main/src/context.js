import React, { createContext } from "react";

// Data Classes
class APIWrapper {
  static apiRoot = "/api";
  static objects = {};
}

class Event extends APIWrapper {
  static baseUrl = "/event";

  constructor(eventDataObject) {
    super();
    this.id = eventDataObject["id"];
    this.name = eventDataObject["name"];
    this.dateCreated = new Date(eventDataObject["date_created"]);
    this.lastModified = new Date(eventDataObject["last_modified"]);
    this.startDate = new Date(eventDataObject["start_date"]);
    this.endDate = new Date(eventDataObject["end_date"]);
    this.travelInDate = new Date(eventDataObject["travel_in_date"]);
    this.travelOutDate = new Date(eventDataObject["travel_out_date"]);
    this.timetrackingUrl = eventDataObject["timetracking_url"];
    this.externalProjectUrl = eventDataObject["external_project_url"];
    this.sharepointUrl = eventDataObject["sharepoint_url"];
  }

  static create = () => {
    return null;
  };

  static retrieveAll = (updateFunc) => {
    fetch(`${this.apiRoot}${this.baseUrl}`)
    .then((res) => res.json())
    .then((data) => {
      updateFunc(data.map(event => new Event(event)))
    });
  };

  static retrieve = (id) => {
    return null;
  };

  static update = (id) => {
    return null;
  };
}

class User extends APIWrapper {}

export const GenericContext = createContext(undefined);

export const GenericContextProvider = ({ children }) => {
  return (
    <GenericContext.Provider value={{ events: Event, users: User }}>
      {children}
    </GenericContext.Provider>
  );
};
