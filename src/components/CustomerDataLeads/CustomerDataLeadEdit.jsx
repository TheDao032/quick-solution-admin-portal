import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import CustomerDataLeadAdd from './CustomerDataLeadAdd';

// Model(s)
import CustomerDataLeadModel from "../../models/CustomerDataLeadModel";

/**
 * @class customerDataLeadEdit
 */
export default class customerDataLeadEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();

    // Init state
    this.state = {
      /** @var {customerDataLeadEntity} */
      customerDataLeadEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let customerDataLeadEnt = await this._customerDataLeadModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      customerDataLeadEnt && this.setState({ customerDataLeadEnt });
    })();
    //.end
  }

  render() {
    let {
      customerDataLeadEnt,
    } = this.state;

    // Ready?
    if (!customerDataLeadEnt) {
      return <Loading />;
    }

    return <CustomerDataLeadAdd customerDataLeadEnt={customerDataLeadEnt} {...this.props} isEdit />
  }
}
