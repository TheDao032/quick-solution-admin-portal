//
import Entity from '../Entity';

/**
 * @class ContractTypeEntity
 */
export default class ContractTypeEntity extends Entity
{
  /** @var {String} Primary Key */
  static primaryKey = 'contract_type_id';

  /** @return {String|Number} */
  static TYPE_0 = '0';
  /** @return {String|Number} */
  static TYPE_1 = '1';
  /** @return {String|Number} */
  static TYPE_2 = '2';
  /** @return {Array} */
  static genConstractTypeOpts = () => {
    return [
      { label: "Tất cả", value: _static.TYPE_2 },
      { label: "Hợp đồng gói tập", value: _static.STATUS_0 },
      { label: "Hợp đồng tập cùng PT", value: _static.TYPE_1 },
    ];
  };

  /** @return {String|Number} */
  static STATUS_0 = '0';
  /** @return {String|Number} */
  static STATUS_1 = '1';
  /** @return {String|Number} */
  static STATUS_2 = '2';
  /** @return {Array} */
  static genStatusOpts = () => {
    return [
      { label: "Tất cả", value: _static.STATUS_2 },
      { label: "Có", value: _static.STATUS_1 },
      { label: "Không", value: _static.STATUS_0 },
    ];
  };

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      contract_type_name: "",
      /** @var {Number|String} */
      created_date: "",
      /** @var {String} */
      description: "",
      /** @var {Number|String} */
      parent_id: null,
      /** @var {Number|String} */
      is_freeze: "",
      /** @var {Number|String} */
      is_tranfer: "",
      /** @var {Number|String} */
      is_contract_pt: "",
      /** @var {Number|String} */
      is_active: 1,
      /** @var {Number|String} */
      is_system: 0,
    }, data);
  }
}

// Make alias
const _static = ContractTypeEntity;