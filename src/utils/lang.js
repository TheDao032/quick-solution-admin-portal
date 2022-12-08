/**
 * Lang
 */
//
import * as utils from './'

/**
 * 
 * @param {String} text 
 * @param {Object} params 
 */
function Lang(text, params) {
    // Format input
    let data = ((params instanceof Array) || utils.isPlainObject(params)) ? params : [];
    let str = text;
    for (let key in data) {
        let val = data[key];
        str = str.replace('%' + key + '$', val);
    }
    return str;
}
export default Lang;
