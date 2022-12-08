import React, { PureComponent } from 'react';

// Component(s)
// import Loading from '../Common/Loading';
import FunctionGroupDetail from './FunctionGroupDetail';

// Model(s)
import FunctionGroupModel from "../../models/FunctionGroupModel";

/**
 * @class FunctionGroupDelete
 */
export default class FunctionGroupDelete extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._functionGroupModel = new FunctionGroupModel();

    // Bind method(s)
    this.handlePressBtnDelete = this.handlePressBtnDelete.bind(this);

    // Init state
    this.state = {
      /** @var {Boolean} */
      isSubmitting: false
    };
  }

  handlePressBtnDelete(funcGroupEnt) {
    //
    this.setState({ isSubmitting: true });
    //
    this._functionGroupModel.delete(funcGroupEnt.id())
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
    return <FunctionGroupDetail {...props} isSubmitting={isSubmitting} deleteMode onPressBtnDelete={this.handlePressBtnDelete} />
  }
}
