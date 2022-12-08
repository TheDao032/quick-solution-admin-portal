import React from 'react'
import { Link } from 'react-router-dom'
import { Label } from 'reactstrap'

/**
 * Is string?
 * @return {bool|mixed}
 */
export function isString(data, rtnData) {
  let rs = ('[object String]' === Object.prototype.toString.call(data));
  return (undefined !== rtnData) ? (rs ? data : rtnData) : rs;
}

/**
 * Is plain object?
 * @return {bool|mixed}
 */
export function isPlainObject(data, rtnData) {
  let rs = ('[object Object]' === Object.prototype.toString.call(data));
  return (undefined !== rtnData) ? (rs ? data : rtnData) : rs;
}

/**
 * Is boolean?
 * @return {bool|mixed}
 */
export function isBoolean(data, rtnData) {
  let rs = ('[object Boolean]' === Object.prototype.toString.call(data));
  return (undefined !== rtnData) ? (rs ? data : rtnData) : rs;
}
export function isBool(data, rtnData) {
  return isBoolean(data, rtnData);
}

/**
 * Is void (null or undefined)
 * @return {bool}
 */
export function isVoid(data, rtnData) {
  let rs = (data === null) || (data === undefined);
  return (undefined !== rtnData) ? (rs ? data : rtnData) : rs;
}

/**
 * Gen simple unique ID string
 * @return {String}
 */
export function uniqueID() {
  return (new Date().getTime() + Math.random()).toString();
}

/**
 * 
 * @return {String}
 */
/* export function encryptPassword(password) {
    const hash = crypto.createHmac('sha256', encryptPassword.salt)
      .update(password)
      .digest('hex')
    ;
    return hash;
}
encryptPassword.salt = '123-456-789';
*/

/**
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 * @param {Object} b An object containing indexes mapping.
 */
export function shuffle(a, b) {
  var j, x, i;
  b = (typeof b === "object") ? b : {};
  for (i = a.length - 1; i >= 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    b[i] = j;
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

/**
 * Config table object?
 * @return {Object}
 */
export function configTableOptions(count, page, query) {
  return {
    fixedHeader: true,
    filterType: 'dropdown',
    selectableRows: 'single',
    responsive: 'stacked',
    count: count,
    page: 0,
    rowsPerPage: query.itemsPerPage,
    rowsPerPageOptions: [25, 50, 75, 100],
    download: false,
    print: false,
    viewColumns: false,
    search: false,
    filter: false,
    pagination: false,
    textLabels:{
      body: {
        noMatch: "Không tìm thấy dữ liệu.",
        toolTip: "Sắp xếp",
      },
      pagination: {
        next: "Trang tiếp theo",
        previous: "Trang trước đó",
        rowsPerPage: "Số dòng trên trang:",
        displayRows: "của",
      },
    },
  };
}

/**
 * Config table STT object?
 * @return {Object}
 */
export function configIDRowTable(fied = "", url = "", query = {}, customSTT = null) {
  return {
    name: fied,
    label: "STT",
    options: {
      filter: false,
      sort: false,
      customHeadRender: (columnMeta, handleToggleColumn) => {
        return (
          <th
            key={`head-th-${columnMeta.label}`}
            className="MuiTableCell-root MuiTableCell-head"
            style={{ 'width': '20px'}}
          >
            <div className="text-center">
              {columnMeta.label}
            </div>
          </th>
        )
      },
      customBodyRender: (value, tableMeta, updateValue) => {
        let stt = query.page > 1 ? ((query.page - 1) * query.itemsPerPage) + (tableMeta.rowIndex + 1) : tableMeta.rowIndex + 1;
        stt = customSTT ? tableMeta.rowData[customSTT] : stt;
        return (
          <div
            // className={!customSTT ? "text-center" : ""}
            className="text-center"
            style={{
              'width': '40px',
              'textOverflow': 'ellipsis',
              'overflow': 'hidden',
              'whiteSpace': 'nowrap',
            }}
          >
            {
              url ? (
                <Link to={`${url}${value}`}>
                  {stt}
                </Link>
              ) : 
              <Label>
                {stt}
              </Label>
            }
          </div>
        );
      }
    },
  }
}

// @var {Intl.NumberFormat}
const numberFormatIntl = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
/**
 * Number format
 * @param {Number|String} val
 * @return {String}
 */
export function numberFormat(val) {
  return numberFormatIntl.format(val);
}
