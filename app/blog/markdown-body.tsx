import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { sanitizeHref, sanitizeMediaSrc } from "@/lib/blog/href";

const components: Components = {
  a({ href, children }) {
    const safe = href ? sanitizeHref(href) : null;
    if (!safe) return <span>{children}</span>;
    const external = safe.startsWith("https://");
    return (
      <a
        href={safe}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    const safe = typeof src === "string" ? sanitizeMediaSrc(src) : null;
    if (!safe) return null;
    // The CMS stores a path, not width and height, so next/image cannot size it.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={safe} alt={alt ?? ""} />;
  },
  table({ children }) {
    return (
      <div className="blog-table-scroll">
        <table>{children}</table>
      </div>
    );
  },
};

export function MarkdownBody({ text }: { text: string }) {
  return (
    <div className="blog-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
