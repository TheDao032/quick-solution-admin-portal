/*
 * @flow
 */

import {
  CALL_LOADING,
} from '../actions/constants'

const initialState = {
  loading: false
};

export function common(state = initialState, action) {
  if (action.type === CALL_LOADING) {
    return {
      ...state,
      loading: true,
    }
  }

  return state
}
