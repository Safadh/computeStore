"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Marketplace has been removed in favor of custom VM configuration.
 * Keep this route as a safe redirect for existing links/bookmarks.
 */
export default function MarketplaceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/configure");
  }, [router]);

  return null;
}
