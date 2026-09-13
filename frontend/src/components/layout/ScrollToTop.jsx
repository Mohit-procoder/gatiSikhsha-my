import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever the route / pathname changes,
 * the window scroll position is immediately reset to the top (0, 0),
 * preventing the previous page's scroll position from carrying over
 * and causing top navigation bar overlap with content.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If an anchor hash exists (e.g., #journey), smooth scroll to the target element
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Reset window and document scroll immediately to top
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
