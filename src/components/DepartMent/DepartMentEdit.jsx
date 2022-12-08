import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import DepartmentAdd from './DepartMentAdd';

// Model(s)
import DepartmentModel from "../../models/DepartmentModel";

/**
 * @class BusinessEdit
 */
export default class DepartmentEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._departmentModel = new DepartmentModel();

    // Init state
    this.state = {
      /** @var {DepartmentEnti} */
      DepartmentEnti: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      console.log(ID);
      let DepartmentEnti = await this._departmentModel.readDetail(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      console.log(DepartmentEnti);
      DepartmentEnti && this.setState({ DepartmentEnti });
    })();
    //.end
  }

  render() {
    let {
        DepartmentEnti,
    } = this.state;

    // Ready?
    if (!DepartmentEnti) {
      return <Loading />;
    }

    return <DepartmentAdd DepartmentEnti={DepartmentEnti} {...this.props} />
  }
}
