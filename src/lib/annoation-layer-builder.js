import * as React from 'react';
import ReactDOM from 'react-dom';

import { AnnotationLayer } from './annotation-layer';

import ReactAnnotationLayer from '../annotation-layer';

class AnnotationLayerBuilder {
  constructor({
    pageDiv,
    pdfPage,
    linkService,
    imageResourcesPath = '',
    renderInteractiveForms = false,
    getAnnotationsForPage,
  }) {
    this.pageDiv = pageDiv;
    this.pdfPage = pdfPage;
    this.linkService = linkService;
    this.imageResourcesPath = imageResourcesPath;
    this.renderInteractiveForms = renderInteractiveForms;
    this.getAnnotationsForPage = getAnnotationsForPage;

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
      ReactDOM.render(<ReactAnnotationLayer annotations={this.annotations} />, this.div);
    }
  }

  render(viewport, intent = 'display') {
    const annotations = this.getAnnotationsForPage(this.pdfPage.pageNumber);
    this.annotations = annotations;

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

export { AnnotationLayerBuilder };
