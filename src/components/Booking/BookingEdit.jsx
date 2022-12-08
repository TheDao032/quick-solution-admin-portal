import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import BookingAdd from './BookingAdd';

// Model(s)
import BookingModel from "../../models/BookingModel";

/**
 * @class BookingEdit
 */
export default class BookingEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._BookingModel = new BookingModel();

    // Init state
    this.state = {
      /** @var {TaskEntity} */
      segmentEnt: null,
      /** @var {Product} */
      ProductEnts: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let BookingEnt = await this._BookingModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
 
      let ProductEnts = {};
      if(!this.props.noEdit){
        let productItems = await this._BookingModel.getProductBooking(ID)
          .catch(() => {
            // setTimeout(() => window._$g.rdr('/404'));
          })
        ; 
        if(productItems){
            productItems.map((item)=> {
            return ProductEnts[item.product_id] = Object.assign({},item,{
              booking_detail_id: item.booking_detail_id,
              product_id: item.product_id,
              product_code: item.product_code,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price,
              total_price_item: item.total_price_item,
            });
          });
        }
      }
      
      BookingEnt && this.setState({ BookingEnt, ProductEnts });
    })();
    //.end
  }

  render() {
    let {
        BookingEnt,
      ProductEnts,
    } = this.state;

    // Ready?
    if (!BookingEnt) {
      return <Loading />;
    } 
    return <BookingAdd BookingEnt={BookingEnt} ProductEnts={ProductEnts}  {...this.props} />
  }
}
