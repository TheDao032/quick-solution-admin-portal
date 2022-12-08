import { applyMiddleware, createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import stateReconciler from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { createLogger } from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
// import { promiseMiddleware, localStorageMiddleware } from './middleware'
import rootReducer from './reducers'

// import { createBrowserHistory as createHistory } from 'history'
// export const history = createHistory()

// Build the middleware for intercepting and dispatching navigation actions
const myMiddlewares = [];

const getMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(...myMiddlewares)
  } else {
    // Enable additional logging in non-production environments.
    return applyMiddleware(...myMiddlewares, createLogger())
  }
}

export const store = createStore(
  persistReducer({
    key: 'FitnessCRMv1.0.0',
    storage,
    stateReconciler,
    blacklist: []
  }, rootReducer),
  composeWithDevTools(getMiddleware())
)

export const persistor = persistStore(store);
window.persistor = persistor
