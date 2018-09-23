/**
 * The main components which controls the pdf.js instance
 *
 * @flow
 */
import * as React from 'react';

import type { ReactContext } from './types';

const PdfjsContext = React.createContext({});
const withPdfJsContext = (
  Component: React.ComponentType<any>,
  contextType: string = 'toolbarContext'
) =>
  React.forwardRef((props: any, ref) => (
    <PdfjsContext.Consumer>
      {(context: ReactContext) => (
        <Component {...props} reactPdfjs={context[contextType]} ref={ref} />
      )}
    </PdfjsContext.Consumer>
  ));

// Constants
const DEFAULT_SCALE_DELTA = 1.1;

const MIN_SCALE = 0.1;
const MAX_SCALE = 10.0;

type Props = {
  annotationsForPage: () => any,
  children: React.Node,
  file: string,
  workerSrc?: string,
};

type State = {
  context: ReactContext,
};

class ReactPdfjs extends React.Component<Props, State> {
  updateViewerState = (key: string, value: any) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        context: {
          ...prevState.context,
          viewerContext: {
            ...prevState.context.viewerContext,
            [key]: value,
          },
        },
      };

      return newState;
    });
  };

  scrollToPage = (pageNumber: number) => {
    const params = {
      pageNumber,
    };

    this.updateViewerState('currentPage', params);
  };

  zoomIn = (ticks: number = 0) => {
    let newScale = this.state.context.viewerContext.currentScaleValue;
    do {
      newScale = parseFloat((newScale * DEFAULT_SCALE_DELTA).toFixed(2));
      newScale = Math.ceil(newScale * 10) / 10;
      newScale = Math.min(MAX_SCALE, newScale);
    } while (--ticks > 0 && newScale < MAX_SCALE);

    this.updateViewerState('currentScaleValue', newScale);
  };

  zoomOut = (ticks: number = 0) => {
    let newScale = this.state.context.viewerContext.currentScaleValue;
    do {
      newScale = parseFloat((newScale / DEFAULT_SCALE_DELTA).toFixed(2));
      newScale = Math.floor(newScale * 10) / 10;
      newScale = Math.max(MIN_SCALE, newScale);
    } while (--ticks > 0 && newScale > MIN_SCALE);

    this.updateViewerState('currentScaleValue', newScale);
  };

  state = {
    context: {
      viewerContext: {
        file: this.props.file,
        currentScaleValue: 1.0,
        currentPage: {},
        getAnnotationsForPage: this.props.annotationsForPage,
        workerSrc: this.props.workerSrc || null,
      },
      toolbarContext: {
        zoomIn: this.zoomIn,
        zoomOut: this.zoomOut,
        scrollToPage: this.scrollToPage,
      },
    },
  };

  render() {
    return (
      <PdfjsContext.Provider value={this.state.context}>
        {this.props.children}
      </PdfjsContext.Provider>
    );
  }
}

export { ReactPdfjs, withPdfJsContext };
