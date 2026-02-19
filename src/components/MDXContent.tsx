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
  const urlPath = src.split("?")[0].split("#")[0];
  if (urlPath.toLowerCase().endsWith(".gif")) {
    // Plain <img> preserves GIF animation — Next.js <Image> strips frames
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
  // Unknown dimensions: width/height=0 + sizes="100vw" lets Next.js
  // serve responsive srcsets without imposing a fixed aspect ratio.
  // Note: non-GIF branch intentionally omits ...props spread to avoid
  // passing HTML img attributes that <Image> doesn't accept.
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={0}
      height={0}
      sizes="100vw"
      style={{ width: "100%", height: "auto" }}
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
