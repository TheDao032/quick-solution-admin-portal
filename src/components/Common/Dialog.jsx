import React, { PureComponent } from 'react'
import { Button } from 'reactstrap'

// Material
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'

/**
 * @class Transition
 */
class Transition extends PureComponent
{
  render() {
    return <Slide direction="down" {...this.props} />
  }
}

/**
 * @class ModalDialog
 */
export default class ModalDialog extends PureComponent {

  /** @var {Array} */
  _list = [];

  /** @var {String} */
  static title = 'Cảnh báo';

  constructor(props)
  {
    super(props);

    // Bind method(s)
    this.handleClose = this.handleClose.bind(this);

    // Init state
    // +++
    let { infos = {} } = props;
    this._dialog = {
      _index: 0,
      open: !!props.open,
      title: infos.title || '',
      content: infos.content || '',
      handleClose: props.handleClose,
      opts: {}
    };
    // +++
    this.state = {
      /** @var Array */
      dialogs: []
    };
  }

  /**
   * @protected
   */
  handleClose(_dialog, result)
  {
    let { dialogs } = this.state;
    let fIdx = dialogs.findIndex(item => item === _dialog);
    if (fIdx >= 0) {
      let { handleClose } = _dialog;
      let _result = handleClose && handleClose(result);
      if (false !== _result) {
        dialogs = dialogs.concat([]);
        dialogs.splice(fIdx, 1);
        //
        this.setState({ dialogs });
      }
    }
  }

  /**
   * alert
   * @public
   * @param {String} content
   * @param {String|null} title
   * @param {Function|undefined|null} handleClose
   * @param {Object|null} opts Options
   * @return void
   */
  alert(content, title, handleClose, opts = {}) {
    if (typeof title === 'function' && undefined === handleClose) {
      handleClose = title;
      title = null;
    }
    // Case: jwt expired?!
    if (content && content.match('(jwt expired)')) {
      return console.log('!!!ignored [jwt expired] alert!!!');
    }
    //.end
    let { dialogs } = this.state;
    dialogs = dialogs.concat([
      {...this._dialog, ...{ open: 'alert', title, content, handleClose, opts }}
    ]);
    this.setState({ dialogs });
  }

  /**
   * prompt
   * @public
   * @param {String} content
   * @param {String|Function} title
   * @param {Function|undefined|null} handleClose
   * @param {Object|null} opts Options
   * @return void
   */
  prompt(content, title, handleClose, opts = {}) {
    if (typeof title === 'function' && !handleClose) {
      handleClose = title;
      title = null;
    }
    let { dialogs } = this.state;
    dialogs = dialogs.concat([
      {...this._dialog, ...{ open: 'prompt', title, content, handleClose, opts }}
    ]);
    this.setState({ dialogs });
  }

  render() {
    const { dialogs } = this.state;
    let html = dialogs.map((_dialog, _dIdx) => {
      const { open, title, content, opts } = _dialog;

      // Button components
      const btnComponents = [
        (false === opts.btnYesLabel) ? null : <Button key="btn-yes" onClick={() => this.handleClose(_dialog, true)} color="primary">
          {window._$g._(opts.btnYesLabel || 'Đồng ý')}
        </Button>,
        ('prompt' === open && (false !== opts.btnNoLabel)) ? <Button key="btn-no" onClick={() => this.handleClose(_dialog, false)}>
          {window._$g._(opts.btnNoLabel || 'Hủy bỏ')}
        </Button> : null
      ];
      if ('function' === typeof opts.btnComponents) {
        opts.btnComponents(btnComponents, { handleClose: (result) => {
          this.handleClose(_dialog, result);
        } });
      }

      return (
        <Dialog
          key={`dialog-${_dIdx}`}
          open={!!open}
          TransitionComponent={Transition}
          keepMounted
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
          {...opts.propsDialog}
        >
          <DialogTitle id="alert-dialog-slide-title">
            {window._$g._(title || _static.title)}
          </DialogTitle>
          <DialogContent {...opts.propsDialogContent}>
          {'string' === typeof(content)
            ? <DialogContentText id="alert-dialog-slide-description">{content}</DialogContentText>
            : content
          }
          </DialogContent>
          <DialogActions {...opts.propsDialogActions}>{btnComponents}</DialogActions>
        </Dialog>
      );
    });
    return html;
  }
}
// Make alias
const _static = ModalDialog;