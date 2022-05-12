import * as React from 'react';

import { useToolbarContext } from './react-pdfjs';

type RenderProps = {
  zoomIn: () => void;
  zoomOut: () => void;
  scrollToPage: (pageNumber: number) => void;
};

type ToolbarProps = {
  render?: (props: RenderProps) => React.ReactElement;
  children?: (props: RenderProps) => React.ReactElement;
};

function Toolbar({ render, children }: ToolbarProps) {
  const renderProps = useToolbarContext();
  const renderFn = render || children;

  if (renderFn) {
    return renderFn(renderProps);
  }

  return null;
}

export { Toolbar };
