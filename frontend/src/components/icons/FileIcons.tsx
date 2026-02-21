import {
  FileText,
  FileJson,
  FileCode,
  File,
  Image,
  FileSpreadsheet,
  Presentation,
  Database,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  markdown: FileText,
  md: FileText,
  json: FileJson,
  pdf: File,
  document: FileText,
  docx: FileText,
  sql: Database,
  image: Image,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  code: FileCode,
};

export function getFileIcon(type: string) {
  return iconMap[type] || File;
}

export function getFileColor(type: string) {
  const colorMap: Record<string, string> = {
    markdown: '#38bdf8',
    md: '#38bdf8',
    json: '#f59e0b',
    pdf: '#ef4444',
    document: '#9E7FFF',
    docx: '#9E7FFF',
    sql: '#10b981',
    image: '#f472b6',
    spreadsheet: '#10b981',
    presentation: '#f59e0b',
    code: '#38bdf8',
  };
  return colorMap[type] || '#A3A3A3';
}
