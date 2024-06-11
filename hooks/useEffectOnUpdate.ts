import React from 'react';

/**
 * Note: use this hook if you need only observing dependencies without componentDidMount lifecycle
 *
 * useEffectOnUpdate(() => { ... }, [a, b, c]);
 */
// eslint-disable-next-line
export const useEffectOnUpdate = (callback: (args: any) => void, dependencies: React.DependencyList) => {
  const didMount = React.useRef(false);

  React.useEffect(() => {
    if (didMount.current) {
      callback(dependencies);
    } else {
      didMount.current = true;
    }
  }, dependencies);
};
