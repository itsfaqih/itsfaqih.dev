"use client";

import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { useRouter } from "next/navigation";
import { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { slideInVariants } from "@/framer-motion/slide-in";

type PageModalProps = {
  children: React.ReactNode;
  title: string;
  slug: string;
  thumbnail: string | StaticImageData;
};

export function ProjectModal({
  children,
  title,
  slug,
  thumbnail,
}: PageModalProps) {
  const router = useRouter();
  const onDismiss = React.useCallback(() => {
    router.back();
  }, [router]);

  const dialog = Ariakit.useDialogStore({
    defaultOpen: true,
    setOpen(open) {
      if (!open) onDismiss();
    },
  });

  const mounted = dialog.useState("mounted");

  if (!mounted) return null;

  return (
    <Ariakit.Dialog
      key="dialog"
      as={motion.div}
      store={dialog}
      // hidden={false}
      backdrop={motion.div as any}
      backdropProps={{
        key: "backdrop",
        className:
          "bg-transparent flex items-center justify-center !z-10 px-96",
        // @ts-ignore
        initial: { backgroundColor: "rgba(0, 0, 0, 0)" },
        animate: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
        exit: { backgroundColor: "rgba(0, 0, 0, 0)" },
      }}
      portal={false}
      className="container p-8 bg-white shadow-xl rounded-xl"
      layoutId={`${slug}-container`}
    >
      <div className="grid grid-cols-2 gap-10">
        <div>
          <motion.img
            src={typeof thumbnail === "string" ? thumbnail : thumbnail.src}
            alt=""
            layoutId={`${slug}-thumbnail`}
            layout
            className="w-full rounded-xl"
          />
        </div>
        <motion.div
          key="content"
          variants={slideInVariants({ delay: 0.1 })}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="flex flex-col h-full"
        >
          <Ariakit.DialogHeading
            as={motion.h1}
            layoutId={`${slug}-title`}
            className="text-2xl font-semibold text-gray-800"
          >
            {title}
          </Ariakit.DialogHeading>
          <div className="h-full mt-4">{children}</div>
        </motion.div>
      </div>
    </Ariakit.Dialog>
  );
}
