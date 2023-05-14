import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypePrettyCode from "rehype-pretty-code";
import fs from "fs";
import path from "path";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/posts/${post._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
  mdx: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: JSON.parse(
            fs.readFileSync(
              path.join("./assets/code-theme/halcyon.json"),
              "utf8"
            )
          ),
          keepBackground: true,
        },
      ],
    ],
  },
});
