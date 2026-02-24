import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../');
const WEBSITE_DIR = path.resolve(__dirname, '../');

const PROJECTS = [
  'recursiveintelligence-website',
  'the-recursive-garden',
  'recursive-journal-generator',
  'recursive-style-system',
  'recursive-prompting',
  'Python Gif Generator'
];

const CONTENT_DIRS = [
  {
    name: 'Website Blog',
    path: path.join(WEBSITE_DIR, 'content/blog'),
    ext: '.mdx'
  },
  {
    name: 'Digital Garden',
    path: path.join(ROOT_DIR, 'the-recursive-garden/src/site/notes'),
    ext: '.md'
  }
];

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'env',
  '__pycache__',
  '.pytest_cache',
  '.aws-sam',
  '.contentlayer'
]);

function getTree(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return '';
  let tree = '';
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    if (IGNORE_DIRS.has(file.name)) continue;
    if (file.name.startsWith('.')) continue;

    const indent = '  '.repeat(depth);
    tree += `${indent}${file.isDirectory() ? '📂' : '📄'} ${file.name}\n`;
    
    if (file.isDirectory()) {
      tree += getTree(path.join(dir, file.name), depth + 1, maxDepth);
    }
  }
  return tree;
}

function readKeyFiles(projectDir) {
  const keys = ['README.md', 'GEMINI.md', 'package.json', 'template.yaml'];
  const contents = {};
  
  for (const key of keys) {
    const filePath = path.join(projectDir, key);
    if (fs.existsSync(filePath)) {
      contents[key] = fs.readFileSync(filePath, 'utf-8').slice(0, 5000); // Guard rails
    }
  }
  return contents;
}

function buildKnowledge() {
  console.log('Building Knowledge Base...');
  
  const knowledge = {
    articles: [],
    repositories: []
  };

  // Aggregating Articles
  for (const dirInfo of CONTENT_DIRS) {
    if (!fs.existsSync(dirInfo.path)) {
      console.warn(`Warning: Path not found ${dirInfo.path}`);
      continue;
    }

    const files = fs.readdirSync(dirInfo.path, { recursive: true });
    for (const file of files) {
      if (typeof file === 'string' && file.endsWith(dirInfo.ext)) {
        const fullPath = path.join(dirInfo.path, file);
        if (fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Basic cleaning: strip frontmatter (simple version)
          const cleanContent = content.replace(/^---[\s\S]*?---/, '').trim();
          knowledge.articles.push({
            source: dirInfo.name,
            title: file,
            content: cleanContent.slice(0, 10000) // Truncate very long notes
          });
        }
      }
    }
  }

  // Aggregating Repositories
  for (const projectName of PROJECTS) {
    const projectPath = path.join(ROOT_DIR, projectName);
    if (!fs.existsSync(projectPath)) {
      console.warn(`Warning: Project not found ${projectPath}`);
      continue;
    }

    console.log(`Processing project: ${projectName}`);
    knowledge.repositories.push({
      name: projectName,
      tree: getTree(projectPath),
      files: readKeyFiles(projectPath)
    });
  }

  const outputPath = path.join(WEBSITE_DIR, 'src/data/knowledge-base.json');
  fs.writeFileSync(outputPath, JSON.stringify(knowledge, null, 2));
  console.log(`Knowledge base written to ${outputPath}`);
  
  const size = fs.statSync(outputPath).size / 1024;
  console.log(`Total Size: ${size.toFixed(2)} KB`);
}

buildKnowledge();
