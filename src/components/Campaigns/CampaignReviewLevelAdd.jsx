import React, { PureComponent } from 'react';
import { Field } from 'formik';
import { Row, Col, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';

// Component(s)
import Loading from '../Common/Loading';

// Util(s)

// Model(s)

/**
 * @class CampaignReviewLevelAdd
 */
export default class CampaignReviewLevelAdd extends PureComponent {
  /* constructor(props) {
    super(props);

    // Init model(s)

    // Bind method(s)

    // Init state
    // this.state = {};
  } */

  render() {
    let {
      campaignType
    } = this.props

    if (campaignType) {
      let { is_auto_review, campaign_rls } = campaignType;
      is_auto_review = !!(1 * is_auto_review);
      return (
        <div className="campaign_lists">
          {is_auto_review ? (<b className="text-info">Loại chiến dịch tự động duyệt.</b>) : null}
          {(!is_auto_review && campaign_rls) ? (
            <Row>
            {campaign_rls.map((crlEnt, idx) => {
              let { users = [] } = crlEnt;
              let options = users.map(({ user_id: value, ...item }) => ({ label: `${item.full_name} [${item.user_name}]`, value, ...item }));
              let placeholder = (options && options[0].label) || '';
              let _user = (options && options[0]);
              Object.assign(crlEnt, { _user });
              return (
                <Col key={`campaign_rlevel_${idx}`} xs={12} sm={4}>
                  <FormGroup row>
                    <Label xs={12}>{crlEnt.campaign_rl_name}</Label>
                    <Col xs={12}>
                      <Field
                        name="is_active"
                        render={({ field /* _form */ }) => <Select
                          // name=""
                          onChange={(changeValue) => {
                            let _user = users.find(user => ('' + changeValue.value) === ('' + user.user_id));
                            Object.assign(crlEnt, { _user });
                          }}
                          isSearchable={true}
                          placeholder={placeholder}
                          defaultValue={_user}
                          options={options}
                        />}
                      />
                    </Col>
                  </FormGroup>
                </Col>
              );
            })}
            </Row>
          ) : null}
          {(!is_auto_review && campaign_rls && !campaign_rls.length) ? (
            <b className="text-danger">Loại chiến dịch chưa có thông tin mức duyệt.</b>
          ) : null}
        </div>
      );
    }
    return (
      <div className="campaign_lists d-flex">
        {(null === campaignType)
          ? <Loading />
          : <b className="text-danger">Bạn vui lòng chọn "Loại chiến dịch" để thực hiện.</b>
        }
      </div>
    );  
  }
}
