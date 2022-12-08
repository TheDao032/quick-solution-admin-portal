import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import BusinessTypeAdd from './BusinessTypeAdd';

// Model(s)
import BusinessTypeModel from "../../models/BusinessTypeModel";

/**
 * @class BusinessEdit
 */
export default class BusinessTypeEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._businessTypeModel = new BusinessTypeModel();

    // Init state
    this.state = {
      /** @var {BusinessEntity} */
      businessEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let businessTypeEnt = await this._businessTypeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      businessTypeEnt && this.setState({ businessTypeEnt });
    })();
    //.end
  }

  render() {
    let {
      businessTypeEnt,
    } = this.state;

    // Ready?
    if (!businessTypeEnt) {
      return <Loading />;
    }
    return <BusinessTypeAdd businessTypeEnt={businessTypeEnt} {...this.props} />
  }
}
