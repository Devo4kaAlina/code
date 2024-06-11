import { useContext, useEffect } from 'react';
import { To, UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export function useBlocker(confirmExit: (to: To) => boolean, isBlocked = true) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!isBlocked) {
      return;
    }

    const push = navigator.push.bind(navigator);

    navigator.push = (...args: Parameters<typeof push>) => {
      const result = confirmExit(args[0]);

      if (result !== false) {
        push(...args);
      }
    };

    // eslint-disable-next-line consistent-return
    return () => {
      navigator.push = push;
    };
  }, [navigator, confirmExit, isBlocked]);
}
