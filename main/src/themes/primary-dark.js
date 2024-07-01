import { createTheme } from "@mui/material";

let baseTheme = createTheme({});

const primaryDarkTheme = createTheme({
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
    },
    formHeader: {
      opacity: "75%",
      fontSize: "1.6rem",
      lineHeight: "40px",
    },
    formErrorText: {
      color: baseTheme.palette.error.dark,
    },
  },
});

export default primaryDarkTheme;
