/**
 * The main components which controls the pdf.js instance.
 */

import * as React from 'react';
import { useReducer, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import pdfjsLib from 'pdfjs-dist';
import { PDFViewer } from 'pdfjs-dist/lib/web/pdf_viewer';

import { createContext } from './utils/create-context';

/* -----------------------------------------------------------------------------
* Document
* ---------------------------------------------------------------------------*/

type ContextValue = {
  /**
   * The zoom factor that is currently used.
   */
  currentScaleValue: number;
  /**
   * The current page that is displayed.
   */
  currentPage: any;
  getAnnotationsForPage: any;
  workerSrc?: string;
  annotations: any;
  zoomIn: () => void;
  zoomOut: () => void;
  scrollToPage: (pageNumber: number) => void;
};

const [Provider, useContext] = createContext<ContextValue>(
  'ReactPDFJS',
  undefined
);

type UseToolbarContextReturnValue = Pick<
  ContextValue,
  'zoomIn' | 'zoomOut' | 'scrollToPage'
>;

function useToolbarContext(): UseToolbarContextReturnValue {
  const context = useContext('Toolbar');

  return {
    zoomIn: context.zoomIn,
    zoomOut: context.zoomOut,
    scrollToPage: context.scrollToPage,
  };
}

/* ---------------------------------------------------------------------------*/

type State = {
  currentScaleValue: number;
  currentPage?: {
    pageNumber: number;
    rect: { x: number; y: number } | null;
  };
};

type Event =
  | {
      type: 'SET_CURRENT_PAGE';
      payload: {
        pageNumber: number;
        rect: { x: number; y: number } | null;
      };
    }
  | {
      type: 'ZOOM_IN';
      payload: {
        ticks: number;
        scaleDelta: number;
        maxScale: number;
      };
    }
  | {
      type: 'ZOOM_OUT';
      payload: {
        ticks: number;
        scaleDelta: number;
        minScale: number;
      };
    };

function reducer(state: State, event: Event) {
  switch (event.type) {
    case 'SET_CURRENT_PAGE':
      const { payload } = event;

      return {
        ...state,
        currentPage: payload,
      };

    case 'ZOOM_IN': {
      const { scaleDelta, maxScale } = event.payload;
      let ticks = event.payload.ticks;
      let newScale = state.currentScaleValue;
      do {
        newScale = parseFloat((newScale * scaleDelta).toFixed(2));
        newScale = Math.ceil(newScale * 10) / 10;
        newScale = Math.min(maxScale, newScale);
      } while (--ticks > 0 && newScale < maxScale);

      return {
        ...state,
        currentScaleValue: newScale,
      };
    }

    case 'ZOOM_OUT': {
      const { scaleDelta, minScale } = event.payload;
      let ticks = event.payload.ticks;
      let newScale = state.currentScaleValue;

      do {
        newScale = parseFloat((newScale / scaleDelta).toFixed(2));
        newScale = Math.floor(newScale * 10) / 10;
        newScale = Math.max(minScale, newScale);
      } while (--ticks > 0 && newScale > minScale);

      return {
        ...state,
        currentScaleValue: newScale,
      };
    }
  }

  return state;
}

function generateInitializeState(): State {
  return {
    currentScaleValue: 1,
  };
}

/* ---------------------------------------------------------------------------*/

type ReactPDFJsProviderProps = {
  /**
   * Max factor until that a document can be zoomed in.
   */
  maxScale?: number;
  /**
   * Min factor until that a document can be zoomed out.
   */
  minScale?: number;
  /**
   * Amount that should be zoomed in / out.
   */
  scaleDelta?: number;
  workerSrc?: string;
};

function Document({
  maxScale = 10,
  minScale = 0.1,
  scaleDelta = 1.1,
  workerSrc,
  children,
}: React.PropsWithChildren<ReactPDFJsProviderProps>) {
  const [state, send] = useReducer(reducer, undefined, generateInitializeState);

  const scrollToPage = (
    pageNumber: number,
    rect: { x: number; y: number } | null = null
  ) => {
    send({
      type: 'SET_CURRENT_PAGE',
      payload: {
        pageNumber,
        rect,
      },
    });
  };

  const zoomIn = (ticks: number = 0) => {
    send({
      type: 'ZOOM_IN',
      payload: {
        maxScale,
        scaleDelta,
        ticks,
      },
    });
  };

  const zoomOut = (ticks: number = 0) => {
    send({
      type: 'ZOOM_OUT',
      payload: {
        minScale,
        scaleDelta,
        ticks,
      },
    });
  };

  return (
    <Provider
      currentScaleValue={state.currentScaleValue}
      currentPage={state.currentPage}
      annotations={undefined}
      getAnnotationsForPage={() => {}}
      workerSrc={workerSrc}
      scrollToPage={scrollToPage}
      zoomIn={zoomIn}
      zoomOut={zoomOut}
    >
      {children}
    </Provider>
  );
}

/* -----------------------------------------------------------------------------
 * Toolbar
 * ---------------------------------------------------------------------------*/

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

/* -----------------------------------------------------------------------------
 * AnnotationLayerBuilder
 * ---------------------------------------------------------------------------*/

class AnnotationLayerBuilder {
  div: any;
  _cancelled: any;
  annotations: any[];
  pageDiv: any;
  pdfPage: any;
  linkService: any;
  imageResourcesPath: string;
  renderInteractiveForms: any;
  getAnnotationsForPage: any;
  renderAnnotation: any;

  constructor({
    pageDiv,
    pdfPage,
    linkService,
    imageResourcesPath = '',
    renderInteractiveForms = false,
    getAnnotationsForPage,
    renderAnnotation,
  }: any) {
    this.pageDiv = pageDiv;
    this.pdfPage = pdfPage;
    this.linkService = linkService;
    this.imageResourcesPath = imageResourcesPath;
    this.renderInteractiveForms = renderInteractiveForms;
    this.getAnnotationsForPage = getAnnotationsForPage;
    this.renderAnnotation = renderAnnotation;

    this.div = null;
    this._cancelled = false;

    this.annotations = [];

    this.initialize();
  }

  initialize() {
    if (!this.div) {
      this.div = document.createElement('div');
      this.div.className = 'annotationLayer';
      this.pageDiv.appendChild(this.div);

      const AnnotationLayer = this.renderAnnotation;
      ReactDOM.render(
        <AnnotationLayer
          annotations={this.annotations}
          pdfPage={this.pdfPage}
        />,
        this.div
      );
    }
  }

  render(viewport, intent = 'display') {
    const annotations = this.getAnnotationsForPage(this.pdfPage.pageNumber);
    this.annotations = annotations;

    if (this.div) {
      this.show();
    }

    // console.log({ annotations });

    // Request annotations
    // if (this.getAnnotationsForPage) {
    //   this.getAnnotationsForPage(this.pdfPage.pageNumber).then(annotations => {
    //     if (this._cancelled) {
    //       return;
    //     }
    //     let parameters = {
    //       viewport: viewport.clone({ dontFlip: true }),
    //       div: this.div,
    //       annotations,
    //       page: this.pdfPage,
    //       imageResourcesPath: this.imageResourcesPath,
    //       renderInteractiveForms: this.renderInteractiveForms,
    //       linkService: this.linkService,
    //     };
    //     if (this.div) {
    //       // If an annotationLayer already exists, refresh its children's
    //       // transformation matrices.
    //       AnnotationLayer.update(parameters);
    //       this.show();
    //     } else {
    //       // Create an annotation layer div and render the annotations
    //       // if there is at least one annotation.
    //       if (annotations.length === 0) {
    //         return;
    //       }
    //       this.div = document.createElement('div');
    //       this.div.className = 'annotationLayer';
    //       this.pageDiv.appendChild(this.div);
    //       parameters.div = this.div;
    //       AnnotationLayer.render(parameters);
    //     }
    //   });
    // }
  }

  cancel() {
    this._cancelled = true;
  }

  hide() {
    if (!this.div) {
      return;
    }
    this.div.setAttribute('hidden', 'true');
  }

  show() {
    if (!this.div) {
      return;
    }
    this.div.removeAttribute('hidden');
  }
}

/* -----------------------------------------------------------------------------
 * ReactPDFJSViewer
 * ---------------------------------------------------------------------------*/

/**
 * Customized PDF viewer which integrates a custom annotation renderer
 */
class ReactPDFJSViewer extends PDFViewer {
  getAnnotationsForPage: any;
  renderAnnotation: any;
  linkService: any;
  downloadManager: any;
  pdfDocument: any;
  isInPresentationMode: any;
  _setCurrentPageNumber: any;
  _pages: any;
  container: any;

  constructor(options: any) {
    super(options);

    this.getAnnotationsForPage = options.getAnnotationsForPage;
    this.renderAnnotation = options.renderAnnotation;
  }

  createAnnotationLayerBuilder(
    pageDiv,
    pdfPage,
    imageResourcesPath = '',
    renderInteractiveForms = false,
    l10n
  ) {
    return new AnnotationLayerBuilder({
      pageDiv,
      pdfPage,
      imageResourcesPath,
      renderInteractiveForms,
      linkService: this.linkService,
      downloadManager: this.downloadManager,
      getAnnotationsForPage: this.getAnnotationsForPage,
      renderAnnotation: this.renderAnnotation,
    });
  }

  /**
   *
   */
  scrollPageIntoView(params) {
    if (!this.pdfDocument) {
      return;
    }
    let pageNumber = params.pageNumber || 0;
    let dest = params.destArray || null;

    if (this.isInPresentationMode || !dest) {
      this._setCurrentPageNumber(pageNumber, /* resetCurrentPageView = */ true);
      return;
    }

    const pageView = this._pages[pageNumber - 1];
    const { scale, div } = pageView;

    const x = dest[2];
    const y = dest[3];
    const width = dest[4];
    const height = dest[5];

    const scrollTop =
      div.offsetTop +
      pageView.viewport.height * y -
      pageView.viewport.height * 0.05;

    // Scroll to the right edge of the box and subtract the width of the container so that we have
    // more negative space to the left
    const scrollLeft =
      div.offsetLeft +
      pageView.viewport.width * (x + width) -
      this.container.clientWidth +
      pageView.viewport.width * 0.05;

    this.container.scrollTop = scrollTop;
    this.container.scrollLeft = scrollLeft;
  }
}

/* -----------------------------------------------------------------------------
 * Viewer
 * ---------------------------------------------------------------------------*/

function Viewer() {
  const { workerSrc } = useContext('Viewer');
  const containerRef = useRef<HTMLDivElement>();
  const viewerRef = useRef<HTMLDivElement>();
  const viewerCanvasRef = useRef();
  const isInitializedRef = useRef(false);
  const pdfViewerRef = useRef<ReactPDFJSViewer | null>(null);

  useEffect(
    () => {
      // Set worker URL
      if (workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      }

      // Initialize the PDFJS Viewer
      if (!isInitializedRef.current) {
        pdfViewerRef.current = new ReactPDFJSViewer({
          container: containerRef.current,
          viewer: viewerRef.current,
          renderAnnotation: () => {},
          getAnnotationsForPage: () => {},
        });
      }
    },
    [workerSrc]
  );

  return (
    <div
      ref={containerRef}
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
      <div ref={viewerRef} className="pdfViewer" />
    </div>
  );
}

export { Document, Viewer, Toolbar };
