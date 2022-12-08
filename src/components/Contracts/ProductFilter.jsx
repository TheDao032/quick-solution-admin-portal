import React from 'react';
import {
  Input,
  FormGroup,
  Label,
  Col,
  Row,
 } from 'reactstrap';
import Select from 'react-select';
// import moment from 'moment';

// Util(s)
import {mapDataOptions4Select} from '../../utils/html';

// Component(s)
import CommonMUIGridFilter from '../Common/MUIGrid/Filter';

// Model(s)
import ProductModel from '../../models/ProductModel';
import ProductCategoryModel from '../../models/ProductCategoryModel';

/**
 * @class ProductFilter
 */
export default class ProductFilter extends CommonMUIGridFilter {

  constructor(props) {
    super(props);

    // Init models
    this._productModel = new ProductModel();
    this._productCategoryModel = new ProductCategoryModel();

    // Init state
    Object.assign(this._orgState, this.state, {
      // @var {Number|String}
      is_service: props.is_service || "",
      // @var {Number|String}
      product_category_id: props.product_category_id || "",
    });
    // ...extends?!
    Object.assign(this.state, this._orgState, {
      /** @var {Array} */
      _optsProductCategory: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      _optsService: [
        { label: "-- Chọn --", value: "" },
        { label: "Có", value: "1" },
        { label: "Không", value: "0" },
      ],
    });
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  _getBundleData = async () => {
    let bundle = {};
    let all = [
      this._productCategoryModel.getOptions()
        .then(data => (bundle['_optsProductCategory'] = mapDataOptions4Select(data))),
    ];
    if (all.length) {
      await this._callBundleData(all);
    }
    return bundle;
  };

  _formatSubmitData = (value, prop) => {
    return value;
  };

  _formatClearData = (value, prop) => {
    return value;
  };

  _renderRows = () => {
    const {
      search,
      product_category_id,
      _optsProductCategory,
      is_service,
      _optsService,
    } = this.state;

    return (
      <div className="clearfix">
        <Row>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="search" className="mr-sm-2">Từ khóa</Label>
              <Input
                className="MuiPaper-filter__custom--input"
                autoComplete="nope"
                type="text"
                name="search"
                placeholder="Nhập mã sản phẩm, tên sản phẩm,..."
                value={search}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                inputprops={{ name: 'search' }}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Sản phẩm dịch vụ</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsService"
                name="_optsService"
                onChange={({ value: is_service }) => this.setState({ is_service })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={_optsService.find(({ value }) => ('' + value) === ('' + is_service))}
                options={_optsService}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Danh mục sản phẩm</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsProductCategory"
                name="_optsProductCategory"
                onChange={({ value: product_category_id }) => this.setState({ product_category_id })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={_optsProductCategory.find(({ value }) => ('' + value) === ('' + product_category_id))}
                options={_optsProductCategory}
              />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}
