/**
 * Minimal store which handles the connection between the pdfjs app and the
 * embedded reactjs frames
 */

function createStore(reducer, initialState) {
  let state = initialState;

  const listeners = [];

  const subscribe = (listener: any) => listeners.push(listener) - 1;
  const unSubscribe = (index: number) => listeners.slice(index, 1);
  const getState = () => state;
  const dispatch = (action: any) => {
    state = reducer(state, action);
    listeners.forEach((l) => l());
  };

  return {
    subscribe,
    unSubscribe,
    getState,
    dispatch,
  };
}

export { createStore };
