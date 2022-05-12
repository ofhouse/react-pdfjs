// @flow

import * as React from 'react';

import { withPdfJsContext } from './context';
import type { ToolbarContext } from './types';

type RenderProps = {
  zoomIn: () => any,
};

type Props = {
  render?: (props: RenderProps) => any,
  children?: (props: RenderProps) => any,
  reactPdfjs: ToolbarContext,
};

class Toolbar extends React.Component<Props> {
  render() {
    const { reactPdfjs } = this.props;

    const renderProps: RenderProps = {
      zoomIn: reactPdfjs.zoomIn,
      zoomOut: reactPdfjs.zoomOut,
      scrollToPage: reactPdfjs.scrollToPage,
    };

    if (this.props.render) {
      return this.props.render(renderProps);
    }

    if (this.props.children) {
      return this.props.children(renderProps);
    }

    return null;
  }
}

const ConnectedToolbar = withPdfJsContext(Toolbar);

export { ConnectedToolbar as Toolbar };
