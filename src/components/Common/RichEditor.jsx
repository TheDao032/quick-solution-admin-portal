import React, { PureComponent } from 'react';

import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File


/**
 * @class RichEditor
 */
class RichEditor extends PureComponent {
  constructor(props)
  {
    super(props);
    // +++
    this.state = {};
  }

  render() {
    return (
      <SunEditor
        {...this.props}
        setOptions={{
          //plugins: plugins,
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['paragraphStyle'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['fontColor', 'hiliteColor', 'textStyle'],
            ['removeFormat'],
            '/', // Line break
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['table', 'link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print'],
          ]
        }}
      />
    );
  }
}

export default RichEditor;