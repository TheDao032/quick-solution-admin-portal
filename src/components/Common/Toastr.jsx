import React, { PureComponent } from 'react';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
  success: {
    backgroundColor: 'green',
  },
  error: {
    backgroundColor: 'red',
  },
  info: {
    backgroundColor: 'blue',
  },
  warning: {
    backgroundColor: 'yellow',
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

/**
 * @class Toastr
 */
class Toastr extends PureComponent {
  constructor(props)
  {
    super(props);

    // Bind method(s)
    this.handleClose = this.handleClose.bind(this);

    // Init state
    // +++
    let { infos = {} } = props;
    // +++
    this.state = {
      open: !!props.open,
      icon: infos.icon || '',
      message: infos.message || '',
    };
  }

  /**
   * @protected
   */
  handleClose(result)
  {
    this.setState({ open: false });
  }

  /**
   * alert
   * @public
   * @param {String} icon
   * @param {String|null} message
   * @return void
   */
  show(message, icon) {
    this.setState({ open: true, icon, message });
  }

  render() {
    const { open, icon, message } = this.state;
    const { classes } = this.props;
    let renderIcon
    switch(icon) {
      case 'success':
        renderIcon = <CheckCircleIcon style={{ fontSize: 20, marginRight: 15, opacity: 0.9 }} />
        break
      case 'warning':
        renderIcon = <WarningIcon style={{ fontSize: 20, marginRight: 15, opacity: 0.9 }} />
        break
      case 'error':
        renderIcon = <ErrorIcon style={{ fontSize: 20, marginRight: 15, opacity: 0.9 }} />
        break
      default:
        renderIcon = <InfoIcon style={{ fontSize: 20, marginRight: 15, opacity: 0.9 }} />
        break
    }

    return (
      <Snackbar
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal:'right' }}
        open={open}
        onClose={this.handleClose}
      >
        <SnackbarContent
          className={classes[icon]}
          aria-describedby="client-snackbar"
          message={
            <span id="client-snackbar" className={classes.message}>
              {renderIcon}
              {window._$g._(message)}
            </span>
          }
          action={[
            <IconButton key="close" aria-label="close" color="inherit" onClick={this.handleClose}>
              <CloseIcon className={classes.icon} />
            </IconButton>,
          ]}
        />
      </Snackbar>
    );
  }
}

export default withStyles(styles)(Toastr);