import * as React from 'react';
import styled from 'styled-components';
import PDFJS, { Viewer } from '@fwh/react-pdfjs';

import '@fwh/react-pdfjs/dist/index.css';
import './app.css';

import PdfToolbar from './components/pdf-toolbar';

const pathToPDFWorker = 'https://unpkg.com/pdfjs-dist@2.0.489/build/pdf.worker.min.js';
const pathToPdf = './helloworld.pdf';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ViewerContainer = styled.div`
  flex: 1;
  position: relative;
  background-color: #333;
`;

class App extends React.Component {
  annotationsForPage = async () => {
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

  render() {
    return (
      <Wrapper>
        <PDFJS
          file={pathToPdf}
          annotationsForPage={this.annotationsForPage}
          workerSrc={pathToPDFWorker}
        >
          <PdfToolbar />
          <ViewerContainer>
            <Viewer />
          </ViewerContainer>
        </PDFJS>
      </Wrapper>
    );
  }
}

export default App;
