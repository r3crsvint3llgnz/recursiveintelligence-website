"use client";

import { getMDXComponent } from "mdx-bundler/client/index.js";
import { useMemo } from "react";

interface MDXContentProps {
  code: string;
}

export default function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  return <Component />;
}
