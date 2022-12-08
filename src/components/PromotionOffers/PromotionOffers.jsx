import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button, Table } from 'reactstrap'
import fileDownload from "js-file-download";
import moment from 'moment';

// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress, Checkbox } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import PromotionOffersFilter from './PromotionOffersFilter'
// Util(s)
import { configTableOptions, configIDRowTable } from '../../utils/index'
// ...

// Model(s)
import PromotionOfferModel from '../../models/PromotionOfferModel'

// @var UserEntity
const userAuth = window._$g.userAuth;

/**
 * @class PromotionOffers
 */
class PromotionOffers extends Component {
  /**
   * @var {PromotionOfferModel}
   */
  _promotionOfferModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._promotionOfferModel = new PromotionOfferModel();

    // Bind method(s)
    this.handleShowProducts = this.handleShowProducts.bind(this);

    // Init state
    this.state = {
      toggleSearch: true,
      isLoading: true,
      page: 0,
      count: 1,
      data: [],
      totalItems: 0,
      totalPages: 0,
      query: {
        itemsPerPage: 25,
        page: 1,
        is_active: 1,
        create_date_from: null,
        create_date_to: null,
      },
      /** @var {PromotionOfferEntity|null} */
      promotionOfferEnt: null
    };
  }

  componentDidMount() {
    this.getData();
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let bundle = {}
    let all = [
      // @TODO:
      this._promotionOfferModel.getList(this.state.query)
        .then(data => (bundle['data'] = data)),
    ]
    await Promise.all(all)
      .catch(err => {
        window._$g.dialogs.alert(
          window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
          () => window.location.reload()
        )
      })
    return bundle
  }

  // get data
  getData = ( _query ) => {
    this.setState({ isLoading: true });
    let { query } = this.state;
    query = Object.assign(_query || query, this.props.stateQuery);
    return this._promotionOfferModel.getList(query)
      .then(res => {
        let {
          items = [],
          totalItems,
          totalPages,
          ...rest
        } = res;
        let isLoading = false;
        this.setState({
          isLoading,
          data: items,
          totalItems,
          totalPages,
          query: Object.assign(query, rest)
        });
      });
  }

  handleClickAdd = () => {
    window._$g.rdr('/promotion-offers/add')
  }

  handleExport = () => {
    this._promotionOfferModel.exportExcel()
    .then(response => {
      const configDate = moment().format("DDMMYYYY");
      fileDownload(response, `Company_${configDate}.csv`);
    })
    .catch((error) => console.log(error));
  }

  handleChangeStatus = (status, id, rowIndex) => {
    window._$g.dialogs.prompt(
      'Bạn có chắc chắn muốn thay đổi trạng thái dữ liệu đang chọn?',
      'Cập nhật',
      (confirm) => this.onChangeStatus(confirm, status, id, rowIndex)
    )
  }

  onChangeStatus = (confirm, status, id, idx) => {
    if (confirm) {
      let postData = {is_active: status ? 1 : 0};
      this._promotionOfferModel.changeStatus(id, postData)
      .then(() => {
        const cloneData = [...this.state.data]
        cloneData[idx].is_active = status
        this.setState({
          data: cloneData,
        }, () => {
          window._$g.toastr.show('Cập nhật trạng thái thành công.', 'success');
        });
      })
      .catch(() => {
        window._$g.toastr.show('Cập nhật trạng thái không thành công.', 'error');
      });
    }
  }

  handleActionItemClick(type, id, rowIndex) {
    let routes = {
      detail: '/promotion-offers/details/',
      delete: '/promotion-offers/delete/',
      edit: '/promotion-offers/edit/',
      changePassword: '/promotion-offers/change-password/',
    }
    const route = routes[type]
    if (type.match(/detail|edit/i)) {
      window._$g.rdr(`${route}${id}`)
    } else {
      window._$g.dialogs.prompt(
        'Bạn có chắc chắn muốn xóa dữ liệu đang chọn?',
        'Xóa',
        (confirm) => this.handleClose(confirm, id, rowIndex)
      )
    }
  }

  handleClose(confirm, id, rowIndex) {
    const { data } = this.state
    if (confirm) {
      this._promotionOfferModel.delete(id)
      .then(() => {
        const cloneData = JSON.parse(JSON.stringify(data))
        cloneData.splice(rowIndex, 1)
        this.setState({
          data: cloneData,
        })
      })
      .catch(() => {
        window._$g.dialogs.alert(
          window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
        )
      })
    }
  }

  handleSubmitFilter = (data) => {
    let query = {...this.state.query}
    query = Object.assign(query, {...data});
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
  }

  handleChangeRowsPerPage = (event ) => {
    let query = {...this.state.query};
    query.itemsPerPage = event.target.value;
    query.page = 1;
    this.getData(query);
  }

  handleChangePage = (event, newPage) => {
    let query = {...this.state.query};
    query.page = newPage + 1;
    this.getData(query);
  }

  handleShowProducts(item) {
    let { promotion_offer_id: id } = item;
    if (id) {
      this._promotionOfferModel.read(id, {})
        .then(promotionOfferEnt => {
          this.setState({ promotionOfferEnt });
        })
      ;
    }
  }

  render() {
    let { handlePick } = this.props;

    const columns = [
      configIDRowTable("promotion_offer_id", "/promotion-offers/details/", this.state.query),
      {
        name: "promotion_offer_name",
        label: "Tên ưu đãi khuyến mại",
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "business_name",
        label: "Cơ sở phòng tập",
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "offer",
        label: "Ưu đãi khuyến mại",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            let item = this.state.data[tableMeta['rowIndex']];
            let text = ('' + value).trim();
            let showProducts = text.match(/Xem danh sách quà tặng/);
            return (
              <div className="">
                {(('' + item.offer_type) === '4' && showProducts) ? (
                  <Button color="link" className="p-0" onClick={() => this.handleShowProducts(item)}>{text}</Button>
                ) : text}
              </div>
            );
          }
        },
      },
      {
        name: "create_date",
        label: "Ngày tạo",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "is_active",
        label: "Kích hoạt",
        options: {
          filter: false,
          sort: false,
          customHeadRender: (columnMeta, handleToggleColumn) => {
            return (
              <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
                <div className="text-center">
                  {columnMeta.label}
                </div>
              </th>
            )
          },
          customBodyRender: (value, tableMeta, updateValue) => {
            let { controlIsActiveProps = {} } = this.props;
            return (
              <div className="text-center">
                <CheckAccess permission="SM_PROMOTIONOFFER_EDIT">
                  <FormControlLabel
                    label={value ? "Có" : "Không"}
                    value={value ? "Có" : "Không"}
                    control={
                    <Switch
                      color="primary"
                      checked={value === 1}
                      value={value}
                    />
                    }
                    onChange={event => {
                      let checked = ((1 * event.target.value) === 1 ? 0 : 1)
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].promotion_offer_id, tableMeta['rowIndex'])
                    }}
                    disabled={!(userAuth._isAdministrator() || this.state.data[tableMeta['rowIndex']].is_system === 0)}
                    {...controlIsActiveProps}
                  />
                </CheckAccess>
              </div>
            );
          }
        },
      },
      {
        name: "Thao tác",
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            let item = this.state.data[tableMeta['rowIndex']];
            let canEdit = true, canDel = true;
            if (!!item.is_system && !userAuth._isAdministrator()) {
              canEdit = canDel = false;
            }

            if (handlePick) {
              return (
                <div className="text-center mb-1">
                  <Checkbox
                    onChange={({ target }) => {
                      let item = this.state.data[tableMeta['rowIndex']];
                      let { _pickDataItems = {} } = this;
                      if (target.checked) {
                        _pickDataItems[item.promotion_offer_id] = item;
                      } else {
                        delete _pickDataItems[item.promotion_offer_id];
                      }
                      Object.assign(this, { _pickDataItems });
                    }}
                  />
                </div>
              );
            }
            return (
              <div className="text-center">
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].promotion_offer_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="SM_PROMOTIONOFFER_EDIT">
                  <Button color="primary" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].promotion_offer_id, tableMeta['rowIndex'])}
                    disabled={!canEdit}
                  >
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="SM_PROMOTIONOFFER_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].promotion_offer_id, tableMeta['rowIndex'])}
                    disabled={!canDel}
                  >
                    <i className="fa fa-trash" />
                  </Button>
                </CheckAccess>
              </div>
            );
          }
        }
      },
    ]

    const {totalItems, query, promotionOfferEnt} = this.state;
    const options = configTableOptions(totalItems, 0, query)

    return (
      <div id={`promotion-offer`} className="animated fadeIn">
      {/** start#Products */}{promotionOfferEnt
        ? (
          <div className="overlay animated fadeIn">
              <div className="overlay-box">
                <div className="overlay-toolbars">
                  <Button
                    color="danger" size="sm"
                    onClick={() => this.setState({ promotionOfferEnt: null })}
                  >
                    <i className="fa fa-window-close" />
                  </Button>
                </div>
                <Table size="sm" bordered striped hover responsive>
                  <thead>
                    <tr><th colSpan="5"><h4>Danh sách quà tặng</h4></th></tr>
                    <tr>
                      <th style={{ width: '1%' }}>#</th>
                      <th style={{ minWidth: '120px' }}>Mã quà tặng</th>
                      <th>Tên quà tặng</th>
                      <th>Model</th>
                      <th style={{ minWidth: '120px' }}>Nhà sản suất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotionOfferEnt.list_offer_gifts.map((item, idx) => {
                      return item ? (
                        <tr key={`list_offer_gift-${idx}`}>
                          <th scope="row" className="text-center">{idx + 1}</th>
                          <td className="">{item.product_code}</td>
                          <td className="">{item.product_name}</td>
                          <td className="">{item.model_name}</td>
                          <td className="">{item.manufacturer_name}</td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
        ) : null}
        {/** end#Products */}
        <Card className="animated fadeIn z-index-222 mb-3">
          <CardHeader className="d-flex">
            <div className="flex-fill font-weight-bold">
              Thông tin tìm kiếm
            </div>
            <div
              className="minimize-icon cur-pointer"
              onClick={() => this.setState(prevState => ({
                toggleSearch: !prevState.toggleSearch
              }))}
            >
              <i className={`fa ${this.state.toggleSearch ? 'fa-minus' : 'fa-plus'}`} />
            </div>
          </CardHeader>
          {this.state.toggleSearch && (
            <CardBody className="px-0 py-0">
              <div className="MuiPaper-filter__custom z-index-2">
                <PromotionOffersFilter
                  handleSubmit={this.handleSubmitFilter}
                  {...this.props.filterProps}
                />
              </div>
            </CardBody>
          )}
        </Card>
        {handlePick ? (<div className="text-right mb-1">
          <Button
            color="success" size="sm"
            className="col-12 max-w-110 ml-2 mobile-reset-width"
            onClick={() => {
              let { _pickDataItems } = this;
              handlePick(_pickDataItems);
            }}
          >
            <i className="fa fa-plus mr-1" />Chọn
          </Button>
        </div>) : null}
        {!handlePick ? (<div>
          <CheckAccess permission="SM_PROMOTIONOFFER_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm mới
            </Button>
          </CheckAccess>
          <CheckAccess permission="SM_PROMOTIONOFFER_EXPORT">
            <Button
              className="col-12 max-w-110 mb-2 mobile-reset-width"
              color="excel"
              size="sm"
              onClick={this.handleExport.bind(this)}
            >
              <i className="fa fa-download mr-1" />Xuất excel
            </Button>
          </CheckAccess>
        </div>) : null}
        <Card className="animated fadeIn">
          <CardBody className="px-0 py-0">
            <div className="MuiPaper-root__custom">
              {this.state.isLoading
                ? (
                  <div className="d-flex flex-fill justify-content-center mt-5 mb-5">
                    <CircularProgress />
                  </div>
                )
                : (
                  <div>
                    <MUIDataTable
                      data={this.state.data}
                      columns={columns}
                      options={options}
                    />
                    <CustomPagination
                      count={1 * totalItems}
                      rowsPerPage={1 * query.itemsPerPage}
                      page={(1 * query.page) - 1}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                  </div>
                )
              }
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default PromotionOffers
