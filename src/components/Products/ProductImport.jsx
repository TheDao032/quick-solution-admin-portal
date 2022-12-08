import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button, Row, Col } from 'reactstrap'
import Dropzone from 'react-dropzone'

// Component (s)
import { CheckAccess } from '../../navigation/VerifyAccess'


class ProductImport extends React.PureComponent{
    constructor(props){
        super(props);
    }

    render(){
        let { handleDownloadSampleFile, handleActionClose } = this.props;
        return(
            <div className="animated fadeIn">
                <Row>
                    <Col xs={12}>
                        <Card>
                            <CardHeader>
                                <b>Nhập file excel</b>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs={12}>
                                        <span>Chú ý</span>
                                    </Col>
                                    <Col xs={12}>
                                        <ul className="pl-4">
                                            <li>Mã sản phẩm phải là duy nhất, không được trùng lặp.</li>
                                            <li>Chuyển đổi file nhập dưới dạng .XLS trước khi tải dữ liệu.</li>
                                            <li>Tải file mẫu sản phẩm <span onClick={() => handleDownloadSampleFile()} className="text-primary link-download-sample-file">tại đây</span> (file excel danh sách sản phẩm mẫu)</li>
                                            <li>Tải file mẫu sản phẩm là dịch vụ <span onClick={() => handleDownloadSampleFile(true)} className="text-primary link-download-sample-file">tại đây</span> (file excel danh sách sản phẩm là dịch vụ mẫu)</li>
                                        </ul>
                                    </Col>
                                    <Col xs={12} sm={{size: 10, offset: 1}} md={{ size: 10, offset: 1 }}>
                                        <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
                                            {({getRootProps, getInputProps}) => (
                                                <section>
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <p className="dropzone-product-upload text-center font-weight-bold"><i class="fa fa-upload mr-1"></i>Kéo thả file hoặc tải lên từ thiết bị</p>
                                                </div>
                                                </section>
                                            )}
                                        </Dropzone>
                                    </Col>
                                </Row>
                                <Row className="mt-4">
                                    <Col xs={12} className="text-right">
                                        <CheckAccess permission="MD_PRODUCT_IMPORT">
                                            <Button
                                                key="buttonSave"
                                                type="submit"
                                                color="primary"
                                                onClick={handleActionClose}
                                                className="mr-2 btn-block-sm">
                                                <i className="fa fa-save mr-2" /> Nhập file
                                            </Button>
                                        </CheckAccess>
                                        <Button  onClick={handleActionClose} className="btn-block-sm mt-md-0 mt-sm-2">
                                            <i className="fa fa-close" />
                                            <span className="ml-1">Đóng</span>
                                        </Button>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default ProductImport;