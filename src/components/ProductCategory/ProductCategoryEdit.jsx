import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import ProductCategoryAdd from './ProductCategoryAdd';

// Model(s)
import ProductCategoryModel from "../../models/ProductCategoryModel";

/**
 * @class ProductCategoryEdit
 */
export default class ProductCategoryEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._ProductCategoryModel = new ProductCategoryModel();

    // Init state
    this.state = {
      /** @var {ProductCategoryEntity} */
      segmentEnt: null,
      /** @var {CustomerDatalead} */
      CustomerEnts: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let ProductCategoryEnt = await this._ProductCategoryModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;

      let AttributeEnts = {};
      if(ProductCategoryEnt && ProductCategoryEnt.list_attribute){
        ProductCategoryEnt.list_attribute.map((item)=> {
          return AttributeEnts[item.product_attribute_id] = Object.assign({},item);
        });
      }
      
      ProductCategoryEnt && this.setState({ ProductCategoryEnt, AttributeEnts });
    })();
    //.end
  }

  render() {
    let {
      ProductCategoryEnt,
      AttributeEnts,
    } = this.state;
    console.log('ProductCategoryEnt', ProductCategoryEnt);
    // Ready?
    if (!ProductCategoryEnt) {
      return <Loading />;
    }
    console.log(ProductCategoryEnt);
    return <ProductCategoryAdd ProductCategoryEnt={ProductCategoryEnt} AttributeEnts={AttributeEnts}  {...this.props} />
  }
}
