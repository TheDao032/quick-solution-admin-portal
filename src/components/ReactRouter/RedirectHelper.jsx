import React, { PureComponent } from "react";
import { Redirect } from "react-router-dom";

/**
 * @class RedirectHelper
 */
class RedirectHelper extends PureComponent {
  constructor(props) {
    super(props);

    // Init state
    this.state = {
      key: null,
      props: null
    };

    // Bind method(s)
    this.go = this.go.bind(this);
  }

  /**
   * @public
   */
  go(to) {
    if (typeof to === 'number') {
      return window.history.go(to);
    }
    if (to) {
      let props = {};
      if (typeof to === 'string') {
        Object.assign(props, { to, push: !('/404' === to) });
        console.warn(`[rdr] ${window.location.toString()}`);
      } else {
        props = to;
      }
      let key = '' + (new Date().getTime() + Math.random());
      this.setState({ key, props });
    }
  }

  render() {
    let { key, props } = this.state;
    return (
      props ? <Redirect key={key} push {...props} /> : null
    );
  }
}

export default RedirectHelper;
