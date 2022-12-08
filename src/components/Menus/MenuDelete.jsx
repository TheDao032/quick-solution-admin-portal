import React, { PureComponent } from 'react';

// Component(s)
// import Loading from '../Common/Loading';
import MenuDetail from './MenuDetail';

// Model(s)
import MenuModel from "../../models/MenuModel";

/**
 * @class MenuDelete
 */
export default class MenuDelete extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._menuModel = new MenuModel();

    // Bind method(s)
    this.handlePressBtnDelete = this.handlePressBtnDelete.bind(this);

    // Init state
    this.state = {
      /** @var {Boolean} */
      isSubmitting: false
    };
  }

  handlePressBtnDelete(menuEnt) {
    //
    this.setState({ isSubmitting: true });
    //
    this._menuModel.delete(menuEnt.id())
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
    return <MenuDetail {...props} isSubmitting={isSubmitting} deleteMode onPressBtnDelete={this.handlePressBtnDelete} />
  }
}
