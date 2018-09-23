/**
 * React-PDFJS Viewer
 *
 * Provides the canvas where the pdf is rendered in
 *
 * @flow
 */

import * as React from 'react';
import pdfjsLib from 'pdfjs-dist';

import ReactPDFJSViewer from './lib/react-pdfjs-viewer';
import { withPdfJsContext } from './react-pdfjs';

import type { ViewerContext } from './types';

type Props = {
  reactPdfjs: ViewerContext,
};

function isObjectEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

class Viewer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    // Set worker URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = props.reactPdfjs.workerSrc;
  }

  // Typings
  pdfViewer: typeof ReactPDFJSViewer;

  container = React.createRef();
  viewer = React.createRef();

  viewerCanvas = React.createRef();

  initialize() {
    const viewerOptions = {
      container: this.container.current,
      viewer: this.viewer.current,
      getAnnotationsForPage: this.props.reactPdfjs.getAnnotationsForPage,
    };

    this.pdfViewer = new ReactPDFJSViewer(viewerOptions);
  }

  scrollPageIntoView = pageNumber => {
    this.pdfViewer.scrollPageIntoView({ pageNumber });
  };

  componentDidMount() {
    // Initialize the viewer
    this.initialize();

    // Load the file into the viewer
    const loadingTask = pdfjsLib.getDocument(this.props.reactPdfjs.file);
    loadingTask.promise
      .then(pdfDocument => {
        this.pdfViewer.setDocument(pdfDocument);
      })
      .catch(err => {
        // TODO: Error handling
        console.log(err);
      });
  }

  shouldComponentUpdate(nextProps) {
    // To updates on the pdfViewer
    this.pdfViewer.currentScaleValue = nextProps.reactPdfjs.currentScaleValue;

    // Check if current page is changed
    if (!isObjectEqual(this.props.reactPdfjs.currentPage, nextProps.reactPdfjs.currentPage)) {
      this.scrollPageIntoView(nextProps.reactPdfjs.currentPage.pageNumber);
    }

    // Prevent rerender of the canvas
    return false;
  }

  render() {
    return (
      <div
        ref={this.container}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          height: '100%',
          overflow: 'auto',
        }}
      >
        <div ref={this.viewer} className="pdfViewer" />
      </div>
    );
  }
}

const ConnectedViewer = withPdfJsContext(Viewer, 'viewerContext');

export { ConnectedViewer as Viewer };
