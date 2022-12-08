// import xml2js from 'react-native-xml2js';
//
import Lang from './utils/lang';

/**
 * Define project's global 
 */
Object.assign(window, {
  // create ref shortcut
  _$g: {
    // @var {String} Theme
    theme: 'bootstrap',
    // @var {Object}
    userAuth: null,
    // @var {Object} translate helper
    Lang,
    _: Lang,
    // utils
    // @var {Object} common dialogs
    dialogs: null,
    // @var {Function} Redirect helper
    rdr: function() {
      alert('[rdr] Not yet ready!');
    }
  },
});

// export
export default global;
