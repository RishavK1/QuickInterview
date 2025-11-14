// Technical term corrections for speech recognition
export const speechCorrections: Record<string, string> = {
  // Programming languages
  'javascript': 'JavaScript',
  'java script': 'JavaScript',
  'type script': 'TypeScript',
  'typescript': 'TypeScript',
  'python': 'Python',
  'react': 'React',
  'react js': 'React',
  'reactjs': 'React',
  'next js': 'Next.js',
  'nextjs': 'Next.js',
  'node js': 'Node.js',
  'nodejs': 'Node.js',
  'angular': 'Angular',
  'vue': 'Vue',
  'vue js': 'Vue.js',
  
  // Web technologies
  'html': 'HTML',
  'css': 'CSS',
  'json': 'JSON',
  'xml': 'XML',
  'api': 'API',
  'rest': 'REST',
  'graphql': 'GraphQL',
  'graph ql': 'GraphQL',
  
  // Database
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgresql': 'PostgreSQL',
  'mongo db': 'MongoDB',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  
  // Cloud & DevOps
  'aws': 'AWS',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'ci cd': 'CI/CD',
  
  // Concepts
  'oop': 'OOP',
  'mvc': 'MVC',
  'mvvm': 'MVVM',
  'crud': 'CRUD',
  'jwt': 'JWT',
  'oauth': 'OAuth',
  'ui': 'UI',
  'ux': 'UX',
  'seo': 'SEO',
};

export function correctSpeechText(text: string): string {
  let correctedText = text;
  
  // Apply corrections (case-insensitive search)
  Object.entries(speechCorrections).forEach(([incorrect, correct]) => {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    correctedText = correctedText.replace(regex, correct);
  });
  
  return correctedText;
}
