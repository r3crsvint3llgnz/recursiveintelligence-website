import React from "react";

/**
 * Minimal accent stripe for site-wide use, just below the header.
 * Uses .ri-stripe utility for background.
 * Accessible: aria-hidden, role="presentation".
 */
export default function AccentBar() {
  return (
    <div
      className="ri-stripe w-full"
      style={{ minHeight: 6, width: "100%" }}
      aria-hidden="true"
      role="presentation"
    />
  );
}
