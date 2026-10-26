export interface DetectedLanguageInfo {
  language: 'Python' | 'C' | 'C++' | 'Java' | 'JavaScript';
  monacoLang: 'python' | 'c' | 'cpp' | 'java' | 'javascript';
  fileExt: string;
  confidence: number;
}

export function detectCodeLanguage(code: string): DetectedLanguageInfo {
  if (!code || !code.trim()) {
    return {
      language: 'Python',
      monacoLang: 'python',
      fileExt: 'py',
      confidence: 1.0,
    };
  }

  const clean = code.trim();

  let pyScore = 0;
  let cppScore = 0;
  let cScore = 0;
  let javaScore = 0;
  let jsScore = 0;

  // Python checks
  if (/\bdef\s+\w+\s*\(/.test(clean)) pyScore += 4;
  if (/\belif\b/.test(clean)) pyScore += 4;
  if (/\bimport\s+\w+/.test(clean) && !/#include/.test(clean)) pyScore += 2;
  if (/:\s*$/.test(clean) || /:\s*\n/.test(clean)) pyScore += 3;
  if (/\bself\b|\blen\s*\(|\brange\s*\(/.test(clean)) pyScore += 3;
  if (!/[{};]/.test(clean)) pyScore += 4;

  // C & C++ checks
  if (/#include\s*<iostream>/.test(clean)) cppScore += 8;
  if (/#include\s*<vector>/.test(clean)) cppScore += 8;
  if (/\busing\s+namespace\s+std;/.test(clean)) cppScore += 8;
  if (/\bstd::|\bcout\s*<<|\bcin\s*>>|\bvector\s*</.test(clean)) cppScore += 6;

  if (/#include\s*<stdio\.h>/.test(clean)) cScore += 8;
  if (/\bprintf\s*\(|\bscanf\s*\(|\bmalloc\s*\(/.test(clean)) cScore += 6;
  if (/#include/.test(clean) && cppScore === 0) cScore += 4;

  // Java checks
  if (/\bpublic\s+class\b/.test(clean)) javaScore += 8;
  if (/\bpublic\s+static\s+void\s+main\b/.test(clean)) javaScore += 9;
  if (/\bSystem\.out\.(println|print)\b/.test(clean)) javaScore += 8;
  if (/\bArrayList\s*<|\bHashMap\s*<|\bString\[\]/.test(clean)) javaScore += 6;

  // JavaScript checks
  if (/\bconsole\.log\s*\(/.test(clean)) jsScore += 8;
  if (/\b(const|let|var)\s+\w+\s*=/.test(clean)) jsScore += 6;
  if (/=>\s*\{?/.test(clean)) jsScore += 6;
  if (/===|!==/.test(clean)) jsScore += 6;
  if (/\bfunction\s+\w+\s*\(/.test(clean) && !/[#]/.test(clean)) jsScore += 4;

  const scores = [
    { lang: 'Python' as const, monaco: 'python' as const, ext: 'py', score: pyScore },
    { lang: 'C++' as const, monaco: 'cpp' as const, ext: 'cpp', score: cppScore },
    { lang: 'C' as const, monaco: 'c' as const, ext: 'c', score: cScore },
    { lang: 'Java' as const, monaco: 'java' as const, ext: 'java', score: javaScore },
    { lang: 'JavaScript' as const, monaco: 'javascript' as const, ext: 'js', score: jsScore },
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  let confidence = 0.70;
  if (best.score >= 8) confidence = 0.98;
  else if (best.score >= 4) confidence = 0.90;
  else if (best.score > 0) confidence = 0.80;
  else {
    // If no clear match and has braces, default to C
    if (/[{}]/.test(clean)) {
      return { language: 'C', monacoLang: 'c', fileExt: 'c', confidence: 0.65 };
    }
  }

  return {
    language: best.lang,
    monacoLang: best.monaco,
    fileExt: best.ext,
    confidence,
  };
}
