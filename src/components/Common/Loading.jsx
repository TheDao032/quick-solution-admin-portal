import React, { Component } from "react";
// import ReactDOM from "react-dom";
import { Spinner } from "reactstrap";

/**
 * @class Loading
 */
export default class Loading extends Component {
  render() {
    return (
      <div className="animated fadeIn pt-1 text-center">
        <Spinner type="grow" color="primary" />
        <Spinner type="grow" color="secondary" />
        <Spinner type="grow" color="success" />
        <Spinner type="grow" color="danger" />
        <Spinner type="grow" color="warning" />
        <Spinner type="grow" color="info" />
        <Spinner type="grow" color="light" />
        <Spinner type="grow" color="dark" />
      </div>
    );
  }
}

export function loading() {
  return <Loading />;  
}
