import React, { PureComponent } from 'react';
// import { Field } from 'formik';
import { Row, Col, FormGroup, Label, Media, Input, Button, Spinner } from 'reactstrap';
// import Select from 'react-select';

// Component(s)

// Util(s)

// Model(s)
import UserModel from '../../models/UserModel';

/**
 * @class CampaignReviewLevelEdit
 */
export default class CampaignReviewLevelEdit extends PureComponent {

  /** @var {Object} */
  _userAuth = window._$g.userAuth;

  constructor(props) {
    super(props);

    // Init model(s)
    this._userModel = new UserModel();

    // Bind method(s)
    this.handleApprove = this.handleApprove.bind(this);

    // Init state
    this.state = {
      /** @var {Array} */
      approves: []
    };
  }

  handleApprove(crlItem, is_review) {
    let { handleApprove } = this.props;
    let { approves } = this.state;
    let fCrlItem = approves.find(_item => _item === crlItem);
    if (!fCrlItem) {
      approves = approves.concat([crlItem]);
    }
    this.setState({ approves });
    // Fire callback?!
    let callback = (err, data) => {
      let fCrlIdx = approves.findIndex(_item => _item === crlItem);
      if (fCrlIdx >= 0) {
        return window.location.reload();
        /* approves.splice(fCrlIdx, 1);
        this.setState({ approves: approves.concat([]) }); */
      }
      // Error?
      if (err) {
        window._$g.dialogs.alert(`Thao tác không thành công, bạn vui lòng thử lại!`);
      }
    };
    window._$g.dialogs.prompt(
      `Bạn muốn xác nhận ${is_review ? '' : 'không '}duyệt mức duyệt "${crlItem.campaign_review_level_name}"?`,
      (val) => {
        if (val) {
          return handleApprove(crlItem, is_review, callback);
        }
        callback();
      }
    );
  }

  render() {
    let { campaignEnt, noEdit } = this.props
    let { campaign_review_list = [] } = campaignEnt;
    let { approves } = this.state;
    let { _userAuth } = this;
    let lastCrlItem = null;

    return (
      <div className="campaign_lists">
      {campaign_review_list.map((crlItem, idx) => {
        let apvCrlItem = approves.find(_item => _item === crlItem);
        let isReviewed = crlItem.review_date; // Flag: da thao tac "duyet" hoac "khong duyet"
        let isReviewedYes = isReviewed && ('1' === ((1 * crlItem.is_review) + '')); // Flag: da "duyet"
        let isReviewedNo = isReviewed && ('0' === ((1 * crlItem.is_review) + '')); // Flag: khong "duyet"
        let canReview = !noEdit && !isReviewed && (_userAuth.user_name === crlItem.review_user);
        if (canReview && lastCrlItem) {
          canReview = lastCrlItem._isReviewed && lastCrlItem._isReviewedYes;
        }
        let html = (
          <Row key={`campaign_rlevel_${idx}`} className="mt-2">
            <Col xs={12}>
              <FormGroup row>
                <Label xs={12} sm={3}>
                  <b>{crlItem.campaign_review_level_name}</b>
                  <Media
                    object
                    src={this._userModel._entity.defaultPictureUrlStatic(crlItem.default_picture_url)}
                    alt="Avatar"
                    className="user-imgage radius-50-percent"
                  />
                  <span className="d-block text-center">{crlItem.review_user_full_name} [{crlItem.review_user}]</span>
                </Label>
                <Col xs={12} sm={6}>
                  <Input
                    type="textarea"
                    placeholder="Ghi chú"
                    defaultValue={crlItem.note}
                    onChange={(evt) => Object.assign(crlItem, { note: evt.target.value })}
                    rows={3}
                    disabled={!!apvCrlItem || !canReview}
                  />
                </Col>
                <Col xs={12} sm={3} className="text-center mt-2">
                  {isReviewedYes ? (<div>
                    <Button color="info" disabled>Đã duyệt</Button>
                    <p className="mt-2">Duyệt ngày: {crlItem.review_date}</p>
                  </div>) : null}
                  {isReviewedNo ? (<div>
                    <Button color="warning" disabled>Đã không duyệt</Button>
                    <p className="mt-2">Không duyệt ngày: {crlItem.review_date}</p>
                  </div>) : null}
                  {!isReviewed ? (<div>
                    <Button
                      className="mr-2"
                      color="primary"
                      disabled={!!apvCrlItem || !canReview}
                      onClick={() => this.handleApprove(crlItem, 1)}
                    >
                      Duyệt
                    </Button>
                    <Button
                      className="mr-2"
                      color="warning"
                      disabled={!!apvCrlItem || !canReview}
                      onClick={() => this.handleApprove(crlItem, 0)}
                    >
                      Không duyệt
                    </Button>
                    <div className="mt-2">{apvCrlItem ? <Spinner color="primary" /> : null}</div>
                  </div>) : null}
                </Col>
              </FormGroup>
            </Col>
          </Row>
        );
        Object.assign(crlItem, {
          _isReviewed: isReviewed,
          _isReviewedYes: isReviewedYes,
          _isReviewedNo: isReviewedNo,
          _canReview: canReview
        });
        lastCrlItem = crlItem;
        return html;
      })}
      </div>
    );
  }
}
