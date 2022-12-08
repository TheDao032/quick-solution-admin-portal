import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import BusinessAdd from './BusinessAdd';

// Model(s)
import BusinessModel from "../../models/BusinessModel";

/**
 * @class BusinessEdit
 */
export default class BusinessEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._businessModel = new BusinessModel();

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
      let businessEnt = await this._businessModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      businessEnt && this.setState({ businessEnt });
    })();
    //.end
  }

  render() {
    let {
      businessEnt,
    } = this.state;

    // Ready?
    if (!businessEnt) {
      return <Loading />;
    }

    return <BusinessAdd businessEnt={businessEnt} {...this.props} />
  }
}
