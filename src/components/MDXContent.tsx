"use client";

import Image from "next/image";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

interface MDXImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

function MDXImage({ src, alt, ...props }: MDXImageProps) {
  if (!src) return null;
  if (src.endsWith(".gif")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className="max-w-full h-auto"
        loading="lazy"
        {...props}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={800}
      height={600}
      style={{ height: "auto", width: "100%" }}
      className="max-w-full"
    />
  );
}

interface MDXContentProps {
  code: string;
}

/* eslint-disable react-hooks/static-components */
export default function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  return <Component components={{ img: MDXImage }} />;
}
/* eslint-enable react-hooks/static-components */
