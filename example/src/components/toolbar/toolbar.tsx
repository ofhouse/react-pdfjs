import * as React from 'react';
import { useState } from 'react';
import { Toolbar } from '@fwh/react-pdfjs';

function PdfToolbar() {
  const [goToPage, setGoToPage] = useState(0);

  return (
    <div className="toolbar">
      <Toolbar>
        {({ zoomOut, zoomIn, scrollToPage }) => (
          <div>
            <button onClick={zoomOut}>Zoom -</button>
            <button onClick={zoomIn}>Zoom +</button>

            <input
              type="text"
              value={goToPage}
              onChange={(e) => setGoToPage(parseInt(e.target.value))}
            />

            <button onClick={() => scrollToPage(goToPage)}>Go!</button>
          </div>
        )}
      </Toolbar>
    </div>
  );
}

export { PdfToolbar };
