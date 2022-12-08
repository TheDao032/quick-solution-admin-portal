/**
 * Define project's actions#user
 */
//
import { USER_GROUP_ADD, USER_GROUP_DEL, USER_GROUP_EDIT, USER_GROUP_SET } from "./constants";

//
import * as utils from "../utils";

/**
 *
 */
export function userGroupAdd(group) {
  return { type: USER_GROUP_ADD, group };
}

/**
 * Delete (remove) user item
 * @param {String} id
 * @return {Object}
 */
export function userGroupDel(id) {
  return { type: USER_GROUP_DEL, id };
}

/**
 * Edit user item
 * @param {String} id
 * @return {Object}
 */
export function userGroupEdit(id, group) {
  return { type: USER_GROUP_EDIT, id, group };
}

/**
 * Set users
 * @param {Object} data
 * @return {Object}
 */
export function userGroupSet(data) {
  return { type: USER_GROUP_SET, data };
}
