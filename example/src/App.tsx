import { Document, Viewer, Toolbar } from '@fwh/react-pdfjs';
import * as React from 'react';
import { useState } from 'react';

import '@fwh/react-pdfjs/dist/index.css';
import './app.css';

import PdfToolbar from './components/pdf-toolbar';

const pathToPDFWorker =
  'https://unpkg.com/pdfjs-dist@2.0.489/build/pdf.worker.min.js';
const pathToPdf = './test.pdf';

function App() {
  const [annotations] = useState({
    '1': [
      {
        title: 'test',
      },
    ],
  });

  const annotationsForPage = () => {
    return [
      {
        offsetX: 50,
        offsetY: 50,
        width: 10,
        height: 10,
        backgroundColor: 'rgba(223, 0, 174, 0.12)',
        borderWidth: '2px',
        borderColor: '#DF00AE',
      },
    ];
  };

  return (
    <div className="wrapper">
      <Document
        file={pathToPdf}
        annotations={annotations}
        annotationsForPage={annotationsForPage}
        workerSrc={pathToPDFWorker}
      >
        <PdfToolbar />
        <div className="viewer-container">
          <Viewer renderAnnotation={() => <div>xd</div>} />
        </div>
      </Document>
    </div>
  );
}

export default App;