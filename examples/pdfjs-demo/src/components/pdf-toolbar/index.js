// @flow

import * as React from 'react';
import styled from 'styled-components';
import { Toolbar } from '@fwh/react-pdfjs';

const Bar = styled.div`
  height: 40px;
  background-color: red;
`;

type Props = {};

type State = {
  goToPage: number,
};

class PdfToolbar extends React.Component<Props, State> {
  state = {
    goToPage: 0,
  };

  render() {
    return (
      <Bar>
        <Toolbar>
          {({ zoomOut, zoomIn, scrollToPage }) => (
            <div>
              <button onClick={zoomOut}>Zoom -</button>
              <button onClick={zoomIn}>Zoom +</button>

              <input
                type="text"
                value={this.state.goToPage}
                onChange={e =>
                  this.setState({
                    goToPage: e.target.value,
                  })
                }
                size="4"
              />

              <button onClick={() => scrollToPage(this.state.goToPage)}>Go!</button>
            </div>
          )}
        </Toolbar>
      </Bar>
    );
  }
}

export default PdfToolbar;
