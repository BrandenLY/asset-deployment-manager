import React, { Component } from "react";
import { render } from "react-dom";

export default class App extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(<p>REACT LOADED</p>)
    }
}

const appContainer = document.getElementById("main-content");
render(<App/>, appContainer);