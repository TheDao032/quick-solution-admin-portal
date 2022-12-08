import React, { PureComponent } from 'react';

// Component(s)
// import Loading from '../Common/Loading';
import FunctionDetail from './FunctionDetail';

// Model(s)
import FunctionModel from "../../models/FunctionModel";

/**
 * @class FunctionDelete
 */
export default class FunctionDelete extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._functionModel = new FunctionModel();

    // Bind method(s)
    this.handlePressBtnDelete = this.handlePressBtnDelete.bind(this);

    // Init state
    this.state = {
      /** @var {Boolean} */
      isSubmitting: false
    };
  }

  handlePressBtnDelete(functionEnt) {
    //
    this.setState({ isSubmitting: true });
    //
    this._functionModel.delete(functionEnt.id())
      .then(data => { // OK
        window._$g.toastr.show('Xóa thành công!', 'success');
        setTimeout(() => {
          window._$g.rdr(-1);
        }, 0);
        // Chain
        return data;
      })
      .catch(apiData => { // NG
        window._$g.toastr.show('Xóa thất bại!', 'error');
        // Submit form is done!
        this.setState({ isSubmitting: true });
      })
    ;
  }

  render() {
    let { isSubmitting } = this.state;
    let props = this.props;
    return <FunctionDetail {...props} isSubmitting={isSubmitting} deleteMode onPressBtnDelete={this.handlePressBtnDelete} />
  }
}
