
'use client';

import { ReactNode, useState, useEffect } from "react";

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // By rendering children on the server, we avoid a hydration mismatch.
    // The actual cart logic in useCart is still client-side safe.
    if (!isMounted) {
        return <>{children}</>;
    }

    return <>{children}</>;
}
