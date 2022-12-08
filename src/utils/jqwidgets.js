/**
 * Return jqx's grid columns
 * @param {Array} columns columns data
 * @param {Object} opts Options
 * @return {Array}
 */
export function jqxGridColumns(_columns, opts) {
  opts = Object.assign({}, opts);
  let columns = (_columns || []).concat([]);
  let datafields = [];
  let columngroups = {};
  if (columns instanceof Array && columns.length) {
    let prefix = opts.prefix || "";
    for (let idx in columns) {
      let col = columns[idx] = Object.assign({}, columns[idx]);
      // Modify?
      if (typeof opts.alterColumn === "function") {
        opts.alterColumn(col);
      }
      // Datafields:
      let datafield =
        col["datafield"] instanceof Array
          ? col["datafield"]
          : [col["datafield"]];
      let dfdName = datafield[0],
        dfdProps = datafield[1];
      dfdName = (dfdName instanceof Array) ? dfdName[0] : dfdName ? prefix + dfdName : "";
      datafield = Object.assign({}, dfdProps);
      datafield["name"] = dfdName;
      if (typeof opts.alterDatafield === "function") {
        datafield = opts.alterDatafield(datafield);
      }
      datafields.push(datafield);
      //.end
      // Column groups:
      let columngroup = null;
      if (col["columngroup"]) {
        columngroup =
          col["columngroup"] instanceof Array
            ? col["columngroup"]
            : [col["columngroup"]];
        let cgName = columngroup[0],
          cgProps = columngroup[1];
        columngroup = Object.assign({}, cgProps);
        columngroup["name"] = cgName;
        columngroup = Object.assign(columngroups[cgName] || {}, columngroup);
        if (typeof opts.alterColumngroup === "function") {
          opts.alterColumnGroup(columngroup);
        }
        columngroups[cgName] = columngroup;
      }
      //.end
      // Columns:
      if (!col["text"]) {
        delete columns[idx];
      } else {
        col["datafield"] = datafield["name"];
        if (columngroup && columngroup["name"]) {
          col["columngroup"] = columngroup["name"];
        }
      }
      //.end
    }
  }
  // Set defaults
  columns = Object.values(columns);
  if (columns && columns.length) {
    // @TODO: Row number column
    columns = [
      {
        cellsrenderer: (row/*, column, value*/) => {
          return '<div class="jqxgrid-cellno">' + (row + 1) + '</div>';
        },
        pinned: true,
        align : 'center',
        cellsalign : 'center',
        columntype: 'number',
        datafield: '',
        draggable: false,
        editable: false,
        filterable: false,
        groupable: false,
        resizable: false,
        sortable: false,
        text: '#',
        width: '1%'
      }
    ].concat(columns);
    //
    columns.forEach(col => {
      if (!col.filtertype) {
        col.filtertype = 'input'
      }
    });
  }
  // +++
  columngroups = Object.values(columngroups);
  columngroups = columngroups.length ? columngroups : null;
  // Return
  return {
    columns,
    datafields,
    columngroups
  };
}

/**
 * Make query builder from jqx request payload
 * @param array $data Request payload
 * @param null $totalRowsQB Illuminate\Database\Eloquent\Builder
 * @param array $opts
 * @return Illuminate\Database\Eloquent\Builder
 */
export function qBFromJqxRequestPayload(data, opts) {}

/**
 * Helper: parse jqx's datetime string
 * @param {String} datetime
 * @param {Object} opts Pptions
 * @return Date
 */
export function parseDateTimeJqx(datetime, opts) {
  // 'D M d Y H:i:s e+'
  let date = new Date(datetime);
  return date;
}
