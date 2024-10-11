import { createTheme } from "@mui/material";

let baseTheme = createTheme({});

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

const primaryDarkTheme = createTheme({
  palette: {
    mode: prefersDarkMode ? "dark" : "light",
    primary: {
      main: prefersDarkMode ? "#07002B" : "#230465",
      light: "#230465",
      dark: "#07002B",
      contrastText: "#CBC6DE"
    },
    secondary: {
      main: "#BF104E",
      light: "#F35588",
      dark: "#BF104E",
      contrastText: "#FFFFFF"
    },
    text:{
      primary: prefersDarkMode ? "rgba(236, 233, 250, 0.87)" : "rgba(7, 0, 43, 0.87)",
      secondary: prefersDarkMode ? "rgba(236, 233, 250, 0.6)" : "rgba(7, 0, 43, 0.6)",
      disabled: prefersDarkMode ? "rgba(236, 233, 250, 0.38)" : "rgba(7, 0, 43, 0.38)"
    },
    conditions : {
      working: {
        main: baseTheme.palette.success.dark,
        contrastText: baseTheme.palette.success.contrastText 
      },
      damaged: {
        main: baseTheme.palette.error.dark,
        contrastText: baseTheme.palette.error.contrastText
      },
      faulty: {
        main: baseTheme.palette.warning.dark,
        contrastText: baseTheme.palette.warning.contrastText
      },
      lost: {
        main: baseTheme.palette.error.dark,
        contrastText: baseTheme.palette.error.contrastText
      },
    }
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
    moreInfoIcon: {
      display: "block",
      fontSize: "8px",
      fontWeight: baseTheme.typography.fontWeightBold,
      width: "14px",
      height: "14px",
      borderRadius: "14px",
      lineHeight: "14px",
      backgroundColor: "RGBA(08,08,08,0.46)",
      textAlign: "center",
      cursor: "pointer"
    },
    code: {
      backgroundColor: "rgb(18, 18, 18)",
      borderRadius: 2,
      padding: baseTheme.spacing(1),
      paddingTop: 0,
      paddingBottom: 0,
      display: "inline-block"
    }
  },
});

export default primaryDarkTheme;
