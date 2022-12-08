import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
 } from 'reactstrap';

// Util(s)
//...

// Component(s)
//...

// Model(s)
// ...

// @var {Object}
const _$g = window._$g;

/**
 * @class CommonMUIGridFilter
 */
export default class CommonMUIGridFilter extends PureComponent {

  /** @var {Array} */
  _optsActive = [
    { label: "Tất cả", value: "2" },
    { label: "Có", value: "1" },
    { label: "Không", value: "0" },
  ];

  constructor(props) {
    super(props);

    // Init state original
    // @var {Object}
    this._orgState = {};

    // Init state
    // @var {Object}
    this.state = {
      // @var {String}
      search: props.search || "",
      // @var {Number|String}
      is_active: props.is_active,
    };
  }

  componentDidMount() {
    // Get bundle data
    this._getBundleData()
      .then(bundle => {
        //
        Object.keys(bundle).forEach((key) => {
          let data = bundle[key];
          let value = this.state[key];
          if (data instanceof Array && value instanceof Array) {
            data = [value[0]].concat(data);
          }
          bundle[key] = data;
        });
        // console.log('bundle@filter: ', bundle);
        this.setState({ ...bundle });
      });
    //.end
  }

  /**
   * @abstract:... Goi API, lay toan bo data lien quan,...
   */
  _getBundleData = async () => {};

  /**
   * Goi API, lay toan bo data lien quan,...
   * @param {Array<Promise>} all
   * @param {Object} opts
   * @return Promise
   */
  async _callBundleData(all = [], opts = {}) {
    return Promise.all(all)
      .catch(err => _$g.dialogs.alert(
        _$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ));
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  _formatSubmitData = (value, prop) => value;

  _formatClearData = (value, prop) => value;

  onSubmit = () => {
    const { handleSubmit } = this.props;
    if (!handleSubmit) {
      return;
    }
    const state = {};
    Object.keys(this.state).forEach((prop) => {
      if (0 === prop.indexOf('_')) {
        return;
      }
      state[prop] = this._formatSubmitData(this.state[prop], prop);
    });
    handleSubmit(state);
  };

  onReset = () => this.setState({...this._orgState}, () => this.onSubmit());

  _renderRows = () => {};

  render() {
    return (
      <div className="clearfix m-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          {this._renderRows()}
        </Form>
        <div className="d-flex align-items-center mt-3">
          <div className="d-flex flex-fill justify-content-end">
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <Button className="col-12 MuiPaper-filter__custom--button" onClick={this.onSubmit} color="primary" size="sm">
                <i className="fa fa-search" />
                <span className="ml-1">Tìm kiếm</span>
              </Button>
            </FormGroup>
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <Button className="mr-1 col-12 MuiPaper-filter__custom--button" onClick={this.onReset} size="sm">
                <i className="fa fa-refresh" />
                <span className="ml-1">Làm mới</span>
              </Button>
            </FormGroup>
          </div>
        </div>
      </div>
    );
  }
}

CommonMUIGridFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}