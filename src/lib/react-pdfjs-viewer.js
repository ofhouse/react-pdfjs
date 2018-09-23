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
}

export default ReactPDFJSViewer;
