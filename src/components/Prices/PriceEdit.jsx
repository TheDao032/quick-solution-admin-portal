import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import PriceAdd from './PriceAdd';

// Model(s)
import PriceModel from "../../models/PriceModel";

/**
 * @class PriceEdit
 */
export default class PriceEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._PriceModel = new PriceModel();

    // Init state
    this.state = {
      /** @var {PriceEntity} */
      PriceEnt: undefined,
      noEdit: false
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.productId;
      let PriceEnt = await this._PriceModel.read(ID)
        .catch(() => {
          this.setState({PriceEnt: -1});
          // setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      let { noEdit } = this.state;
      if( PriceEnt ) {
        let data = PriceEnt.price_apply_outputtype[PriceEnt.price_apply_outputtype.length -1];
        if(data) {
          data = data.list_business_apply[0];
          if( data ) {
            PriceEnt.company_id = data.company_id;
          }
        }
        if(!PriceEnt.product_id){
          PriceEnt = -1;
        } else {

          const listItem = PriceEnt.price_apply_outputtype;
          listItem.forEach((item) => {
            if(item.is_review !== null) { noEdit = true; }
            if(item.list_business_apply[0]) PriceEnt.company_id = item.list_business_apply[0].company_id;
          })
        }
        this.setState({ PriceEnt, noEdit });
      }
    })();
    //.end
  }

  render() {
    let {
      PriceEnt,
      noEdit
    } = this.state;
    // Ready?
    if (!PriceEnt && PriceEnt !== -1) {
      return <Loading />;
    }
    
    return <PriceAdd PriceEnt={PriceEnt} noEdit={noEdit} {...this.props}  />
  }
}
