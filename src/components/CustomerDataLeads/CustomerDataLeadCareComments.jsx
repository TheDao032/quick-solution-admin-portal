import React, { PureComponent } from "react";
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
  Alert,
  Col,
  Row,
  Button,
  Form,
  // FormGroup,
  // Label,
  Input,
  Media,
} from "reactstrap";

// Assets
import "./styles.scss";

// Component(s)
import Loading from '../Common/Loading';
import { CheckAccess } from '../../navigation/VerifyAccess'

// Util(s)
// import { mapDataOptions4Select } from '../../utils/html';
import { readFileAsBase64, fileToObj } from '../../utils/html';
// import * as utils from '../../utils';

// Model(s)
import CustomerDataLeadModel from "../../models/CustomerDataLeadModel";
import DataLeadsCommentModel from "../../models/DataLeadsCommentModel";

// @var UserEntity
const userAuth = window._$g.userAuth;

/**
 * @class CustomerDataLeadCareComments
 */
export default class CustomerDataLeadCareComments extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._dataLeadCommentModel = new DataLeadsCommentModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleCommentFileChange = this.handleCommentFileChange.bind(this);

    // Init state
    // +++
    // let { customerDataLeadEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Object} */
      commentFile: null,
      /** @var {Array} */
      comments: {
        items: null,
        itemsPerPage: 5,
        page: 1,
        totalItems: 0,
        totalPages: 0
      },
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  /**
   * 
   * @return {Object}
   */
  getInitialValues() {
    // let { customerDataLeadEnt } = this.props;
    let values = Object.assign(
      this._dataLeadCommentModel.fillable(), {}
    );
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // if (key === '') {}
    });

    // Return;
    return values;
  }

  _getBundleDataComments(skipSetState) {
    let { customerDataLeadEnt, taskEnt } = this.props;
    let { comments: { page, itemsPerPage } } = this.state;
    let data = { page, itemsPerPage };
    return this._dataLeadCommentModel.getList(Object.assign(data, {
      data_leads_id: customerDataLeadEnt.data_leads_id,
      task_id: taskEnt.task_id,
    }))
      .then(comments => {
        !skipSetState && this.setState({ comments });
        return comments;
      });
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    // let { customerDataLeadEnt, taskEnt } = this.props;
    let bundle = {};
    let all = [
      this._getBundleDataComments(true)
        .then(data => (bundle["comments"] = data))
    ];
    all.length && await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ))
    ;
    //
    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data).filter(_i => !!_i);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    content_comment: Yup.string()
      .required("Nội dung comment là bắt buộc."),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    // +++
    Object.assign(values, {
      // +++
    });
  }

  handleFormikSubmit(values, formProps) {
    let { customerDataLeadEnt, taskEnt } = this.props;
    let { commentFile } = this.state;
    // let {} = this.state;
    let { setSubmitting } = formProps;
    let alerts = [];
    // Build form data
    let file_attactments = [];
    commentFile && file_attactments.push({
      attachment_name: commentFile.name,
      attachment_path: commentFile.dataBase64,
    });
    // +++
    let formData = Object.assign({}, values, {
      data_leads_id: customerDataLeadEnt.data_leads_id,
      task_id: taskEnt.task_id,
      user_name_comment: userAuth.user_name,
      file_attactments
    });
    // console.log('formData: ', formData);
    //
    let apiCall = this._dataLeadCommentModel.create(formData);
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        // Chain
        return data;
      })
      .catch(apiData => { // NG
        let { errors, statusText, message } = apiData;
        let msg = [`<b>${statusText || message}</b>`].concat(errors || []).join('<br/>');
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        setSubmitting(false);
        //
        if (!alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }));
      })
    ;
  }

  handleFormikReset() {
    // let { customerDataLeadEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: [],
      commentFile: null
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  handleCommentFileChange(event) {
    let { target } = event;
    let fileZero = target.files[0];
    if (fileZero) {
      readFileAsBase64(target, {
        // option: validate input
        validate: (file) => {
          // Check file's size in bytes
          if ('size' in file) {
            let maxSize = 4; /*4mb*/
            if ((file.size / 1024 / 1024) > maxSize) {
              return `Dung lượng tập tin tối đa là: ${maxSize}mb.`;
            }
          }
        }
      })
        .then(dataBase64 => {
          let commentFile = Object.assign(fileToObj(fileZero), { dataBase64 });
          this.setState({ commentFile });
        })
        .catch(err => {
          window._$g.dialogs.alert(window._$g._(err.message));
        })
      ;
    }
  }

  render() {
    let {
      ready,
      alerts,
      comments,
      commentFile
    } = this.state;
    let { noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <Row>
        <CheckAccess permission="CRM_CUSDATALEADSDETAIL_COMT">
          <Col xs={12}>
            <Row className="no-gutters">
              <Col xs={12}><b className="underline">Comment</b></Col>
            </Row>
            {/* general alerts */}
            {alerts.map(({ color, msg }, idx) => {
              return (
                <Alert className="mt-3 mb-0" key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })}>
                  <span dangerouslySetInnerHTML={{ __html: msg }} />
                </Alert>
              );
            })}
            <Formik
              initialValues={initialValues}
              validationSchema={this.formikValidationSchema}
              // validate={this.handleFormikValidate}
              // validateOnBlur={false}
              validateOnChange={false}
              onSubmit={this.handleFormikSubmit}
            >{(formikProps) => {
              let {
                // values,
                // errors,
                // status,
                // touched, handleChange, handleBlur,
                submitForm,
                resetForm,
                handleSubmit,
                handleReset,
                // isValidating,
                isSubmitting,
                /* and other goodies */
              } = (this.formikProps = formikProps);
              // [Event]
              this.handleFormikBeforeRender({ initialValues });
              // Render
              return (
                <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                  <Row>
                    <Col xs={12}>
                      <Field
                        name="content_comment"
                        render={({ field /* _form */ }) => <Input
                          {...field}
                          onBlur={null}
                          className="my-3"
                          type="textarea"
                          id={field.name}
                          placeholder=""
                          rows={3}
                          maxLength={2000}
                          disabled={isSubmitting || noEdit}
                        />}
                      />
                      <ErrorMessage name="content_comment" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                      <div className="text-right mb-3">
                        <span className="hidden ps-relative">
                          <span>
                            <i className="fa fa-link" />{commentFile ? (<i>{` ${commentFile.name} `}</i>) : ''}
                          </span>
                          <Input
                            type="file"
                            id="comment_file"
                            className="input-overlay"
                            onChange={this.handleCommentFileChange}
                            disabled={isSubmitting || noEdit}
                          />
                        </span>
                        {commentFile ? (
                          <Button color="danger" size="sm" className="" onClick={() => this.setState({ commentFile: null })}>x</Button>
                        ) : null}
                        <Button
                          color="primary"
                          size="sm"
                          className="ml-2"
                          disabled={isSubmitting || noEdit}
                          onClick={() => submitForm()}
                        >
                          Gửi
                        </Button>
                        <Button
                          color="success"
                          size="sm"
                          className="ml-2"
                          disabled={isSubmitting || noEdit}
                          onClick={() => resetForm()}
                        >
                          Hủy
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              );
            }}</Formik>
          </Col>
        </CheckAccess>
        <CheckAccess permission="CRM_CUSDATALEADSDETAIL_HISTORY">
          <Col xs={12}>
            <div className="comment-box clearfix">
              <div className="comment-box-label p-1">
                <b className="underline">Comment</b>
              </div>
              <div className="comment-box-body p-2">
              {(() => {
                let { items } = (comments || {});
                if (null === items) {
                  return <Loading />;
                }
                return items.map((item, idx) => {
                  let { file_attactments = [] } = item;
                  return (
                    <Media key={`comment_${idx}`} className="mb-3">
                      <Media left href="#" className="mr-2">
                        <Media object src={item.default_picture_url_commment} alt="" className="user-imgage radius-50-percent" />
                      </Media>
                      <Media body>
                        <Media heading>
                          [{item.user_name_comment}] {item.user_full_name_comment}
                        </Media>
                        <p>{item.content_comment}</p>
                        <p>{file_attactments.map((attach, idx) => {
                          return (
                            <a
                              key={`attach_${idx}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              href={attach.attachment_path || "#"}
                              className="d-inline-block mr-3"
                            >
                              <i className="fa fa-file" /> {attach.attachment_name}
                            </a>
                          );
                        })}</p>
                      </Media>
                    </Media>
                  );
                })
              })()}
              </div>
              <div className="comment-box-footer text-right p-2">
              {(() => {
                let {
                  // itemsPerPage,
                  // totalItems,
                  items,
                  page,
                  totalPages
                } = (comments || {});
                let minPage = 1;
                let maxPage = Math.max(minPage, totalPages);
                return (
                  <div className="">
                    {page}/{maxPage}
                    <Button
                      color="primary"
                      size="sm"
                      className="ml-2"
                      disabled={1 * page <= minPage || (null === items)}
                      onClick={() => {
                        page = Math.max(minPage, (1 * page) - 1);
                        this.setState(
                          { comments: { ...comments, page, items: null } },
                          () => this._getBundleDataComments()
                        );
                      }}
                    >
                      <i className="fa fa-arrow-left" />
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      className="ml-2"
                      disabled={1 * page >= maxPage || (null === items)}
                      onClick={() => {
                        page = Math.min(maxPage, (1 * page) + 1);
                        this.setState(
                          { comments: { ...comments, page, items: null } },
                          () => this._getBundleDataComments()
                        );
                      }}
                    >
                      <i className="fa fa-arrow-right" />
                    </Button>
                  </div>
                );
              })()}
              </div>
            </div>
          </Col>
        </CheckAccess>
      </Row>
    );
  }
}
