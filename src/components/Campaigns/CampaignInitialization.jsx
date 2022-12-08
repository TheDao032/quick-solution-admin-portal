import React, { PureComponent } from 'react';
import {
  CustomInput,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Table,
} from 'reactstrap';
import Select from 'react-select';
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'

// Component(s)
// Model(s)

class CampaignInitialization extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <strong>
                  Khởi tạo loại chiến dịch
                </strong>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col xs={12}>
                      <b className="underline">Thông tin chiến dịch</b>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col xs={6}>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            Tên loại chiến dịch<span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Input
                              name="text"
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            Quyền thêm mới
                          </Label>
                          <Col sm={8}>
                            <Select
                              isSearchable={true}
                              placeholder={"-- Chọn --"}
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            Thứ tự<span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Input
                              type="number"
                              min={0}
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            Quyền chỉnh sửa
                          </Label>
                          <Col sm={8}>
                            <Select
                              isSearchable={true}
                              placeholder={"-- Chọn --"}
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            Mô tả loại chiến dịch<span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Input type="textarea" name="description" id="description" />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            Quyền sửa tất cả
                          </Label>
                          <Col sm={8}>
                            <Select
                              isSearchable={true}
                              placeholder={"-- Chọn --"}
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            QUyền xóa
                          </Label>
                          <Col sm={8}>
                            <Select
                              isSearchable={true}
                              placeholder={"-- Chọn --"}
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <Row>
                          <Label sm={4}>
                            QUyền xóa tất cả
                          </Label>
                          <Col sm={8}>
                            <Select
                              isSearchable={true}
                              placeholder={"-- Chọn --"}
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup>
                        <Row>
                          <Label sm={4} />
                          <Col sm={8} className="d-flex">
                            <CustomInput type="switch" id="is_system" name="is_system" label="Kích hoạt" />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col xs={12}>
                      <b className="underline">Thông tin mức duyệt</b>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col xs={12}>
                      <CustomInput type="switch" id="is_auto" name="is_auto" label="Tự động duyệt" />
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col xs={12}>
                      <div className="campaign_reAdd">
                        <Table size="sm" bordered striped hover>
                          <thead>
                            <tr>
                              <th>{window._$g._('Tên mức duyệt')}</th>
                              <th>{window._$g._('Thứ tự duyệt')}</th>
                              <th>{window._$g._('Mô tả')}</th>
                              <th>{window._$g._('Công ty')}</th>
                              <th>{window._$g._('Phòng ban')}</th>
                              <th>{window._$g._('Người duyệt')}</th>
                              <th>{window._$g._('Mức duyệt cuối')}</th>
                              <th style={{ width: '1%' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Mức duyệt A</td>
                              <td className="text-center">1</td>
                              <td>Chỉ có một mức duyệt</td>
                              <td>
                                <Select
                                  isSearchable={true}
                                  placeholder={"Chọn"}
                                />
                              </td>
                              <td>
                                <Select
                                  isSearchable={true}
                                  placeholder={"Chọn"}
                                />
                              </td>
                              <td>
                                <Select
                                  isSearchable={true}
                                  placeholder={"Chọn"}
                                />
                              </td>
                              <td className="text-center">
                                <input type="checkbox" value="" name="" />
                              </td>
                              <td className="text-center">X</td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={8}>
                                <Button className="col-12 max-w-110" color="success" size="sm">
                                  <i className="fa fa-plus" />
                                  <span className="ml-1">Thêm mới</span>
                                </Button>
                              </td>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col xs={12}>
                      <div className="d-flex button-list-default">
                        <Button color="primary" className="mr-3">
                          <i className="fa fa-plus" />
                          <span className="ml-1">Lưu</span>
                        </Button>
                        <Button
                          color="success"
                          className="mr-3"
                        >
                          <i className="fa fa-edit" />
                          <span className="ml-1">Lưu &amp; Đóng</span>
                        </Button>
                        <Button>
                          <i className="fa fa-close" />
                          <span className="ml-1">Đóng</span>
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default CampaignInitialization;
