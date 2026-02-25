import { PreviewCard } from "@base-ui/react/preview-card";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import React from "react";
import type {
  ExternalLinkProps,
  LinkMetadata,
  PopupContentProps,
} from "../-types/home-types";

export const linkPreviewHandle = PreviewCard.createHandle<string>();

const LINK_METADATA: Record<string, LinkMetadata> = {
  "https://evidencecare.com": {
    title: "EvidenceCare",
    description:
      "A healthcare technology company that optimizes clinical workflows and empowers better care decisions through their EHR-integrated platform.",
    image: (
      <img
        src="/preview-images/evidencecare-logo.webp"
        alt="EvidenceCare Logo"
        className="w-full h-full p-4 object-cover drop-shadow-[2px_2px_0_white,-2px_-2px_0_white,2px_-2px_0_white,-2px_2px_0_white]"
      />
    ),
  },
  "https://github.com/itsfaqih/fama": {
    title: "Fama",
    description:
      "A minimal, clean personal branding portfolio template built with React, TailwindCSS, and Framer Motion.",
    image: (
      <img
        src="/preview-images/fama.webp"
        alt="Fama Design Preview"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://schemata.ruine.app": {
    title: "Schemata",
    description:
      "Developer-friendly Entity Relationship Diagram (ERD) builder with a beautiful interface.",
    image: (
      <img
        src="/preview-images/schemata.webp"
        alt="Schemata App Preview"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://jatismobile.com/": {
    title: "Jatis Mobile",
    description:
      "Indonesia's leading digital communication and distribution company, specializing in WhatsApp Business API, AI chatbots, and omnichannel messaging.",
    image: (
      <img
        src="/preview-images/jatis-mobile-logo.webp"
        alt="Jatis Mobile Logo"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://github.com/phpid-jakarta/phpid-learning": {
    title: "PHPID Learning",
    description:
      "Open source repository for the Indonesian PHP community's online learning sessions, including schedules and resources.",
    image: (
      <img
        src="/preview-images/phpid-online-learning-logo.webp"
        alt="PHPID Learning Logo"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1":
    {
      title: "PHPID Learning Redesign",
      description:
        "Redesign of the Indonesian PHP community's online learning sessions.",
      image: (
        <img
          src="/preview-images/phpid-learning-redesign.webp"
          alt="PHPID Learning Redesign Preview"
          className="w-full h-full object-cover"
        />
      ),
    },
};

export function PopupContent({ href }: PopupContentProps): React.JSX.Element {
  const metadata = LINK_METADATA[href];

  if (metadata) {
    return (
      <div className="flex flex-col">
        {metadata.image}
        <div className="p-4 bg-linear-to-b from-transparent to-background">
          <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">
            {metadata.title}
          </h3>
          <p className="text-sm text-foreground">{metadata.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background">
      <p className="text-sm text-foreground break-all">{href}</p>
    </div>
  );
}

export function ExternalLink({
  href,
  children,
}: ExternalLinkProps): React.JSX.Element {
  return (
    <PreviewCard.Trigger
      handle={linkPreviewHandle}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group underline underline-offset-4 inline-flex items-center decoration-gray-400 hover:decoration-gray-800 transition-colors cursor-pointer"
      payload={href}
    >
      {children}
      <ArrowUpRightIcon className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-60 ml-0.5" />
    </PreviewCard.Trigger>
  );
}
