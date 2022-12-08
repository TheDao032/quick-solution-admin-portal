import React, { Component } from 'react';
import { Label } from 'reactstrap';

class ErrorMessageCustom extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="field-validation-error alert alert-danger fade show">
        <Label>{ this.props.message }</Label>
      </div>
    );
  }
}

export default ErrorMessageCustom;
