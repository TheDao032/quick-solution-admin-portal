//

/**
 * @class Entity
 */
export default class Entity
{
  /**
   * Helper: get model's id
   * @return mixed
   */
  id()
  {
    return this[this.primaryKey];
  }

  /**
   * 
   * @param {object} data 
   */
  static genID(opts = {})
  {
    let id = (new Date().toISOString()) + Math.random().toString();
    return id;
  }

  /**
   * @param {object} _data
   */
  constructor(_data = {})
  {
    // Get, format input(s)
    let data = Object.assign({}, _data);
    // +++
    if (!data.id) {
      // data.id = Entity.genID();
    }
    //
    Object.assign(this, data);
  }

  /**
   * @return {object} _data
   */
  toJson()
  {
    return JSON.stringify(this);
  }
}