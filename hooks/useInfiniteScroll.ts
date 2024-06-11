import { useCallback, useState } from 'react';

export const useInfiniteScroll = (
  props?: IntersectionObserverInit,
): {
  infinityRef: (node: Element) => void;
  isIntersecting: boolean;
  observer: IntersectionObserver;
} => {
  const { root = null, rootMargin = '0px', threshold = 0 } = props || {};
  const [observer, setObserver] = useState<IntersectionObserver>({} as IntersectionObserver);
  const [isIntersecting, setIntersecting] = useState(false);

  const infinityRef = useCallback(
    (node: Element) => {
      if (node) {
        const newObserver = new IntersectionObserver(
          ([entry]) => {
            setIntersecting(entry.isIntersecting);
          },
          { root, rootMargin, threshold },
        );

        newObserver.observe(node);
        setObserver(newObserver);
      }
    },
    [root, rootMargin, threshold],
  );

  return { infinityRef, isIntersecting, observer };
};
