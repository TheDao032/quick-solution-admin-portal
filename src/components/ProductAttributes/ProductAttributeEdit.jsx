import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import ProductAttributeAdd from './ProductAttributeAdd';

// Model(s)
import ProductAttributeModel from "../../models/ProductAttributeModel";

/**
 * @class ProductAttributeEdit
 */
export default class ProductAttributeEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._productAttributeModel = new ProductAttributeModel();

    // Init state
    this.state = {
      /** @var {ProductAttributeEntity} */
      productAttributeEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let productAttributeEnt = await this._productAttributeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      productAttributeEnt && this.setState({ productAttributeEnt });
    })();
    //.end
  }

  render() {
    let {
      productAttributeEnt,
    } = this.state;

    // Ready?
    if (!productAttributeEnt) {
      return <Loading />;
    }

    return <ProductAttributeAdd productAttributeEnt={productAttributeEnt} {...this.props} />
  }
}
