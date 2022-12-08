import React, { PureComponent } from "react";
// import ReactDOM from "react-dom";
import JqxGrid, { jqx } from 'jqwidgets-scripts/jqwidgets-react-tsx/jqxgrid';

// Models
import UserModel from '../../models/UserModel';

/**
 * @class StdJqxGrid
 */
export default class StdJqxGrid extends PureComponent {
  /**
   * @var {Object}
   */
  source = {
    url: "",
    data: {
      _jqxact: "read"
    },
    datatype: "json",
    type: "GET",
    id: "id",
    root: "items",
    totalrecords: 0,
    async: true
  }

  /**
   * @protected
   * @param {*} columns 
   */
  _formatColumns(columns)
  {
    if (!(columns instanceof Array)) {
      columns = [];
    }
    return columns;
  }

  /**
   * @protected
   * @param {*} _source 
   */
  _formatSource(_source)
  {
    let source = Object.assign({}, this.source, _source);
    Object.assign(source, {
      // update the grid and send a request to the server.
      sort: () => {
        this._refGrid.updatebounddata('sort');
      },
      // update the grid and send a request to the server.
      filter: () => {
        this._refGrid.updatebounddata('filter');
      },
      // +++
      beforeSend: function(jqXHR) {
        let hAuth = UserModel.buildAuthHeader();
        // console.log('beforeSend:', hAuth);
        if (hAuth.name && hAuth.value) {
          jqXHR.setRequestHeader(hAuth.name, hAuth.value);
        }
      },
    });
    // console.log('source: ', source);
    source = new jqx.dataAdapter(source);
    return source;
  }

  constructor(props) {
    super(props);

    // Bind method(s)
    this._formatColumns = this._formatColumns.bind(this);
    this._formatSource = this._formatSource.bind(this);
    this.onGridReady = this.onGridReady.bind(this);
    this.onGridRenderRows = this.onGridRenderRows.bind(this);

    // Init state
    this.state = {
      columns: this._formatColumns(props.columns),
      source: this._formatSource(props.source)
    };
  }

  onGridReady()
  {
  }

  onGridRenderRows(params) {
    return params.data;
  }

  /**
   * @protected
   * @component
   */
  _gridToolbarContainer = (props) => {
    return (
      <div
        id="grid-toolbar-cont0"
        className={"grid-toolbar grid-toolbar-" + window._$g.theme}
        {...props}
      />
    );
  }

  /**
   * @public
   */
  refresh()
  {
    let groups = this._refGrid.groups || [];
    let pos = this._refGrid.scrollposition();
    this._refGrid.updatebounddata();
    groups.forEach((dfd) => {
      this._refGrid.addgroup(dfd);
    });
    setTimeout(() => {
      this._refGrid.scrolloffset(pos.top, pos.left);
    }, 300);
  }

  render() {
    let {
      ready,
      renderToolbarItems,
      innerRef, // get real ref of JqxGrid instance
      ...props
    } = this.props;

    return (
      <div className="clearfix full-wh">
        {/* toolbar */}
        {(renderToolbarItems || null) && renderToolbarItems(this._gridToolbarContainer)}
        {/* .end#toolbar */}
        <JqxGrid
          // theme, +size
          theme={window._$g.theme}
          width={"100%"}
          height={"100%"}
          // data
          // selectedrowindex={0}
          showemptyrow={false}
          //  |columns
          columnsresize={true}
          //  |source
          // ...
          // toolbar
          showtoolbar={false}
          //  |events
          // rendertoolbar={this.onGridRenderToolbar}
          // sort
          sortable={false}
          sorttogglestates={2}
          altrows={true}
          //  |events
          // onSort={this.myGridOnSort}
          // filter
          filterable={true}
          autoshowfiltericon={true}
          showfilterrow={true}
          //  |events
          // onFilter={this.myGridOnFilter}
          // paging
          pageable={true}
          pagesize={25}
          pagesizeoptions={['15', '25', '35', '45']}
          virtualmode={true}
          //  |events
          rendergridrows={this.onGridRenderRows}
          // statusbar
          showstatusbar={false}
          //  |events
          // renderstatusbar={this.onGridRenderStatusbar}
          // ref
          ref={(ref) => {
            innerRef && innerRef(ref);
            return (window._$refGrid0 = (this._refGrid = ref));
          }}
          // events
          ready={(event) => {
            this.onGridReady(event);
            ready && ready(event);
          }}
          bindingcomplete={(evt) => {
            console.log('bindingcomplete', evt);
          }}
          // ...
          {...props}
          // Overwrite
          // data
          //  |columns
          columns={this.state.columns}
          //  |source
          source={this.state.source}
          //  |events
        />
      </div>
    );
  }
}
// Make alias
// const _static = StdJqxGrid;

// Temp fix: resize sidebar --> resize jqxgrid
(function (doc) {
  doc.addEventListener('click', function(evt) {
    let btn1st = doc.querySelector('button.sidebar-minimizer');
    let btn2nd = (doc.querySelectorAll('button.navbar-toggler') || [])[1];
    let span1st = btn2nd && btn2nd.querySelector('span.navbar-toggler-icon');
    if ((btn1st === evt.target) || (span1st === evt.target)) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 250);
    }
  }, false);
})(document);
//.end
