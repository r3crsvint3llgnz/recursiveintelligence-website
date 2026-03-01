import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

export function BriefBody({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline prose-headings:font-space-grotesk">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
