import { useCallback, useEffect, useState } from 'react';
import { To, useLocation, useNavigate } from 'react-router-dom';

import { useBlocker } from './useBlocker';

export function useNavigatingBlocker(isShowPromptModal: boolean, allowedPath?: string[]) {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [isShowWarning, setIsShowWarning] = useState(false);
  const [pathToNavigateTo, setPathToNavigateTo] = useState<string | null>(null);
  const [isNavigationConfirmed, setIsNavigationConfirmed] = useState(false);

  const handleNavigationBlocking = useCallback(
    (navigateTo: To) => {
      const pathname = typeof navigateTo === 'string' ? navigateTo : (navigateTo.pathname as string);

      if (allowedPath?.includes(pathname)) {
        setIsNavigationConfirmed(true);
        setPathToNavigateTo(pathname);

        return true;
      }

      if (!isNavigationConfirmed && pathname !== currentLocation.pathname) {
        setIsShowWarning(true);
        setPathToNavigateTo(pathname);

        return false;
      }

      return true;
    },
    [isNavigationConfirmed, allowedPath],
  );

  const handleCancelNavigation = useCallback(() => {
    setIsNavigationConfirmed(false);
    setIsShowWarning(false);
  }, []);

  const handleConfirmNavigation = useCallback(() => {
    setIsNavigationConfirmed(true);
    setIsShowWarning(false);
  }, []);

  useEffect(() => {
    if (isNavigationConfirmed && pathToNavigateTo) {
      navigate(pathToNavigateTo);

      setIsNavigationConfirmed(false);
      setIsShowWarning(false);
    }
  }, [isNavigationConfirmed, pathToNavigateTo]);

  useBlocker(handleNavigationBlocking, isShowPromptModal);

  return {
    isShowWarning,
    onConfirmNavigation: handleConfirmNavigation,
    onCancelNavigation: handleCancelNavigation,
  };
}
