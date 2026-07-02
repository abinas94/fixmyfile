"use client";

import { useEffect } from "react";

interface PageHeadProps {
  title: string;
  description: string;
  keywords?: string;
}

export default function PageHead({ title, description, keywords }: PageHeadProps) {
  useEffect(() => {
    document.title = title + " | FixMyFile - Free Online Tools";
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Update meta keywords
    if (keywords) {
      let metaKeys = document.querySelector('meta[name="keywords"]');
      if (!metaKeys) {
        metaKeys = document.createElement("meta");
        metaKeys.setAttribute("name", "keywords");
        document.head.appendChild(metaKeys);
      }
      metaKeys.setAttribute("content", keywords);
    }
  }, [title, description, keywords]);

  return null;
}
