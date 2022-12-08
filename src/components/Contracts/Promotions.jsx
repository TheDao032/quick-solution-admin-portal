import React from 'react';
import {Button} from 'reactstrap';
// Material
// ...

// Util(s)
// import { mapDataOptions4Select } from 'utils/html';

// Component(s)
import CommonMUIGrid from '../Common/MUIGrid';
// import { CheckAccess } from '../../navigation/VerifyAccess';

// Model(s)
import PromotionModel from '../../models/PromotionModel';

// @var {Object}
const _$g = window._$g;

/**
 * @class Promotions
 */
export default class Promotions extends CommonMUIGrid {
  /**
   * Self regist component's main model
   * @return PromotionModel
   */
  _model() {
    // Init model(s)
    if (!this._promotionModel) {
      this._promotionModel = new PromotionModel();
    }
    return this._promotionModel;
  }

  /**
   * Self regist component filter
   * @return {Object} PromotionFilter
   */
  _componentFilter = () => null;

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

  constructor(props) {
    super(props)

    // Init model(s)
    this._model(); // register main model

    // Init state
    // ...extends?!
    Object.assign(this.state, {
      // @var {Object}
      query: {...this.state.query, ...{
        // @var {Number|String}
        get_offer: "1",
        // @var {Number|String}
        is_active: "1",
        // @var {Number|String}
        is_review: "1",
        // @var {Number|String}
        product_id: props.product.product_id,
      }}
    });
  }

  /**
   * @param {Object} item
   * @return {Boolean}
   */
  _bdChkbEnabledByDataItem = (item) => {
    let {_pickDataItems, data} = this.state;
    let dataItem = data[(Object.values(_pickDataItems) || [])[0]];

    if (dataItem && (dataItem !== item)) {
      if (!dataItem.is_apply_with_order_promotion) {
        return false;
      }
      if (!item.is_apply_with_order_promotion) {
        return false;
      }
    }

    return true;
  }

  /**
   * Define grid's columns
   * @return {Array}
   */
  columns = () => {
    let {product} = this.props;
    // Column default options
    const opts = this._columnDefaultOpts();
    const dataPK = this._modelClassPK(); // primary key

    return [
      {
        name: "product_code",
        label: "Mã sản phẩm",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
          return <div>{product.product_code}</div>;
          }
        }}
      },
      {
        name: "product_name",
        label: "Tên sản phẩm",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
          return <div>{product.product_name}</div>;
          }
        }}
      },
      {
        name: "promotion_name",
        label: "Chương trình khuyến mại",
        options: {...opts}
      },
      {
        name: "list_offer",
        label: "Ưu đãi khuyến mại",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
            let {data} = this.state;
            let {rowIndex} = tableMeta;
            return (
              <div className="text-center">
                <select
                  className="form-control input-sm select-offer"
                  onChange={evt => {
                    delete data[rowIndex]['_offer'];
                    if ('' !== evt.target.value) {
                      let idx = (1 * evt.target.value);
                      Object.assign(data[rowIndex], { _offer: value[idx] });
                    }
                    this.forceUpdate();
                  }}
                >
                  <option value="">- Chọn -</option>
                {value.map((item, idx) => {
                  return item.promotion_offer_apply_id ? (
                    <option key={`opt-${idx}`} value={idx}>{item.promotion_offer_name}</option>
                  ) : null;
                })}
                </select> 
              </div>
            );
          }
        }}
      },
      {
        name: "_",
        label: "Giá trị",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
            let {data} = this.state;
            let {rowIndex} = tableMeta;
            let item = data[rowIndex];
            return (
              <div>{item._offer && item._offer.offer}</div>
            );
          }
        }}
      },
      this._cnfColCheckboxRowTbl(dataPK, {
        noCheckboxAll: true,
        // events:
        // onChange: (target, { dataItem }) => {}
      }),
    ];
  };

  /**
   * 
   * @return void
   */
  handleSelect = () => {
    let {onPick} = this.props;
    let data = Object.values(this._getPickDataItems());
    //
    if (!data.length) {
      return _$g.dialogs.alert(_$g._(`Bạn vui lòng chọn chương trình khuyến mại!`));
    }
    //
    let hasNoOfferLength = data.filter(i => !i._offer).length;
    if (hasNoOfferLength) {
      return _$g.dialogs.alert(_$g._(`Bạn vui lòng chọn ưu đã khuyến mại!`));
    }

    // Fire callback?!
    onPick && onPick(data);
  };

  _renderCardBodyFooter = () => {
    return <div className="text-right pb-2">
      <Button color="success" onClick={this.handleSelect} className="mr-2">Chọn</Button>
      <Button color="warning" onClick={this.props.onClose} className="mr-2">Đóng</Button>
    </div>;
  };
}
