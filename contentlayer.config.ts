import { defineDocumentType, makeSource } from 'contentlayer2/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title:       { type: 'string',  required: true },
    description: { type: 'string',  required: true },
    date:        { type: 'date',    required: true },
    tags:        { type: 'list', of: { type: 'string' }, default: [] },
    featured:    { type: 'boolean', default: false },
    coverImage:  { type: 'string' },
    access: {
      type: 'enum',
      options: ['public', 'members', 'paid'],
      default: 'public',
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace(/^blog\//, ''),
    },
    readingTime: {
      type: 'number',
      resolve: (post) =>
        Math.max(1, Math.ceil(post.body.raw.split(/\s+/).length / 200)),
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  disableImportAliasWarning: true,
})
