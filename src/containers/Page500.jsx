import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  // Button,
  // Input,
  // InputGroup,
  // InputGroupAddon,
  // InputGroupText,
} from "reactstrap";

class Page500 extends Component {

  isAccessDenined() {
    let { match: { params: { error } } } = this.props;
    return ('access_denined' === error);
  }

  _getTexts() {
    let { code, title, content } = this.props;
    let texts = {
      code: code || "500",
      title: title || "Houston, we have a problem!",
      content: content || "The page you are looking for is temporarily unavailable.",
    };
    //
    if (this.isAccessDenined()) {
      Object.assign(texts, {
        title: title || "Truy cập bị từ chối",
        content: content || "Bạn không có quyền truy cập tài nguyên này.",
        isAccessDenined: true,
      });
    }
    return texts;
  }
  
  render() {
    let texts = this._getTexts();
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <span className="clearfix">
                <h1 className="float-left display-3 mr-4">{texts.code}</h1>
                <h4 className="pt-3">{texts.title}</h4>
                <p className="text-muted float-left">
                  {texts.content} {texts.isAccessDenined ? <Link to="/logout">Đăng nhập lại.</Link> : null}
                </p>
              </span>
              {/* <InputGroup className="input-prepend">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fa fa-search"></i>
                  </InputGroupText>
                </InputGroupAddon>
                <Input size="16" type="text" placeholder="What are you looking for?" />
                <InputGroupAddon addonType="append">
                  <Button color="info">Search</Button>
                </InputGroupAddon>
              </InputGroup> */}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Page500;
