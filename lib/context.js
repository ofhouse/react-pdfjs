/**
 * @flow
 */

import * as React from 'react';

import type { ReactContext } from './types';

const PdfjsContext = React.createContext({});

const Provider = PdfjsContext.Provider;

const withPdfJsContext = (
  Component: React.ComponentType<any>,
  contextType: string = 'toolbarContext'
) =>
  React.forwardRef((props: any, ref) => (
    <PdfjsContext.Consumer>
      {(context: ReactContext) => (
        <Component {...props} reactPdfjs={context[contextType]} ref={ref} />
      )}
    </PdfjsContext.Consumer>
  ));

export { Provider, withPdfJsContext };
