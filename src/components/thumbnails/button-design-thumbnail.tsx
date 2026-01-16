/**
 * Button Design Thumbnail
 * A simple demo showing a primary button with a fake cursor.
 * On hover, the cursor moves to the button and the button shows its hovered state.
 */

import { CursorIcon } from "@phosphor-icons/react";

export function ButtonDesignThumbnail() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        <g id="circle-diagonal-line" stroke="rgba(0,0,0,0.2)" strokeDasharray="3">
          <line x1="71" x2="0" y1="0%" y2="100%" />
          <line x1="82" x2="12" y1="0%" y2="100%" />

          <line x1="88" x2="160" y1="0%" y2="100%" />
          <line x1="77" x2="149" y1="0%" y2="100%" />
        </g>

        <use x="0" y="-100%" href="#circle-diagonal-line" transform="scale(1,-1)" />

        <g transform="translate(45)">
          <g id="circle-line" stroke="rgba(0,0,0,0.2)" strokeDasharray="3">
            <line x1="0" x2="0" y1="0%" y2="100%" />
            <line x1="8" x2="8" y1="0%" y2="100%" />
          </g>

          <use x="62" y="0" href="#circle-line" />

          <g transform="translate(0,35)">
            <g transform="translate(-45)" stroke="rgba(0,0,0,0.2)" strokeDasharray="3">
              <line x1="0" x2="100%" y1="0" y2="0" />
              <line x1="0" x2="100%" y1="30" y2="30" />

              <line x1="0" x2="100%" y1="8" y2="8" />
              <line x1="0" x2="100%" y1="22" y2="22" />
            </g>

            <g fill="transparent" stroke="rgba(0,0,0,0.2)" strokeDasharray="4">
              <circle cx="4" cy="4" r="4" />
              <circle cx="4" cy="26" r="4" />
              <circle cx="66" cy="4" r="4" />
              <circle cx="66" cy="26" r="4" />
            </g>

            <rect width="70" height="30" rx="4" fill="transparent" stroke="black" />
            <text
              x="11"
              y="20.5"
              fill="transparent"
              stroke="black"
              strokeWidth="0.4"
              fontFamily="Geist"
              fontWeight="semibold"
            >
              Button
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
