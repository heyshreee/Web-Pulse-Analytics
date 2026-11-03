import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        const reset = () => {
            window.scrollTo(0, 0);
            document.querySelector('.layout-scroll-content')?.scrollTo?.(0, 0);
        };
        reset();
        requestAnimationFrame(reset);
    }, [pathname]);

    return null;
}
