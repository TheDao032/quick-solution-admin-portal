/**
 * Project's reducers
 */
import { combineReducers } from 'redux';
//
import * as common from './common';
import * as users from './users';

// export default
const reducers = combineReducers({
  ...common,
  ...users,
});
export default reducers;
