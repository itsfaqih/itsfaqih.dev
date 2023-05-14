import { format, parseISO } from "date-fns";
import Balancer from "react-wrap-balancer";
import { allPosts } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";
import { cn } from "@/libs/cn.lib";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type BlogPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post._raw.flattenedPath }));
}

export async function generateMetaData({
  params,
}: BlogPageProps): Promise<Metadata> {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);

  if (!post) {
    throw new Error(`No post found for slug: ${params.slug}`);
  }

  return { title: `${post.title} | Faqih Muntashir` };
}

export default function BlogPage({ params }: BlogPageProps) {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);

  if (!post) {
    notFound();
  }

  const MDXContent = useMDXComponent(post.body.code);

  return (
    <article className="max-w-3xl py-10 mx-auto lg:py-20">
      <div>
        <time dateTime={post.date} className="mb-1 text-gray-600">
          {format(parseISO(post.date), "LLLL d, yyyy")}
        </time>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-700">
          <Balancer>{post.title}</Balancer>
        </h1>
      </div>
      <div
        className={cn(
          "[&>*]:mt-4 mt-8 text-gray-700 text-lg leading-relaxed",
          "[&>h2]:mt-6 [&>h2]:text-2xl [&>h2]:font-medium [&>h2]:text-gray-700",
          "[&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-600",
          "[&_pre]:-mx-6 [&_pre]:px-6 [&_pre]:py-4 [&_pre]:rounded-xl",
          "[&>iframe]:my-8",
          "[&_img]:my-10 [&_img]:rounded-xl [&_img]:mx-auto"
        )}
      >
        <MDXContent />
      </div>
    </article>
  );
}
