import React from 'react';

const MOCKED_FUN = () => {};

/**
 * Note: use this hook if you need mount/unmount lifecycle of a component without observing dependencies
 *
 * useEffectOnMount({
 *   mount: () => { ... },
 *   unmount: () => { ... },
 * });
 */

export const useEffectOnMount = ({ mount = MOCKED_FUN, unmount = MOCKED_FUN }) => {
  const didMount = React.useRef(false);

  React.useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      mount();
    }

    return unmount;
  }, []);
};
