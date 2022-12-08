import React from 'react';
// import {Button} from 'reactstrap';
// Material
import {Checkbox} from '@material-ui/core';

// Util(s)
// import { mapDataOptions4Select } from 'utils/html';

// Component(s)
import CommonMUIGrid from '../Common/MUIGrid';
// import { CheckAccess } from '../../navigation/VerifyAccess';
import ProductFilter from './ProductFilter';
import Promotions from './Promotions';

// Model(s)
import ProductModel from '../../models/ProductModel';

// @var {Object}
const _$g = window._$g;

/**
 * @class Products
 */
export default class Products extends CommonMUIGrid {
  /**
   * Self regist component's main model
   * @return ProductModel
   */
  _model() {
    // Init model(s)
    if (!this._productModel) {
      this._productModel = new ProductModel();
    }
    return this._productModel;
  }

  /**
   * Self regist component filter
   * @return {Object} ProductFilter
   */
  _componentFilter = () => ProductFilter;

  /**
   * Request/Get all needed data...
   */
  _getBundleData = async () => {
    let bundle = {};
    let all = [];
    if (all.length) {
      await this._callBundleData(all);
    }
    return bundle;
  }

  /**
   * @return {Object} Phrases
   */
  _phrases = () => {
    return Object.assign(this._phrData, {
      'BTN_ADD': 'Chọn khuyến mại',
      // 'BTN_EXCEL': '',
    });
  };

  /**
   * Define permissions
   * @var {Object}
   */
  _checkAccessConfig = {
    TOP_BTN_ADD: "",
    // TOP_BTN_EXCEL: "",
    ACT_BTN_DETAIL: "",
    // ACT_BTN_EDIT: "",
    // ACT_BTN_DEL: "",
    // ACT_BTN_CHANGE_STATUS: "",
  };

  /**
   * Define routes
   * @return {Object|String}
   */
  _getRoutes = (type) => {
    let routes = {
      // create: '',
      read: '/products/detail/',
      // update: '',
      // delete: ''
    };
    return type ? routes[type] : routes;
  };

  constructor(props) {
    super(props)

    // Init model(s)
    this._model(); // register main model

    // Init state
    // ...extends?!
    Object.assign(this.state, {
      // @var {Boolean}
      willShowPromotion: false,
      // @var {Object}
      product: null,
      // @var {Object}
      query: {...this.state.query, ...{
        // @var {Number|String}
        "is_active": "1",
        // @var {Number|String}
        // "is_service": "1",
        // @var {Number|String}
        // "is_amount_days": "1",
        // @var {Number|String}
        // "is_session": "1",
      }}
    });
  }

  /**
   * Handle top button "Add (create)"
   * @return void
   */
  handleClickAdd = () => {
    let product = Object.values(this._getPickDataItems())[0];
    // 
    if (!product) {
      return _$g.dialogs.alert(_$g._(`Bạn vui lòng chọn sản phẩm!`));
    }
    if (!product._price) {
      return _$g.dialogs.alert(_$g._(`Bạn vui lòng chọn hình thức xuất cho sản phẩm!`));
    }
    //
    this.setState({ willShowPromotion: true, product });
  };

  /**
   * Define grid's columns
   * @return {Array}
   */
  columns = () => {
    // Column default options
    const opts = this._columnDefaultOpts();
    const dataPK = this._modelClassPK(); // primary key

    return [
      this._cnfColCheckboxRowTbl(dataPK, {
        single: true
      }),
      {
        name: "product_code",
        label: "Mã sản phẩm",
        options: {...opts}
      },
      {
        name: "product_name",
        label: "Tên sản phẩm",
        options: {...opts}
      },
      {
        name: "prices",
        label: "Hình thức xuất",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
            let {data} = this.state;
            let {rowIndex} = tableMeta;
            return (
              <div className="text-center">
                <select
                  className="form-control input-sm select-prices"
                  onChange={evt => {  
                    let idx = (1 * evt.target.value);
                    Object.assign(data[rowIndex], { _price: value[idx] });
                  }}
                >
                  <option value="">- Chọn -</option>
                {value.map((item, idx) => {
                  return item.output_type_id ? (
                    <option key={`opt-${idx}`} value={idx}>{item.output_type_name}</option>
                  ) : null;
                })}
                </select> 
              </div>
            );
          }
        }}
      },
      {
        name: "category_name",
        label: "Danh mục sản phẩm",
        options: {...opts}
      },
      {
        name: "values_in",
        label: "Có giá trị theo ngày",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
            return (
              <div className="text-center">{value}</div>
            );
          }
        }}
      },
      {
        name: "is_session",
        label: "Gói thấp điểm",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
            return (
              <div className="text-center">
                <Checkbox disabled checked={!!value} value={value} />
              </div>
            );
          }
        }}
      },
      // this._stdColChangeStatus(),
      this._stdColActions(),
    ];
  };

  handlePickPromotion = (_promotions) => {
    let {onPick} = this.props;
    let {product} = this.state;
    let dataPK = this._modelClassPK();
    let data = {
      [product[dataPK]]: {...product, ...{ _promotions }}
    };
    //
    this.setState({ willShowPromotion: false }, () => {
      // Fire callback?!
      onPick && onPick(data);
    });
  };

  _renderCardBodyHeader = () => {
    let {willShowPromotion, product} = this.state;

    return willShowPromotion ? (
      <div id="contract-products-div" className="">
        <div className="overlay"><div className="overlay-box">
          <Promotions
            product={product}
            onPick={this.handlePickPromotion}
            onClose={() => this.setState({ willShowPromotion: false })}
          />
        </div></div>
      </div>
    ) : null;
  };
}
