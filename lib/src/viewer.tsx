/**
 * React-PDFJS Viewer
 *
 * Provides the canvas where the pdf is rendered in
 */

import * as React from 'react';
import pdfjsLib from 'pdfjs-dist';
import { normalizeWheelEventDelta } from 'pdfjs-dist/lib/web/ui_utils';

import ReactPDFJSViewer from './lib/react-pdfjs-viewer';
import { withPdfJsContext } from './context';

import type { ViewerContext } from './types';

// Constants
const DEFAULT_SCALE_DELTA = 1.1;

const MIN_SCALE = 0.1;
const MAX_SCALE = 10.0;

type Props = {
  reactPdfjs: ViewerContext,
  renderAnnotation: React.ReactNode,
  file: string,
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

  zoomOut = (ticks: number = 0) => {
    let newScale = this.pdfViewer.currentScale;
    do {
      newScale = parseFloat((newScale / DEFAULT_SCALE_DELTA).toFixed(2));
      newScale = Math.floor(newScale * 10) / 10;
      newScale = Math.max(MIN_SCALE, newScale);
    } while (--ticks > 0 && newScale > MIN_SCALE);

    try {
      this.pdfViewer.currentScaleValue = newScale;
    } catch (err) {
      // TODO: Catch rotation error
    }
  };

  zoomIn = (ticks: number = 0) => {
    let newScale = this.pdfViewer.currentScale;
    do {
      newScale = parseFloat((newScale * DEFAULT_SCALE_DELTA).toFixed(2));
      newScale = Math.ceil(newScale * 10) / 10;
      newScale = Math.min(MAX_SCALE, newScale);
    } while (--ticks > 0 && newScale < MAX_SCALE);

    try {
      this.pdfViewer.currentScaleValue = newScale;
    } catch (err) {
      // TODO: Catch rotation error
    }
  };

  webViewerWheel = evt => {
    const container = this.container.current;

    const pdfViewer = this.pdfViewer;
    if (pdfViewer.isInPresentationMode) {
      return;
    }

    if (evt.ctrlKey || evt.metaKey) {
      // Only zoom the pages, not the entire viewer.
      evt.preventDefault();

      let previousScale = pdfViewer.currentScale;

      let delta = normalizeWheelEventDelta(evt);

      const MOUSE_WHEEL_DELTA_PER_PAGE_SCALE = 3.0;
      let ticks = delta * MOUSE_WHEEL_DELTA_PER_PAGE_SCALE;
      if (ticks < 0) {
        this.zoomOut(-ticks);
      } else {
        this.zoomIn(ticks);
      }

      let currentScale = pdfViewer.currentScale;
      if (previousScale !== currentScale) {
        // After scaling the page via zoomIn/zoomOut, the position of the upper-
        // left corner is restored. When the mouse wheel is used, the position
        // under the cursor should be restored instead.
        let scaleCorrectionFactor = currentScale / previousScale - 1;
        let rect = container.getBoundingClientRect();
        let dx = evt.clientX - rect.left;
        let dy = evt.clientY - rect.top;
        container.scrollLeft += dx * scaleCorrectionFactor;
        container.scrollTop += dy * scaleCorrectionFactor;
      }
    }
  };

  bindEvents = () => {
    const container = this.container.current;

    window.addEventListener('wheel', this.webViewerWheel);

    // automatically find the right scaling for the pages
    container.addEventListener('pagesinit', () => {
      this.pdfViewer.currentScaleValue = 'auto';
    });
  };

  unbindEvents = () => {
    window.removeEventListener('wheel', this.webViewerWheel);
  };

  initialize() {
    const viewerOptions = {
      container: this.container.current,
      viewer: this.viewer.current,
      renderAnnotation: this.props.renderAnnotation,
      getAnnotationsForPage: this.props.reactPdfjs.getAnnotationsForPage,
    };

    this.pdfViewer = new ReactPDFJSViewer(viewerOptions);
  }

  scrollPageIntoView = (pageNumber, rect) => {
    let dest = null;
    if (rect) {
      dest = [null, { name: 'FitR' }, rect.x, rect.y, rect.width, rect.width, rect.height];
    }

    this.pdfViewer.scrollPageIntoView({ pageNumber, destArray: dest });
  };

  loadFile(file: string) {
    // Load the file into the viewer
    const loadingTask = pdfjsLib.getDocument(file);
    loadingTask.promise
      .then(pdfDocument => {
        this.pdfViewer.setDocument(pdfDocument);
      })
      .catch(err => {
        // TODO: Error handling
        console.log(err);
      });
  }

  componentDidMount() {
    // Initialize the viewer
    this.initialize();
    this.loadFile(this.props.file);

    this.bindEvents();
  }

  componentWillUnmount() {
    this.unbindEvents();
  }

  shouldComponentUpdate(nextProps) {
    // To updates on the pdfViewer
    if (this.props.reactPdfjs.currentScaleValue !== nextProps.reactPdfjs.currentScaleValue) {
      try {
        this.pdfViewer.currentScaleValue = nextProps.reactPdfjs.currentScaleValue;
      } catch (err) {
        // TODO: Try to find the error
      }
    }

    // Check if current page is changed
    if (!isObjectEqual(this.props.reactPdfjs.currentPage, nextProps.reactPdfjs.currentPage)) {
      this.scrollPageIntoView(
        nextProps.reactPdfjs.currentPage.pageNumber,
        nextProps.reactPdfjs.currentPage.rect
      );
    }

    // File in the viewer has changed
    if (nextProps.file !== this.props.file) {
      this.loadFile(nextProps.file);
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
