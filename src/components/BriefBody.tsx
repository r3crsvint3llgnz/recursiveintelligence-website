import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSanitize from 'rehype-sanitize'
import type { Options } from 'rehype-pretty-code'

const prettyCodeOptions: Options = {
  theme: 'github-dark',
  keepBackground: true,
}

export function BriefBody({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline prose-headings:font-space-grotesk prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypePrettyCode, prettyCodeOptions],
          rehypeSanitize,
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
