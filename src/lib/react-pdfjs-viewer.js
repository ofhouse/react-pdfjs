/**
 * Customized PDF viewer which integrates a custom annotation renderer
 *
 * @flow
 */

import { PDFViewer } from 'pdfjs-dist/lib/web/pdf_viewer';

import { AnnotationLayerBuilder } from './annoation-layer-builder';

class ReactPDFJSViewer extends PDFViewer {
  constructor(options) {
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
      div.offsetTop + pageView.viewport.height * y - pageView.viewport.height * 0.05;

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

export default ReactPDFJSViewer;
