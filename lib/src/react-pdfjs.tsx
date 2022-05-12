/**
 * The main components which controls the pdf.js instance.
 */

import * as React from 'react';
import { createContext, useReducer, useContext } from 'react';

// Constants
const DEFAULT_SCALE_DELTA = 1.1;
const DEFAULT_MIN_SCALE = 0.1;
const DEFAULT_MAX_SCALE = 10.0;

/* -----------------------------------------------------------------------------
 * Context
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

const Context = createContext<ContextValue>(undefined);

type UseToolbarContextReturnValue = Pick<
  ContextValue,
  'zoomIn' | 'zoomOut' | 'scrollToPage'
>;

function useToolbarContext(): UseToolbarContextReturnValue {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      'useToolbarContext can only be used in a ReactPDFJsProvider.'
    );
  }

  return {
    zoomIn: context.zoomIn,
    zoomOut: context.zoomOut,
    scrollToPage: context.scrollToPage,
  };
}

/* -----------------------------------------------------------------------------
 * Reducer
 * ---------------------------------------------------------------------------*/

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

/* -----------------------------------------------------------------------------
 * ReactPDFJsProvider
 * ---------------------------------------------------------------------------*/

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

function ReactPDFJsProvider({
  maxScale = DEFAULT_MAX_SCALE,
  minScale = DEFAULT_MIN_SCALE,
  scaleDelta = DEFAULT_SCALE_DELTA,
  workerSrc,
  children,
}: React.PropsWithChildren<ReactPDFJsProviderProps>) {
  const [state, send] = useReducer(reducer, generateInitializeState, undefined);

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
    <Context.Provider
      value={{
        currentScaleValue: state.currentScaleValue,
        currentPage: state.currentPage,
        annotations: state.annotations,
        getAnnotationsForPage: () => {},
        workerSrc,
        scrollToPage,
        zoomIn,
        zoomOut,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { ReactPDFJsProvider as Provider, useToolbarContext };
