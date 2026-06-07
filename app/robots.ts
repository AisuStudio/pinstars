import type { MetadataRoute } from "next";

// Block all crawlers — Pinstars is a private party app, not for indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
