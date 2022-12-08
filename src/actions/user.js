/**
 * Define project's actions#user
 */
//
import { USER_ADD, USER_DEL, USER_EDIT, USER_SET, USER_AUTH_SET } from "./constants";

//
import * as utils from "../utils";

/**
 *
 */
export function userAdd(user) {
  return { type: USER_ADD, user };
}

/**
 * Delete (remove) user item
 * @param {String} id
 * @return {Object}
 */
export function userDel(id) {
  return { type: USER_DEL, id };
}

/**
 * Edit user item
 * @param {String} id
 * @return {Object}
 */
export function userEdit(id, user) {
  return { type: USER_EDIT, id, user };
}

/**
 * Set users
 * @param {Object} data
 * @return {Object}
 */
export function userSet(data) {
  return { type: USER_SET, data };
}

/**
 *
 * @param {Object|null} user
 * @return {Object}
 */
export function userAuthSet(userAuth) {
  userAuth = utils.isPlainObject(userAuth, null);
  return { type: USER_AUTH_SET, userAuth };
}
