"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MessageResponse({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children: paragraph }) => <p>{paragraph}</p>,
        strong: ({ children: strong }) => <strong>{strong}</strong>,
        ul: ({ children: list }) => <ul>{list}</ul>,
        ol: ({ children: list }) => <ol>{list}</ol>,
        li: ({ children: item }) => <li>{item}</li>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
