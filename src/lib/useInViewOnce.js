import { useEffect, useRef, useState } from "react";

/** True once the element has been scrolled into view (drives chart draw-in). */
export function useInViewOnce(margin = "-60px") {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        if (typeof IntersectionObserver === "undefined") {
            setInView(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { rootMargin: margin },
        );
        io.observe(node);
        return () => io.disconnect();
    }, [margin]);

    return [ref, inView];
}