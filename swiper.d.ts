import React from "react";

import type { SwiperSlideProps, SwiperProps } from "swiper/react";

declare global {
  declare namespace JSX {
    interface IntrinsicElements {
      "swiper-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & SwiperProps & { class?: string },
        HTMLElement
      >;
      "swiper-slide": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> &
          SwiperSlideProps & { class?: string },
        HTMLElement
      >;
    }
  }
}
