"use client";

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface KatexRendererProps {
  expression: string;
}

export function KatexRenderer({ expression }: KatexRendererProps) {
  return <Latex>{expression}</Latex>;
}
