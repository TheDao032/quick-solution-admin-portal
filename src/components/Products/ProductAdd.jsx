import React, { PureComponent } from "react";
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
	Alert,
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
	CustomInput,
	Table,
	InputGroupAddon,
	InputGroup,
} from "reactstrap";
import Select, { components } from 'react-select';
import { FormControlLabel, RadioGroup, Radio } from '@material-ui/core';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

// Assets
import './styles.scss'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import RichEditor from '../Common/RichEditor';
// +++
import Businesses from '../Businesses/Businesses';

// Model(s)
import ProductModel from "../../models/ProductModel";
import CompanyModel from '../../models/CompanyModel';
import ProductCategoryModel from '../../models/ProductCategoryModel';
import ManufacturerModel from '../../models/ManufacturerModel';
import ProductModelModel from '../../models/ProductModelModel';
import OriginModel from '../../models/OriginModel';
import PTLevelModel from '../../models/PTLevelModel';
import ProductAttributeModel from '../../models/ProductAttributeModel';
import UnitModel from '../../models/UnitModel';
import StatusProductModel from '../../models/StatusProductModel';

// Util(s)
import {
	mapDataOptions4Select, cdnPath, readFileAsBase64, validateInputNumber, formatTimeHour, groupByParams,
	readImageBase64CallBack,
} from '../../utils/html';


/**
 * @class ProductAdd
 */
export default class ProductAdd extends PureComponent {

	/** @var {Object} */
	formikProps = null;

	constructor(props) {
		super(props);

		// Init model(s)
		this._productModel = new ProductModel();
		this._companyModel = new CompanyModel();
		this._productCategoryModel = new ProductCategoryModel();
		this._manufacturerModel = new ManufacturerModel();
		this._productModelModel = new ProductModelModel();
		this._originModel = new OriginModel();
		// this._ptlevelModel = new PTLevelModel();
		this._productAttributeModel = new ProductAttributeModel();
		this._unitModel = new UnitModel();
		this._statusProductModel = new StatusProductModel();

		// Bind method(s)
		this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
		this.handleFormikReset = this.handleFormikReset.bind(this);
		this.handleFormikValidate = this.handleFormikValidate.bind(this);


		// +++
		this.state = {
			/** @var {Boolean} */
			isCheckService: false,
			/** @var {Number} */
			_id: 0,
			/** @var {Array} */
			alerts: [],
			/** @var {Boolean} */
			ready: false,
			/** @var {Array} */
			productCategories: [
				{ label: "-- Chọn --", value: "" },
			],
			/** @var {Array} */
			statusProducts: [
				{ label: "-- Chọn --", value: "" },
			],
			/** @var {Array} */
			manufacturers: [
				{ label: "-- Chọn --", value: "" },
			],
			/** @var {Array} */
			productModels: [
				{ label: "-- Chọn --", value: "" },
			],
			/** @var {Array} */
			origins: [
				{ label: "-- Chọn --", value: "" }
			],
			// /** @var {Array} */
			// ptlevels: [
			// 	{ label: "-- Chọn --", value: 0 }
			// ],
			/** @var {Array} */
			productAttributes: [
				{ name: "Chọn thuộc tính", id: "" }
			],
			/** @var {Array} */
			units: [
				{ label: "dvt", value: "" }
			],
			/** @var {Boolean} */
			isOpen: false,
			/** @var {String|Number} */
			photoIndex: 0,
			/** @var {Boolean} */
			willShowBusinesses: false,
			/** @var {Array} */
			proAttrValues: [
				{ label: "-- Chọn --", value: "", attribute_values: "-- Chọn --", product_attribute_id: "" }
			],
			values_in_gym: 30,
			values_in_pt: 30,
			values_time_per_session: 1,
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

	formikValidationSchema = Yup.object().shape({
		product_code: Yup.string()
			.required("Mã sản phẩm là bắt buộc."),
		product_name: Yup.string()
			.required("Tên sản phẩm là bắt buộc.")
			.max(400, "Tên sản phẩm tối đa 400 ký tự."),
		product_name_show_web: Yup.string()
			.required("Tên hiển thị trên web là bắt buộc.")
			.max(120, "Tên hiển thị trên web tối đa 120 ký tự."),
		short_description: Yup.string()
			.required("Mô tả ngắn gọn sản phẩm là bắt buộc.")
			.max(400, "Mô tả ngắn gọn tối đa 400 ký tự."),
		product_category_id: Yup.string()
			.required("Danh mục sản phẩm là bắt buộc."),
		businesses: Yup.array()
			.required("Chi nhanh là bắt buộc."),
		lot_number: Yup.string()
			.max(120, "Số lô tối đa 120 ký tự."),
		product_imei: Yup.string()
			.max(120, "Số IMEI tối đa 120 ký tự."),
	});

	/** @var {String} */
	_btnType = null;

	getInitialValues() {
		let { isCheckService } = this.state
		let { productEnt } = this.props;
		let values
		if (!isCheckService) {
			values = Object.assign(
				{}, this._productModel.fillableProduct(),
			);
		} else {
			values = Object.assign(
				{}, this._productModel.fillableService(),
			);
		}
		//apply with day, month or year with product is service
		// values.apply_with = productEnt && productEnt.is_service ? (productEnt.is_year ? 'year' : (productEnt.is_month ? 'month' : 'day')) : null;

		if (productEnt) {
			productEnt.pictures = productEnt.pictures.map(picture => Object.assign(picture, { picture_url: cdnPath(picture.picture_url) }))
			//sort product pictures with default is first
			if (productEnt.pictures.length > 1 && !productEnt.pictures[0].is_default) {
				//clone pictures 
				let pictures = JSON.parse(JSON.stringify(productEnt.pictures));
				values.pictures = [...pictures.filter(p => (1 * p.is_default) === 1), ...pictures.filter(p => (1 * p.is_default) === 0)];
			}
			if ((1 * productEnt.is_service) === 1) {
				values = Object.assign({}, {
					is_amount_days_is_session: (1 * productEnt.is_amount_days) === 1 ? 0 : 1,
				});
				Object.assign(values, productEnt, {
					values_in: parseInt((1 * productEnt.values_in) / 30),
					time_limit: parseInt((1 * productEnt.time_limit) / 30),
					time_per_session: parseInt((1 * productEnt.time_per_session) / 1),
					from_hour: formatTimeHour(productEnt.from_hour),
					to_hour: formatTimeHour(productEnt.to_hour),
				});
			} else {
				Object.assign(values, productEnt, {
					values_in: productEnt.values_in,
				});
			}
		}
		// Format
		Object.keys(values).forEach(key => {
			if (null === values[key] && key !== 'status_product_id') {
				values[key] = "";
			}
			// if (key === '') {}
		});
		// Return;
		return values;
	}
	/**
	 * Goi API, lay toan bo data lien quan,...
	 */
	async _getBundleData() {
		let { productEnt } = this.props;
		let bundle = {};
		let all = [
			// @TODO
			this._productCategoryModel.getOptionsForCreate({ is_active: 1 })
				.then(data => (bundle['productCategories'] = mapDataOptions4Select(data))),
			this._manufacturerModel.getOptions({ is_active: 1 })
				.then(data => (bundle['manufacturers'] = mapDataOptions4Select(data))),
			this._productModelModel.getOptions({ is_active: 1 })
				.then(data => (bundle['productModels'] = mapDataOptions4Select(data))),
			this._statusProductModel.getOptions({ is_active: 1 })
			.then(data => (bundle['statusProducts'] = mapDataOptions4Select(data))),
			this._originModel.getOptions({ is_active: 1 })
				.then(data => (bundle['origins'] = mapDataOptions4Select(data))),
			// this._ptlevelModel.getOptions({ is_active: 1 })
            //     .then(data => (bundle['ptlevels'] = mapDataOptions4Select(data))),
		];

        if(productEnt && productEnt.product_id){
            all.push(
                this._productAttributeModel.getOptions({parent_id: productEnt.product_category_id})
                .then(data => (bundle['productAttributes'] = mapDataOptions4Select(data)))
            )
        }
		await Promise.all(all)
			.catch(err => window._$g.dialogs.alert(
				window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
				() => window.location.reload()
			));
		//
		Object.keys(bundle).forEach((key) => {
			let data = bundle[key];
			let stateValue = this.state[key];
			if (data instanceof Array && stateValue instanceof Array) {
				data = [stateValue[0]].concat(data);
			}
			bundle[key] = data;
		});
		return bundle;
	}

	/** GET Product attributes by product_category_id */
	handleChangeProductCategory = (changeItem, field) => {
			let { productAttributes } = this.state;
            let { value: parent_id } = changeItem;
            let { values } = this.formikProps;
			if (parent_id && (1 *values.is_service) === 0) {
			  this._productAttributeModel.getOptions({ parent_id })
				.then(data => {
                    productAttributes = [productAttributes[0]].concat(mapDataOptions4Select(data));
                    if(values.attribute_values.length == 0) {
                        values.attribute_values.push({product_attribute_id: "", product_attribute_value_id: "", unit_id: ""});
                    }
				    this.setState({ productAttributes });
				});
			}
			return field.onChange({
			  target: {
				type: "select",
				name: "product_category_id",
				value: changeItem.value,
			  }
			})
	}

	handleSubmit(btnType) {
		// let { submitForm } = this.formikProps;
		this._btnType = btnType;
	}

	handleFormikSubmit(values, formProps) {
		let { isCheckService } = this.state
		let { productEnt } = this.props;
		let { setSubmitting, setErrors } = formProps;
		let willRedirect = false;
		let alerts = [];

		if (values.is_service) {
			if (!values.is_session && !values.is_amount_days) {
				window._$g.dialogs.alert(
					window._$g._('Chưa chọn gói giá trị theo ngày/buổi!!'),
					window._$g._('Lỗi')
				)
				setSubmitting(false);
				return
			}
		} else {
			let checkProductAttributes = values.attribute_values.find(({ product_attribute_id }) => !product_attribute_id);
			if (values.attribute_values.length && checkProductAttributes) {
				window._$g.dialogs.alert(
					window._$g._('Chưa chọn thuộc tính cho sản phẩm!!'),
					window._$g._('Lỗi')
				)
				setSubmitting(false);
				return
			}

			let checkProductAttributesValue = values.attribute_values.find(({ attribute_values }) => !attribute_values);
			if (values.attribute_values.length && checkProductAttributesValue) {
				window._$g.dialogs.alert(
					window._$g._('Chưa chọn giá trị cho sản phẩm!!'),
					window._$g._('Lỗi')
				)
				setSubmitting(false);
				return
			}
		}

		// Build form data
		// +++

		let formData = Object.assign({}, values)
		if (values.is_service) {
			formData = Object.assign(values, {
				is_active: (1 * values.is_active),
				is_service: values.is_service ? 1 : 0,
				is_show_web: values.is_show_web ? 1 : 0,
				is_sell_well: values.is_sell_well ? 1 : 0,
				is_high_light: values.is_high_light ? 1 : 0,
				is_amount_days: values.is_amount_days ? 1 : 0,
				is_session: values.is_session ? 1 : 0,
				is_show_home: values.is_show_home ? 1 : 0,
				is_tranfer: values.is_tranfer ? 1 : 0,
				is_freeze: values.is_freeze ? 1 : 0,
				is_product_off_peak: values.is_product_off_peak ? 1 : 0,
				is_apply_mon: values.is_apply_mon ? 1 : 0,
				is_apply_tu: values.is_apply_tu ? 1 : 0,
				is_apply_we: values.is_apply_we ? 1 : 0,
				is_apply_th: values.is_apply_th ? 1 : 0,
				is_apply_fr: values.is_apply_fr ? 1 : 0,
				is_apply_sa: values.is_apply_sa ? 1 : 0,
				is_apply_sun: values.is_apply_sun ? 1 : 0,
				from_hour: values.from_hour ? 1 * values.from_hour.toString().replace(/\D/g, '') : null,
				to_hour: values.to_hour ? 1 * values.to_hour.toString().replace(/\D/g, '') : null,
			});
			if (values.is_amount_days) {
				formData = Object.assign(values, {
					values_in: values.values_in * this.state.values_in_gym,
				});
			} else {
				formData = Object.assign(values, {
					time_limit: values.time_limit * this.state.values_in_pt,
					time_per_session: values.time_per_session * this.state.values_time_per_session
				});
			}
		} else {
			formData = Object.assign({}, values, {
				is_active: (1 * values.is_active),
				is_service: values.is_service ? 1 : 0,
				is_show_web: values.is_show_web ? 1 : 0,
				is_sell_well: values.is_sell_well ? 1 : 0,
				is_high_light: values.is_high_light ? 1 : 0,
				is_show_home: values.is_show_home ? 1 : 0,
			});
		}

		//delete 
		//

		let productId = (productEnt && productEnt.id()) || formData[this._productModel.primaryKey];
		let apiCall = productId
			? this._productModel.update(productId, formData)
			: this._productModel.create(formData, isCheckService)
			;
		apiCall
			.then(data => { // OK
				window._$g.toastr.show('Lưu thành công!', 'success');
				if (this._btnType === 'save_n_close') {
					willRedirect = true;
					return window._$g.rdr('/products');
				}
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
				if (!productEnt && !willRedirect && !alerts.length) {
					return this.handleFormikReset();
				}
				this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
			})
			;
	}

	handleFormikReset() {
		// let { campaignEnt } = this.props;
		this.setState(state => ({
			ready: false,
			alerts: [],
		}));
		// Get bundle data --> ready data
		(async () => {
			let bundle = await this._getBundleData();
			this.setState({ ...bundle, ready: true });
		})();
		//.end
	}

	handleFormikValidate(values) {
		// Trim string values,...
		Object.keys(values).forEach(prop => {
		(typeof values[prop] === "string") && (values[prop] = values[prop].trim());
	  });
  
	  let errors = {};
	  let { manufacturer_id, is_service } = values;
	  if (!is_service) {
			if (!manufacturer_id) {
				let errMsg = "Hãng sản xuất là bắt buộc.";
				errors.manufacturer_id = errMsg;
		  }
	  }

	  return errors;
	}

	handleToggleBU = () => {
		this.setState(prev => ({
			willShowBusinesses: !prev.willShowBusinesses
		}))
	}

	handleSelectBusiness = (businessesSelected = {}) => {
		let { values, setValues } = this.formikProps;
		let businesses = [...values.businesses];
		Object.keys(businessesSelected).forEach(k => {
			if(businesses.findIndex(bus => bus.business_id == k) === -1) businesses.push(businessesSelected[k])
		})
		setValues(Object.assign(values, { "businesses": businesses }));
		this.setState({ willShowBusinesses: false });
	}

	handleRemoveBusiness = (idx) => {
		let { values, setValues } = this.formikProps;
		let businesses = JSON.parse(JSON.stringify(values.businesses));
		businesses.splice(idx, 1);
		setValues(Object.assign(values, { "businesses": businesses }));
	}

	handleChangeDefaultPicture = (e, index) => {
		let { values, setValues } = this.formikProps;
		let pictures = JSON.parse(JSON.stringify(values.pictures));
		if (e.target.checked) {
			//swap
			const tmp = Object.assign(pictures[index], { is_default: 1 });
			pictures[index] = Object.assign(pictures[0], { is_default: 0 });
			pictures[0] = tmp;
			setValues(Object.assign(values, { "pictures": pictures }));
		}
	}

	handleRemovePicture = (idx = 0) => {
		let { values, setValues } = this.formikProps;
		let pictures = JSON.parse(JSON.stringify(values.pictures));
		pictures.splice(idx, 1);
		if (idx == 0 && pictures.length) pictures[0].is_default = 1;
		setValues(Object.assign(values, { "pictures": pictures }));
	}

	handleImageChange = (event) => {
		let { target } = event;
		let { values, setValues } = this.formikProps;
		let picture = target.files[0];
		if (picture) {
			readFileAsBase64(target, {
				// option: validate input
				validate: (file) => {
					// Check file's type
					if ('type' in file) {
						if (file.type.indexOf('image/') !== 0) {
							return 'Chỉ được phép sử dụng tập tin ảnh.';
						}
					}
					// Check file's size in bytes
					if ('size' in file) {
						let maxSize = 4; /*4mb*/
						if ((file.size / 1024 / 1024) > maxSize) {
							return `Dung lượng tập tin tối đa là: ${maxSize}mb.`;
						}
					}
				}
			})
				.then(imgBase64 => {
					let pictures = JSON.parse(JSON.stringify(values.pictures));
					pictures.splice(1, 0, { picture_url: imgBase64, is_default: pictures.length ? 0 : 1, picture_alias: picture.name })
					setValues(Object.assign(values, { "pictures": pictures }));
				})
				.catch(err => {
					window._$g.dialogs.alert(window._$g._(err.message));
				})
				;
		}
	}

    handleChangeProductAttribute = (changeItem, field, attr, idx) => {
        let { proAttrValues } = this.state;
        let { values } = this.formikProps;
        let { value : id, label } = changeItem;
        let attribute_values = [...values.attribute_values];
        Object.assign(attr, {product_attribute_id: id, product_attribute_name: label});
        if (id) {
            this._productAttributeModel.read(id)
				.then(data => {
					proAttrValues = [proAttrValues[0]].concat(mapDataOptions4Select(data.attribute_values));
					this.setState({ proAttrValues });
				});
            this._unitModel.getOptions()
                .then(data => this.setState({ units: mapDataOptions4Select(data) }))
        }
        attribute_values[idx] = attr;
        return field.onChange({
            target: {
                type: "select",
                name: "attribute_values",
                value: attribute_values,
            }
        })
    }

    handleChangeProductAttrValue = (changeItem, field, attr, idx, droplist = false) => {
        let { proAttrValues } = this.state;
        let { values } = this.formikProps;
        if(droplist){
			let { value : id, label } = changeItem;
			Object.assign(attr,{
				product_attribute_value_id: id,
				attribute_values: label
			})
		}
		else{
			Object.assign(attr,{
				attribute_values: changeItem.target.value
			})
		}
        values.attribute_values[idx] = attr;
        return field.onChange({
            target: {
                type: "select",
                name: "attribute_values",
                value: values.attribute_values,
            }
        })
    }
    
    handleChangeProductAttrUnit = (changeItem, field, attr, idx) => {

    }

	handleAddProductAttribute = (evt) => {
		let { values, handleChange } = this.formikProps;
		let { attribute_values: value } = values;
		let attr = {}
        let item = {product_attribute_id: "", product_attribute_value_id: "", unit_id: ""};
        value.push(item);
		handleChange({ target: { name: "attribute_values", value }});
	}

    handleRemoveProductAttribute = (idx) => {
        let { values, setValues } = this.formikProps;
        let attribute_values = [...values.attribute_values];
        if(idx > -1) attribute_values.splice(idx, 1);
        setValues(Object.assign(values, { "attribute_values": attribute_values }));
	}
	
	handleSwitchService({ name, value }) {
		let { values, setValues } = this.formikProps;
		this.setState({
			isCheckService: !this.state.isCheckService
		}, () => {
			setValues(Object.assign(values, { [name]: value }));
		})
	}

	handleSwitchToggleService(target) {
		let { values, setValues } = this.formikProps;
		let isSwitch = (1 * target.value) === 1
		setValues(Object.assign(values, {
			"is_amount_days_is_session": target.value,
			"is_amount_days": !isSwitch ? 1 : 0,
			"is_session": isSwitch ? 1 : 0,
		}));
	}

	mappingAttributeDisabled(productAttributesArr) {
		const { productAttributes } = this.state;
		const cloneData = JSON.parse(JSON.stringify(productAttributes));
		productAttributesArr.map(v => {
		  let currentIdxAttributes = productAttributes.findIndex(_item => _item.value === (1 * v.product_attribute_id));
		  if (currentIdxAttributes >= 0) {
				cloneData[currentIdxAttributes].isDisabled = true
		  }
		});
		return cloneData
	}

	handleInputChange(event, field, key, config = {}) {
		const { value } = event.target
		const parseNumber = validateInputNumber(value, config)
		field.onChange({
			target: {
				type: "select",
				name: key,
				value: parseNumber
			}
		})
	}

	render() {
		let {
			_id,
			ready,
			alerts,
			productCategories,
			manufacturers,
			productModels,
			statusProducts,
			origins,
			// ptlevels,
            productAttributes,
            units,
            proAttrValues,
			isOpen,
			photoIndex,
			willShowBusinesses
		} = this.state;
		let { productEnt, noEdit } = this.props;
		let initialValues = this.getInitialValues();
		// Ready?
		if (!ready) {
			return <Loading />;
		}
		return (
			<div key={`view-${_id}`} className="animated fadeIn">
				{/* start#Businesses */}
				{
					willShowBusinesses ? (
						<div className="product-select-business">
							<div className="product-select-business-box p-3">
								<Businesses
									handleActionSelect={this.handleSelectBusiness} />
							</div>
						</div>
					) : null
				}
				{/* end#Businesses */}
				<Row className="d-flex justify-content-center">
					<Col xs={12} md={12}>
						<Card>
							<CardHeader>
								<b>{productEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} sản phẩm {productEnt ? productEnt.product_name : ''}</b>
							</CardHeader>
							<CardBody>
								{/* general alerts */}
								{alerts.map(({ color, msg }, idx) => {
									return (
										<Alert key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })}>
											<span dangerouslySetInnerHTML={{ __html: msg }} />
										</Alert>
									);
								})}
								<Formik
									initialValues={initialValues}
									validationSchema={this.formikValidationSchema}
									validate={this.handleFormikValidate}
									onSubmit={this.handleFormikSubmit}
								>{(formikProps) => {
									let {
										values,
										handleSubmit,
										handleReset,
										isSubmitting,
									} = (this.formikProps = window._formikProps = formikProps);
									// Render
									return (
										<Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
											<Row>
												{/* start#Product info */}
												<Col xs={12} sm={12} md={7} lg={7}>
													<Row>
														<Col xs={12}>
															<b className="underline">Thông tin sản phẩm</b>
														</Col>
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4} />
																	<Col sm={8} className="d-flex">
																		<Field
																			name="is_service"
																			render={({ field /* _form */ }) => <CustomInput
																				{...field}
																				className="pull-left"
																				onBlur={null}
																				checked={values.is_service}
																				type="switch"
																				id={field.name}
																				label="Sản phẩm dịch vụ"
																				disabled={productEnt}
																				onChange={({ target }) => this.handleSwitchService({
																					name: field.name,
																					value: target.checked
																				})}
																			/>}
																		/>
																	</Col>
																</Row>
															</FormGroup>
														</Col>
                                                        {/* #product_code */}
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Mã sản phẩm<span className="font-weight-bold red-text">*</span>
																	</Label>
																	<Col sm={8}>
																		<Field
																			name="product_code"
																			render={({ field /* _form */ }) => <Input
																				{...field}
																				onBlur={null}
																				type="text"
																				id={field.name}
																				placeholder=""
																				disabled={noEdit}
																			/>}
																		/>
																		<ErrorMessage name="product_code" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																	</Col>
																</Row>
															</FormGroup>
														</Col>
                                                        {/* #product_name */}
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Tên sản phẩm<span className="font-weight-bold red-text">*</span>
																	</Label>
																	<Col sm={8}>
																		<Field
																			name="product_name"
																			render={({ field /* _form */ }) => <Input
																				{...field}
																				onBlur={null}
																				type="text"
																				id={field.name}
																				placeholder=""
																				disabled={noEdit}
																			/>}
																		/>
																		<ErrorMessage name="product_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																	</Col>
																</Row>
															</FormGroup>
														</Col>
                                                        {/* #product_name_show_web */}
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Tên hiển thị trên web<span className="font-weight-bold red-text">*</span>
																	</Label>
																	<Col sm={8}>
																		<Field
																			name="product_name_show_web"
																			render={({ field /* _form */ }) => <Input
																				{...field}
																				onBlur={null}
																				type="text"
																				id={field.name}
																				placeholder=""
																				disabled={noEdit}
																			/>}
																		/>
																		<ErrorMessage name="product_name_show_web" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																	</Col>
																</Row>
															</FormGroup>
														</Col>
                                                        {/* #businesses */}
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Chi nhanh<span className="font-weight-bold red-text">*</span>
																	</Label>
																	<Col sm={8}>
																		<Row>
																			<Col sm={12}>
																				<Table size="sm" bordered striped hover>
																					<thead>
																						<tr>
																							<th style={{ width: '5%' }}>STT</th>
																							<th style={{ minWidth: '150px' }}>Chi nhanh</th>
																							{!noEdit && 
																								<th style={{ width: '1%' }}>Xóa</th>
																							}
																						</tr>
																					</thead>
																					<tbody>
																						{values.businesses.map((bus, idx) => (
																							<tr key={`business_${idx}`}>
																								<td>{idx + 1}</td>
																								<td>{bus.business_name}</td>
																								{!noEdit && <td>
																									<Button
																										color="danger"
																										className="btn-xs"
																										onClick={e => this.handleRemoveBusiness(idx)}>
																										<i className="fa fa-times-circle" />
																									</Button>
																								</td> }
																							</tr>
																						))
																						}
																					</tbody>
																				</Table>
																			</Col>
																			{
																				!noEdit && <Col sm={12}>
																					<Button
																						color="secondary"
																						className="btn btn-sm"
																						onClick={() => this.handleToggleBU()}>
																						<i className="fa fa-plus mr-2" />
																						Chọn
																					</Button>
																				</Col>
																			}
																		</Row>


																		<ErrorMessage name="businesses" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																	</Col>
																</Row>
															</FormGroup>
														</Col>
                                                        {/* #product_category */}
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Danh mục sản phẩm<span className="font-weight-bold red-text">*</span>
																	</Label>
																	<Col sm={8}>
																		<Field
																			name="product_category_id"
																			render={({ field/*, form*/ }) => {
																				let defaultValue = productCategories.find(({ value }) => (1 * value) === (1 * field.value));
																				let placeholder = (productCategories[0] && productCategories[0].label) || '';
																				let groupedOptions = (productCategories.length > 1 && productCategories[0].id != '' && !!productCategories[0].parent_id) ? groupByParams(productCategories, 'parent_id') : productCategories
																				//let groupedOptions = groupByParams(productCategories, 'parent_id')

																				const Option = (props) => {
																					const {
																						children,
																						innerRef,
																						innerProps,
																					} = props;
																					return (
																						<div
																							ref={innerRef}
																							className={`Select-Sub-Item ${props.data.is_child_options ? 'Select-Sub-Item__Inner' : ''}`}
																							{...innerProps}
																						>
																							{children}
																						</div>
																					)
																				};

																				return (
																					<Select
																						id={field.name}
																						name={field.name}
																						onChange={( changeValue ) => 
																							// get product attributes by product_category_id
																							this.handleChangeProductCategory(changeValue, field)
																						}
																						isSearchable={true}
																						placeholder={placeholder}
																						defaultValue={defaultValue}
																						options={groupedOptions}
																						isDisabled={noEdit}
																						components={{ Option }}
																					/>
																				);
																			}}
																		/>
																		<ErrorMessage name="product_category_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																	</Col>
																</Row>
															</FormGroup>
														</Col>
														{/* #product_status */}
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Trạng thái sản phẩm
																	</Label>
																	<Col sm={8}>
																		<Field
																			name="status_product_id"
																			render={({ field/*, form*/ }) => {
																				let defaultValue = statusProducts.find(({ value }) => (1 * value) === (1 * field.value));
																				let placeholder = (statusProducts[0] && statusProducts[0].label) || '';
																				return (
																					<Select
																						id={field.name}
																						name={field.name}
																						isSearchable={true}
																						onChange={({ value }) => field.onChange({
																							target: { type: "select", name: field.name, value }
																						})}
																						placeholder={placeholder}
																						defaultValue={defaultValue}
																						options={statusProducts}
																						isDisabled={noEdit}
																					/>
																				);
																			}}
																		/>
																	</Col>
																</Row>
															</FormGroup>
														</Col>
														{(1 * values.is_service) === 1 && (
															<Col xs={12}>
																<FormGroup>
																	<Row>
																		<Label sm={4} />
																		<Col xs={12} sm={8}>
																			<Row>
																				<Col xs={6}>
																					<Field
																						name="is_amount_days_is_session"
																						render={({ field /* _form */ }) => <CustomInput
																						{...field}
																						onBlur={null}
																						value={0}
																						type="radio"
																						checked={(1 * values.is_amount_days_is_session) === 0}
																						onChange={({ target }) => this.handleSwitchToggleService(target)}
																						id={`is_amount_days_is_session_0`}
																						label="Có giá trị theo ngày"
																						disabled={noEdit}
																						/>}
																					/>
																				</Col>
																				<Col xs={6}>
																					<Field
																						name="is_amount_days_is_session"
																						render={({ field /* _form */ }) => <CustomInput
																						{...field}
																						onBlur={null}
																						value={1}
																						type="radio"
																						checked={(1 * values.is_amount_days_is_session) === 1}
																						onChange={({ target }) => this.handleSwitchToggleService(target)}
																						id={`is_amount_days_is_session_1`}
																						label="Có giá trị theo buổi"
																						disabled={noEdit}
																						/>}
																					/>
																				</Col>
																			</Row>
																		</Col>
																	</Row>
																</FormGroup>
															</Col>
														)}
                                                        {(1 * values.is_service) === 1 ? 
                                                        // #product_is_service
                                                        <React.Fragment>
                                                        	{/* #time_session */}
                                                        	{(1 * values.is_amount_days) === 1 && (
                                                        		<React.Fragment>
		                                                        	<Col xs={12}>
																		<FormGroup>
																			<Row>
																				<Label sm={4}>
																					Thời hạn gói tập gym<span className="font-weight-bold red-text">*</span>
																				</Label>
																				<Col sm={8} className="d-flex">
																					<Row>
																						<Col xs={12} sm={3}>
																							<Field
																								name="values_in"
																								render={({ field /* _form */ }) => <Input
																									{...field}
																									onBlur={null}
																									type="text"
																									onChange={event => this.handleInputChange(event, field, 'values_in')}
																									id={field.name}
																									disabled={noEdit}
																								/>}
																							/>
																						</Col>
																						<Col xs={12} sm={4}>
																			        <Select
																								onChange={(changeValue) => {
																									const { value } = changeValue
																									this.setState({ values_in_gym: value === 0 ? 30 : 360 })
																								}}
																								isSearchable={true}
																								defaultValue={{ label: "Tháng", value: 0 }}
																								options={[
																									{ label: "Tháng", value: 0 },
																									{ label: "Năm", value: 1 },
																								]}
																								isDisabled={noEdit}
																			        />
																						</Col>
																						<Col xs={12} sm={5} className="d-flex align-items-center">
																							<Input
																								readOnly
																								onBlur={null}
																								type="text"
																								value={(this.state.values_in_gym * values.values_in) || this.state.values_in_gym}
																								disabled={noEdit}
																							/>
																							<span className="pl-3">Ngày</span>
																						</Col>
																					</Row>
																					<ErrorMessage name="values_in" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																				</Col>
																			</Row>
																		</FormGroup>
																	</Col>
																	<Col xs={12}>
																		<FormGroup>
																			<Row>
																				<Label sm={4} />
																				<Col sm={8}>
																					<Field
																						name="is_product_off_peak"
																						render={({ field /* _form */ }) => <CustomInput
																							{...field}
																							className="pull-left"
																							onBlur={null}
																							type="switch"
																							id={field.name}
																							label="Gói tập giờ thấp điểm"
																							disabled={noEdit}
																							checked={values.is_product_off_peak}
																						/>}
																					/>
																				</Col>
																			</Row>
																		</FormGroup>
																	</Col>
																	{values.is_product_off_peak
																		? (
																			<>
																				<Col xs={12}>
																					<FormGroup>
																						<Row>
																							<Label sm={4}>
																								Khung giờ từ
																							</Label>
																							<Col sm={8} className="d-flex">
																								<Row>
																									<Col xs={12} sm={5}>
																										<Field
																											name="from_hour"
																											render={({ field /* _form */ }) => <Input
																												{...field}
																												onBlur={null}
																												type="text"
																												onChange={event => this.handleInputChange(event, field, 'from_hour', { formatTimeHour: true })}
																												id={field.name}
																												placeholder=""
																												disabled={noEdit}
																												maxLength="5"
																											/>}
																										/>
																									</Col>
																									<Label xs={12} sm={2}>
																										đến
																									</Label>
																									<Col xs={12} sm={5}>
																										<Field
																											name="to_hour"
																											render={({ field /* _form */ }) => <Input
																												{...field}
																												onBlur={null}
																												type="text"
																												onChange={event => this.handleInputChange(event, field, 'to_hour', { formatTimeHour: true })}
																												id={field.name}
																												placeholder=""
																												disabled={noEdit}
																												maxLength="5"
																											/>}
																										/>
																									</Col>
																								</Row>
																							</Col>
																						</Row>
																					</FormGroup>
																				</Col>
																				<Col xs={12}>
																					<FormGroup>
																						<Row>
																							<Label sm={4}>
																								Ngày tập
																							</Label>
																							<Col sm={8} className="d-flex flex-wrap">
																								<Field
																									name="is_apply_mon"
																									render={({ field /* _form */ }) => <CustomInput
																										{...field}
																										className="pull-left col-xs-12 col-sm-3"
																										onBlur={null}
																										type="switch"
																										id={field.name}
																										label="Thứ 2"
																										disabled={noEdit}
																										checked={values.is_apply_mon}
																									/>}
																								/>
																								<Field
																									name="is_apply_tu"
																									render={({ field /* _form */ }) => <CustomInput
																										{...field}
																										className="pull-left col-xs-12 col-sm-3"
																										onBlur={null}
																										type="switch"
																										id={field.name}
																										label="Thứ 3"
																										disabled={noEdit}
																										checked={values.is_apply_tu}
																									/>}
																								/>
																								<Field
																									name="is_apply_we"
																									render={({ field /* _form */ }) => <CustomInput
																										{...field}
																										className="pull-left col-xs-12 col-sm-3"
																										onBlur={null}
																										type="switch"
																										id={field.name}
																										label="Thứ 4"
																										disabled={noEdit}
																										checked={values.is_apply_we}
																									/>}
																								/>
																								<Field
																									name="is_apply_th"
																									render={({ field /* _form */ }) => <CustomInput
																										{...field}
																										className="pull-left col-xs-12 col-sm-3"
																										onBlur={null}
																										type="switch"
																										id={field.name}
																										label="Thứ 5"
																										disabled={noEdit}
																										checked={values.is_apply_th}
																									/>}
																								/>
																								<Field
																									name="is_apply_fr"
																									render={({ field /* _form */ }) => <CustomInput
																										{...field}
																										className="pull-left col-xs-12 col-sm-3"
																										onBlur={null}
																										type="switch"
																										id={field.name}
																										label="Thứ 6"
																										disabled={noEdit}
																										checked={values.is_apply_fr}
																									/>}
																								/>
																								<Field
																									name="is_apply_sa"
																									render={({ field /* _form */ }) => <CustomInput
																										{...field}
																										className="pull-left col-xs-12 col-sm-3"
																										onBlur={null}
																										type="switch"
																										id={field.name}
																										label="Thứ 7"
																										disabled={noEdit}
																										checked={values.is_apply_sa}
																									/>}
																								/>
																								<Field
																									name="is_apply_sun"
																									render={({ field /* _form */ }) => <CustomInput
																										{...field}
																										className="pull-left col-xs-12 col-sm-3"
																										onBlur={null}
																										type="switch"
																										id={field.name}
																										label="Chủ nhật"
																										disabled={noEdit}
																										checked={values.is_apply_sun}
																									/>}
																								/>
																							</Col>
																						</Row>
																					</FormGroup>
																				</Col>
																			</>
																		)
																		: null
																	}
																</React.Fragment>
                                                        	)}
															{(1 * values.is_session) === 1 ?
																<React.Fragment>
																	<Col xs={12}>
																		<FormGroup>
																			<Row>
																				<Label sm={4}>
																					Số buổi tập gói PT<span className="font-weight-bold red-text">*</span>
																				</Label>
																				<Col sm={8}>
																					<div className="d-flex align-items-center">
																						<Field
																							name="values_in"
																							render={({ field /* _form */ }) => <Input
																								{...field}
																								onBlur={null}
																								type="text"
																								onChange={event => this.handleInputChange(event, field, 'values_in')}
																								id={field.name}
																								disabled={noEdit}
																							/>}
																						/>
																						<span className="pl-3">Buổi</span>
																					</div>
																					<ErrorMessage name="values_in" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																				</Col>
																			</Row>
																		</FormGroup>
																	</Col>
																	<Col xs={12}>
																		<FormGroup>
																			<Row>
																				<Label sm={4}>
																					Thời hạn gói tập PT<span className="font-weight-bold red-text">*</span>
																				</Label>
																				<Col sm={8} className="d-flex">
																					<Row>
																						<Col xs={12} sm={3}>
																							<Field
																								name="time_limit"
																								render={({ field /* _form */ }) => <Input
																									{...field}
																									onBlur={null}
																									type="text"
																									onChange={event => this.handleInputChange(event, field, 'time_limit')}
																									id={field.name}
																									disabled={noEdit}
																								/>}
																							/>
																						</Col>
																						<Col xs={12} sm={4}>
																			        <Select
																								onChange={(changeValue) => {
																									const { value } = changeValue
																									this.setState({ values_in_pt: value === 0 ? 30 : 360 })
																								}}
																								isSearchable={true}
																								defaultValue={{ label: "Tháng", value: 0 }}
																								options={[
																									{ label: "Tháng", value: 0 },
																									{ label: "Năm", value: 1 },
																								]}
																								isDisabled={noEdit}
																			        />
																						</Col>
																						<Col xs={12} sm={5} className="d-flex align-items-center">
																							<Input
																								readOnly
																								onBlur={null}
																								type="text"
																								value={(this.state.values_in_pt * values.time_limit) || this.state.values_in_pt}
																								disabled={noEdit}
																							/>
																							<span className="pl-3">Ngày</span>
																						</Col>
																					</Row>
																					<ErrorMessage name="values_in" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																				</Col>
																			</Row>
																		</FormGroup>
																	</Col>
																	<Col xs={12}>
																		<FormGroup>
																			{/* <Row>
																				<Label sm={4}>
																					Cấp độ PT
																				</Label>
																				<Col sm={8}>
																					<Field
																						name="pt_level_id"
																						render={({ field}) => {
																							let defaultValue = ptlevels.find(({ value }) => (1 * value) === (1 * field.value));
																							let placeholder = (ptlevels[0] && ptlevels[0].label) || '';
																							return (
																								<Select
																									id={field.name}
																									name={field.name}
																									onChange={({ value }) => field.onChange({
																										target: { type: "select", name: field.name, value }
																									})}
																									isSearchable={true}
																									placeholder={placeholder}
																									defaultValue={defaultValue}
																									options={ptlevels}
																									isDisabled={noEdit}
																								/>
																							);
																						}}
																					/>
																					<ErrorMessage name="pt_level_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																				</Col>
																			</Row> */}
																		</FormGroup>
																	</Col>
																	<Col xs={12}>
																		<FormGroup>
																			<Row>
																				<Label sm={4}>
																					Thời gian cho mỗi buổi<span className="font-weight-bold red-text">*</span>
																				</Label>
																				<Col sm={8}>
																					<InputGroup>
																						<Field
																							name="time_per_session"
																							render={({ field /* _form */ }) => <Input
																								{...field}
																								onBlur={null}
																								type="text"
																								onChange={event => this.handleInputChange(event, field, 'time_per_session')}
																								id="time_per_session"
																								disabled={noEdit}
																							/>}
																						/>
												                    <InputGroupAddon addonType="append">
																			        <select className="form-control" onChange={(changeValue) => {
																								const { value } = changeValue
																								this.setState({ values_time_per_session: value === 0 ? 1 : 60 })
																							}}>
																								<option value="0">Phút</option>
																								<option value="1">Giờ</option>
																							</select>
																						</InputGroupAddon>
																					</InputGroup>
																					<ErrorMessage name="time_per_session" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																				</Col>
																			</Row>
																		</FormGroup>
																	</Col>
																</React.Fragment>
																: null
															}

															{/* #apply_with_year_month_day */}
                                                            {/*<Col xs={12}>
                                                            																<FormGroup>
                                                            																	<Row>
                                                            																		<Label sm={4}>
                                                            																			Có giá trị theo<span className="font-weight-bold red-text">*</span>
                                                            																		</Label>
                                                            																		<Col sm={8}>
                                                            																			<Field
                                                            																				name="apply_with"
                                                            																				validate={value => { if (!value) return "Có giá trị theo là bắt buộc."; }}
                                                            																				render={({ field }) => {
                                                            																					return (
                                                            																						<RadioGroup
                                                            																							aria-label="Có giá trị theo"
                                                            																							row
                                                            																							onChange={evt => {
                                                            																								field.onChange({
                                                            																									target: { type: "radio", name: field.name, value: evt.target.value }
                                                            																								})
                                                            																							}}>
                                                            																							<FormControlLabel
                                                            																								value="day"
                                                            																								control={<Radio
                                                            																									color="primary"
                                                            																									checked={values.apply_with == 'day'}
                                                            																									icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                                            																									checkedIcon={<RadioButtonCheckedIcon fontSize="small" />} />}
                                                            																								label="Ngày"
                                                                                                                                                            labelPlacement="end"
                                                                                                                                                            disabled={noEdit}
                                                            																								className="mb-0 service-apply-with" />
                                                            																							<FormControlLabel
                                                            																								value="month"
                                                            																								control={<Radio
                                                            																									color="primary"
                                                            																									checked={values.apply_with == 'month'}
                                                            																									icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                                            																									checkedIcon={<RadioButtonCheckedIcon fontSize="small" />} />}
                                                            																								label="Tháng"
                                                                                                                                                            labelPlacement="end"
                                                                                                                                                            disabled={noEdit}
                                                            																								className="mb-0 service-apply-with" />
                                                            																							<FormControlLabel
                                                            																								value="year"
                                                            																								control={<Radio
                                                            																									color="primary"
                                                            																									checked={values.apply_with == 'year'}
                                                            																									icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                                            																									checkedIcon={<RadioButtonCheckedIcon fontSize="small" />} />}
                                                                                                                                                            label="Năm"
                                                                                                                                                            disabled={noEdit}
                                                            																								labelPlacement="end"
                                                            																								className="mb-0 service-apply-with" />
                                                            																						</RadioGroup>
                                                            																					)
                                                            																				}}
                                                            																			/>
                                                            																			<ErrorMessage name="apply_with" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                                            																		</Col>
                                                            																	</Row>
                                                            																</FormGroup>
                                                            															</Col>*/}
															{/* #valuein */}
                                                            {/*<Col xs={12}>
                                                            																<FormGroup>
                                                            																	<Row>
                                                            																		<Label sm={4}>
                                                            																			Giá trị nhập vào<span className="font-weight-bold red-text">*</span>
                                                            																		</Label>
                                                            																		<Col sm={8}>
                                                            																			<Field
                                                            																				name="values_in"
                                                            																				validate={value => { if (!value) return "Gía trị nhập vào là bắt buộc."; }}
                                                            																				render={({ field }) => <Input
                                                            																					{...field}
                                                            																					onBlur={null}
                                                            																					type="text"
                                                            																					id={field.name}
                                                            																					placeholder=""
                                                            																					disabled={noEdit}
                                                            																				/>}
                                                            																			/>
                                                            																			<ErrorMessage name="values_in" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                                            																		</Col>
                                                            																	</Row>
                                                            																</FormGroup>
                                                            															</Col>*/}
														</React.Fragment> :
                                                        // #is_product
                                                        <React.Fragment>
                                                            {/* #manufacturrer */}
                                                            <Col xs={12}>
                                                                <FormGroup>
                                                                    <Row>
                                                                        <Label sm={4}>
                                                                            Hãng sản xuất<span className="font-weight-bold red-text">*</span>
                                                                        </Label>
                                                                        <Col sm={8}>
                                                                            <Field
                                                                                name="manufacturer_id"
                                                                                render={({ field/*, form*/ }) => {
                                                                                    let defaultValue = manufacturers.find(({ value }) => (1 * value) === (1 * field.value));
                                                                                    let placeholder = (manufacturers[0] && manufacturers[0].label) || '';
                                                                                    return (
                                                                                        <Select
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            onChange={({ value }) => field.onChange({
                                                                                                target: { type: "select", name: field.name, value }
                                                                                            })}
                                                                                            isSearchable={true}
                                                                                            placeholder={placeholder}
                                                                                            defaultValue={defaultValue}
                                                                                            options={manufacturers}
                                                                                            isDisabled={noEdit}
                                                                                        />
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <ErrorMessage name="manufacturer_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                                                        </Col>
                                                                    </Row>
                                                                </FormGroup>
                                                            </Col>
                                                            {/* #lot_number&imei */}
                                                            <Col xs={12}>
                                                                <FormGroup>
                                                                    <Row>
                                                                        <Label sm={4}>
                                                                            Số lô
                                                            			</Label>
                                                                        <Col sm={8} xs={12} lg={3}>
                                                                            <Field
                                                                                name="lot_number"
                                                                                render={({ field /* _form */ }) => <Input
                                                                                    {...field}
                                                                                    onBlur={null}
                                                                                    type="text"
                                                                                    id={field.name}
                                                                                    placeholder=""
                                                                                    disabled={noEdit}
                                                                                />}
                                                                            />
                                                                        </Col>
                                                                        <Label lg={2} sm={4} xs={12} className="mt-sm-2 mt-md-0 text-lg-center">
                                                                            Số IMEI
                                                            			</Label>
                                                                        <Col lg={3} sm={8} xs={12} className="mt-sm-2 mt-md-0">
                                                                            <Field
                                                                                name="product_imei"
                                                                                render={({ field /* _form */ }) => <Input
                                                                                    {...field}
                                                                                    onBlur={null}
                                                                                    type="text"
                                                                                    id={field.name}
                                                                                    placeholder=""
                                                                                    disabled={noEdit}
                                                                                />}
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                </FormGroup>
                                                            </Col>
                                                            {/* #model */}
                                                            <Col xs={12}>
                                                                <FormGroup>
                                                                    <Row>
                                                                        <Label sm={4}>
                                                                            Model
                                                            			</Label>
                                                                        <Col sm={8} xs={12} lg={3}>
                                                                            <Field
                                                                                name="model_id"
                                                                                render={({ field/*, form*/ }) => {
                                                                                    let defaultValue = productModels.find(({ value }) => (1 * value) === (1 * field.value));
                                                                                    let placeholder = (productModels[0] && productModels[0].label) || '';
                                                                                    return (
                                                                                        <Select
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            onChange={({ value }) => field.onChange({
                                                                                                target: { type: "select", name: field.name, value }
                                                                                            })}
                                                                                            isSearchable={true}
                                                                                            placeholder={placeholder}
                                                                                            defaultValue={defaultValue}
                                                                                            options={productModels}
                                                                                            isDisabled={noEdit}
                                                                                        />
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </Col>
                                                                        <Label lg={2} sm={4} xs={12} className="mt-sm-2 mt-md-0 text-lg-center">
                                                                            Xuất sứ
                                                            			</Label>
                                                                        <Col lg={3} sm={8} xs={12} className="mt-sm-2 mt-md-0">
                                                                            <Field
                                                                                name="origin_id"
                                                                                render={({ field/*, form*/ }) => {
                                                                                    let defaultValue = origins.find(({ value }) => (1 * value) === (1 * field.value));
                                                                                    let placeholder = (origins[0] && origins[0].label) || '';
                                                                                    return (
                                                                                        <Select
                                                                                            id={field.name}
                                                                                            name={field.name}
                                                                                            onChange={({ value }) => field.onChange({
                                                                                                target: { type: "select", name: field.name, value }
                                                                                            })}
                                                                                            isSearchable={true}
                                                                                            placeholder={placeholder}
                                                                                            defaultValue={defaultValue}
                                                                                            options={origins}
                                                                                            isDisabled={noEdit}
                                                                                        />
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                </FormGroup>
                                                            </Col>
                                                        </React.Fragment>
                                                        }
                                                        {/* #desription */}
                                                        <Col xs={12}>
                                                            <FormGroup>
                                                                <Row>
                                                                    <Label sm={4}>Mô tả</Label>
                                                                    <Col sm={8}>
                                                                        <Field
                                                                            name="descriptions"
                                                                            render={({ field /* _form */ }) => <Input
                                                                                {...field}
                                                                                onBlur={null}
                                                                                type="textarea"
                                                                                id={field.name}
                                                                                placeholder=""
                                                                                disabled={noEdit}
                                                                            />}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </FormGroup>
                                                        </Col>
														{/* #product_short_description */}
                                                        <Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Mô tả ngắn gọn<span className="font-weight-bold red-text">*</span>
																	</Label>
																	<Col sm={8}>
																		<Field
																			name="short_description"
																			render={({ field /* _form */ }) => <Input
																				{...field}
																				onBlur={null}
																				type="text"
																				id={field.name}
																				placeholder=""
																				disabled={noEdit}
																			/>}
																		/>
																		<ErrorMessage name="short_description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
																	</Col>
																</Row>
															</FormGroup>
														</Col>
														{/* #note */}
                                                        <Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={4}>
																		Ghi chú
																</Label>
																	<Col sm={8}>
																		<Field
																			name="note"
																			render={({ field /* _form */ }) => <Input
																				{...field}
																				onBlur={null}
																				type="text"
																				id={field.name}
																				placeholder=""
																				disabled={noEdit}
																			/>}
																		/>
																	</Col>
																</Row>
															</FormGroup>
														</Col>
													</Row>
												</Col>
												{/* end#ProductInfo */}
												{/* start#ProductPicturesandAttributes */}
												<Col xs={12} sm={12} md={5} lg={5}>
													{/* #pictures */}
                                                    <Row>
														<Col xs={12}>
															<b className="underline">Ảnh sản phẩm</b>
														</Col>
														<Col xs={12} className="mb-2 product-picture">
															<Row>
																{
																	values.pictures.length > 0 && <Col sm={6}
																		className="pr-lg-0 pr-md-0 mb-2">
																		<GridListTile key={0}
																			cols={1}
																			classes={{
																				root: 'product-picture-default-wrapper',
																				tile: 'product-picture-default-block',
																				imgFullWidth: 'product-picture-default-img'
																			}}>
																			<img
																				src={`${values.pictures[0].picture_url}`}
																				alt={values.pictures[0].picture_alias}
																				onClick={() => this.setState({ isOpen: true, photoIndex: 0 })} />
																			<div className="product-picture-default-control text-right" >
																				<Button
																					color="danger"
																					className="btn-xs"
																					onClick={() => this.handleRemovePicture()}
																				>
																					<i className="fa fa-minus-circle" />
																				</Button>
																			</div>
																		</GridListTile>
																	</Col>
																}
																<Col sm={6}
																	className="pl-2 mb-2">
																	<GridList cellHeight={80}
																		cols={3}
																		classes={{ root: 'product-picture-list' }}>
																		{ !noEdit && <GridListTile cols={1}
																			classes={{ tile: 'product-picture-list-btn' }}>
																			<span
																				className="btn-block w-100 h-100"
																			>
																				<i className="fa fa-plus " />
																				<Input
																					type="file"
																					id="add_product_picture"
																					className="input-overlay"
																					onChange={evt => this.handleImageChange(evt)}
																				/>
																			</span>
																		</GridListTile>}
																		{values.pictures.length > 1 && values.pictures.map((picture, idx) => (
																			idx > 0 && <GridListTile key={`picture_${idx}`} cols={1}
																				classes={{ tile: 'product-picture-box' }}>
																				<img src={`${picture.picture_url}`}
																					onClick={() => { this.setState({ isOpen: true, photoIndex: idx }) }}
																					alt={picture.picture_alias} />
																				<div className="product-picture-control text-right" >
																					<Input type="checkbox"
																						checked={false}
																						onChange={(e) => this.handleChangeDefaultPicture(e, idx)} />
																					<span className="mr-1 btn-remove-img"
																						onClick={() => this.handleRemovePicture(idx)}>
																						<i className="fa fa-minus-circle text-danger" />
																					</span>
																				</div>
																			</GridListTile>
																		))}
																	</GridList>
																</Col>
																{isOpen && (
																	<Lightbox
																		mainSrc={`${values.pictures[photoIndex].picture_url}`}
																		nextSrc={`${values.pictures[(photoIndex + 1) % values.pictures.length]}`}
																		prevSrc={`${values.pictures[(photoIndex + values.pictures.length - 1) % values.pictures.length]}`}
																		onCloseRequest={() => this.setState({ isOpen: false })}
																		onMovePrevRequest={() =>
																			this.setState({
																				photoIndex: (photoIndex + values.pictures.length - 1) % values.pictures.length,
																			})
																		}
																		onMoveNextRequest={() =>
																			this.setState({
																				photoIndex: (photoIndex + 1) % values.pictures.length,
																			})
																		}
																		reactModalStyle={customStyles}
																	/>
																)}
															</Row>
														</Col>
													</Row>
													{(1 * values.is_service) === 0 ?
														// #attribute
                                                        <Row>
															<Col xs={12} className="mb-2">
																<b className="underline">Thuộc tính</b>
															</Col>
															{
																(values.product_category_id || (productEnt &&productEnt.product_category_id)) ?
																<React.Fragment>
																	<Col sm={12}>
																	<Table size="sm" bordered striped hover className="tb-product-attributes">
																		<tbody>
																		{
                                                                            values.attribute_values.length ? values.attribute_values.map((attr, idx) => {
                                                                                let {
                                                                                    product_attribute_id,
                                                                                    product_attribute_name,
                                                                                    product_attribute_value_id,
                                                                                    attribute_values,
                                                                                    unit_id,
                                                                                    unit_name
                                                                                } = attr;
																				
																				let cloneAttributes = this.mappingAttributeDisabled(values.attribute_values)
																				let options = cloneAttributes.map(({ name: label, id: value, isDisabled }) => ({ value, label, isDisabled }));
                                                                                let productAttribute = options.find(({ value }) => (1 * value) === (1 * product_attribute_id));
                                                                                let productAttributeValue = proAttrValues.find(({ value }) => (1 * value) === (1 * product_attribute_value_id));
                                                                                let productAttributeUnit = units.find(({ value }) => (1 * value) === (1 * unit_id));
                                                                                
                                                                                let excludeIdArr = values.attribute_values.reduce((arr, cur) => { 
                                                                                    if((1 * cur.product_attribute_id) === 1 && cur.product_attribute_id != attr.product_attribute_id) { 
                                                                                       arr.push(cur.product_attribute_id) 
                                                                                    }
                                                                                    return arr;
                                                                                } ,[]);
                                                                                //if exist
                                                                                if(excludeIdArr && excludeIdArr.length){
                                                                                    let excludeIdStr = "|" + excludeIdArr.join("|") + "|"; 
                                                                                    let ret = (productAttributes || []).map(({value, label}) => {
                                                                                        if (excludeIdStr.indexOf("|" + value + "|") >= 0) {
                                                                                            return null;
                                                                                        }
                                                                                         return ({ value, label });
                                                                                    });
                                                                                    options = ret.filter(item => item);
                                                                                }

                                                                                return attr ? 
																			    <tr key={idx}>
																				<td>
                                                                                    <Field
                                                                                        name={`pro_attribute_${idx}`}
                                                                                        render={({ field/*, form*/ }) => {
                                                                                            let placeholder = (productAttribute && productAttribute.label) || 'Chọn thuộc tính';
                                                                                            return (
                                                                                                <Select
                                                                                                    id={field.name}
                                                                                                    name={field.name}
                                                                                                    onChange={(changeItem) => {
                                                                                                        this.handleChangeProductAttribute(changeItem, field, attr, idx)
                                                                                                    }}
                                                                                                    isSearchable={true}
                                                                                                    placeholder={placeholder}
                                                                                                    defaultValue={productAttribute}
																									options={options}
																									isDisabled={noEdit}
																									className={`z-index-${20 - idx}`}
                                                                                                />
                                                                                            );
                                                                                        }}
                                                                                    />
																				</td>
																				<td>
                                                                                    <Field 
                                                                                        name={`pro_attribute_value_${idx}`}
                                                                                        render={({field}) => {
																							let placeholder = (productAttributeValue && productAttributeValue.label) || 'Giá trị';
																							let optionsProAttrValues = proAttrValues.map(({ attribute_values: label, product_attribute_id: value }) => ({ value, label }));
                                                                                            return proAttrValues.length > 1 ? (
                                                                                                <Select
                                                                                                    id={field.name}
                                                                                                    name={field.name}
                                                                                                    onChange={(changeItem) => {
                                                                                                        this.handleChangeProductAttrValue(changeItem, field, attr, idx, true)
                                                                                                    }}
                                                                                                    isSearchable={true}
                                                                                                    placeholder={placeholder}
                                                                                                    defaultValue={productAttributeValue}
																									options={optionsProAttrValues}
																									isDisabled={noEdit}
																									className={`z-index-${20 - idx}`}
                                                                                                />
                                                                                            ) : (
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    onBlur={null}
                                                                                                    type="text"
                                                                                                    id={field.name}
                                                                                                    value={attr.attribute_values || ""}
                                                                                                    onChange={(evt) => this.handleChangeProductAttrValue(evt, field, attr, idx)}
                                                                                                    placeholder="Giá trị"
                                                                                                    disabled={noEdit}
                                                                                                />
                                                                                            )
                                                                                        }} 
                                                                                    /> 
																				</td>
																				<td>
                                                                                    <Field name={`pro_attribute_unit_${idx}`}
                                                                                        render={({field}) => {
                                                                                            let placeholder = (productAttributeUnit && productAttributeUnit.label) || 'dvt';
                                                                                            return (
                                                                                                <Select 
                                                                                                    id={field.name}
                                                                                                    name={field.name}
                                                                                                    onChange={(changeItem) => {
                                                                                                        this.handleChangeProductAttrUnit(changeItem, field, attr, idx)
                                                                                                    }}
                                                                                                    isSearchable={true}
                                                                                                    placeholder={placeholder}
                                                                                                    defaultValue={productAttributeUnit}
																									options={units}
																									isDisabled={noEdit}
																									className={`z-index-${20 - idx}`}
                                                                                                />
                                                                                            )
                                                                                        }}
                                                                                    />
																				</td>
																				<td>
																					{!noEdit && <Button
																						color="danger"
																						onClick={e => this.handleRemoveProductAttribute(idx)}
																						className="btn-sm"> <i className="fa fa-trash" />
																					</Button>}
																				</td>
                                                                            </tr> : null }) : null
                                                                        }
																		</tbody>
																	</Table>
																</Col> 
																{!noEdit  && <Col xs={12} className="mt-3">
																	<Button
																		className="btn-sm"
																		color="secondary"
																		onClick={evt => this.handleAddProductAttribute(evt)}>
																		<i className="fa fa-plus mr-2" />
																		Thêm thuộc tính
																	</Button>
																</Col>}
															</React.Fragment> :
															<Col sm={12}>
																<div className="product-attributes-empty">
																	<b className="text-danger">Bạn vui lòng chọn "Danh mục sản phẩm" để thực hiện</b>
																</div>
															</Col>
															}
														</Row> : null
													}
													<Row>
														<Col xs={12}>
															<FormGroup>
																<Row>
																	<Label sm={12}><b className="underline">Chi tiết sản phẩm</b></Label>
																	<Col sm={12}>
																		<RichEditor
																			disable={noEdit}
																			setContents={values.product_content_detail}
																			onChange={(content) => formikProps.setFieldValue("product_content_detail", content)}
																		/>
																	</Col>
																</Row>
															</FormGroup>
														</Col>
													</Row>
												</Col>
												{/* end#ProductPicturesandAttributes */}
											</Row>
                                            {/* #action */}
                                            <Row>
												{/* #is_active&is_show_web */}
												<Label sm={2} />
												<Col xs={12} sm={10}>
													{(1 * values.is_service) == 0
														? (
															<Row>
																<Col sm={4} className="d-flex">
																	<Field
																		name="is_active"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_active}
																			type="switch"
																			id={field.name}
																			label="Kích hoạt"
																			disabled={noEdit}
																		/>}
																	/>
																</Col>
																<Col sm={4} className="d-flex flex-column">
																	<Field
																		name="is_show_web"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_show_web}
																			type="switch"
																			id={field.name}
																			label="Hiển thị web"
																			disabled={noEdit}
																		/>}
																	/>
																	<Field
																		name="is_show_home"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_show_home}
																			type="switch"
																			id={field.name}
																			label="Hiển thị trang chủ"
																			disabled={noEdit}
																		/>}
																	/>
																</Col>
																<Col sm={4} className="d-flex flex-column">
																	<Field
																		name="is_high_light"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_high_light}
																			type="switch"
																			id={field.name}
																			label="Sản phẩm nổi bật"
																			disabled={noEdit}
																		/>}
																	/>
																	<Field
																		name="is_sell_well"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_sell_well}
																			type="switch"
																			id={field.name}
																			label="Sản phẩm bán chạy"
																			disabled={noEdit}
																		/>}
																	/>
																</Col>
															</Row>
														) : (
															<Row>
																<Col sm={4} className="d-flex flex-column">
																	<Field
																		name="is_active"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_active}
																			type="switch"
																			id={field.name}
																			label="Kích hoạt"
																			disabled={noEdit}
																		/>}
																	/>
																	<Field
																		name="is_show_web"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_show_web}
																			type="switch"
																			id={field.name}
																			label="Hiển thị web"
																			disabled={noEdit}
																		/>}
																	/>
																	<Field
																		name="is_show_home"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_show_home}
																			type="switch"
																			id={field.name}
																			label="Hiển thị trang chủ"
																			disabled={noEdit}
																		/>}
																	/>
																</Col>
																<Col sm={4} className="d-flex flex-column">
																	<Field
																		name="is_sell_well"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_sell_well}
																			type="switch"
																			id={field.name}
																			label="Sản phẩm bán chạy"
																			disabled={noEdit}
																		/>}
																	/>
																	<Field
																		name="is_high_light"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_high_light}
																			type="switch"
																			id={field.name}
																			label="Sản phẩm nổi bật"
																			disabled={noEdit}
																		/>}
																	/>
																</Col>
																<Col sm={4} className="d-flex flex-column">
																	<Field
																		name="is_freeze"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_freeze}
																			type="switch"
																			id={field.name}
																			label="Được bảo lưu"
																			disabled={noEdit}
																		/>}
																	/>
																	<Field
																		name="is_tranfer"
																		render={({ field /* _form */ }) => <CustomInput
																			{...field}
																			className="pull-left"
																			onBlur={null}
																			checked={values.is_tranfer}
																			type="switch"
																			id={field.name}
																			label="Được chuyển nhượng"
																			disabled={noEdit}
																		/>}
																	/>
																</Col>
															</Row>
														)
													}
												</Col>
                                            </Row>
											<Row className="mt-5">
												<Col sm={12} className="text-right">
													{this.props.noEdit ? (
														<CheckAccess permission="MD_PRODUCT_EDIT">
															<Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/products/edit/${productEnt.id()}`)}>
																<i className="fa fa-edit mr-1" />Chỉnh sửa
                                                            </Button>
														</CheckAccess>
													) : ([
														<Button
															key="buttonSave"
															type="submit"
															color="primary"
															disabled={isSubmitting || noEdit}
															onClick={() => this.handleSubmit('save')}
															className="mr-2 btn-block-sm"
														>
															<i className="fa fa-save mr-2" />Lưu
                                                        </Button>,
														<Button
															key="buttonSaveClose"
															type="submit"
															color="success"
															disabled={isSubmitting || noEdit}
															onClick={() => this.handleSubmit('save_n_close')}
															className="mr-2 btn-block-sm mt-md-0 mt-sm-2"
														>
															<i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                                        </Button>
													])
													}
													<Button disabled={isSubmitting} onClick={() => window._$g.rdr('/products')} className="btn-block-sm mt-md-0 mt-sm-2">
														<i className="fa fa-close" />
														<span className="ml-1">Đóng</span>
													</Button>
												</Col>
											</Row>
										</Form>
									);
								}}</Formik>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

const customStyles = {
	overlay: {
		zIndex: 1030
	}
};	