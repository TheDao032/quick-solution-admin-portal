/**
 * 
 */
import {
  USER_ADD,
  USER_DEL,
  USER_EDIT,
  USER_SET,
  USER_AUTH_SET,
} from '../actions/constants';
//
// import { users as usersData } from './_generator';

//
let defaultData = []; // default data
// defaultData = usersData.concat([]);

/**
 * 
 */ 
export function userAuth(state = null, action) {
  switch (action.type) {
    // USER_AUTH_SET
    case USER_AUTH_SET:
      state = action.userAuth;
    break;
    default:
  }
  return state;
}

/**
 * 
 */
export function users(state = defaultData, action) {
  // state = (state instanceof Array) ? state : defaultData; // set default value
  switch (action.type) {
    // USER_ADD
    case USER_ADD:
      state = state.concat([action.user]);
    break; // #end
    // USER_DEL
    case USER_DEL: {
      let foundUserIdx = state.findIndex(user => user.id === action.id);
      if (foundUserIdx >= 0) {
        state = state.splice(foundUserIdx, 1);
      }
    } break; // #end
    // USER_EDIT
    case USER_EDIT:
      alert('USER_EDIT has not yet implemented');
    break; // #end
    // USER_SET
    case USER_SET:
      state = defaultData.concat([]);
      // state = (action.data || {}).concat([]);
    break; // #end
    default:
  }
  return state;
}
