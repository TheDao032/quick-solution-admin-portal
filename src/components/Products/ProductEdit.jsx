import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import ProductAdd from './ProductAdd';

// Model(s)
import ProductModel from "../../models/ProductModel";

/**
 * @class ProductEdit
 */
export default class ProductEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._productModel = new ProductModel();

    // Init state
    this.state = {
      /** @var {ProductEntity} */
      productEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let productEnt = await this._productModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      productEnt && this.setState({ productEnt });
    })();
    //.end
  }

  render() {
    let {
        productEnt,
    } = this.state;

    // Ready?
    if (!productEnt) {
      return <Loading />;
    }
    return <ProductAdd productEnt={productEnt} {...this.props} />
  }
}
