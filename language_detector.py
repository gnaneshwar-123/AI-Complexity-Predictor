"""
Automatic Programming Language Detection Engine.
Identifies whether source code belongs to Python, C, C++, Java, or JavaScript
based on lexical token distributions, syntax structures, and keyword signatures.
"""

import re
from typing import Tuple, Dict

LANGUAGE_SIGNATURES = {
    "python": {
        "patterns": [
            r"\bdef\s+[a-zA-Z_]\w*\s*\(",
            r"\belif\b",
            r"\bself\b",
            r"\bNone\b",
            r"\bTrue\b|\bFalse\b",
            r"\bimport\s+[a-zA-Z_]",
            r"\bfrom\s+[a-zA-Z_]+\s+import",
            r"\bprint\s*\(",
            r":\s*$",
            r"__init__",
            r"\blen\s*\(",
            r"\brange\s*\(",
            r"^\s*#\s*",
        ],
        "anti_patterns": [
            r"[{};]",
            r"\bpublic\s+class\b",
            r"#include",
            r"\bconsole\.log\b",
            r"\bint\s+main\b",
        ],
    },
    "cpp": {
        "patterns": [
            r"#include\s*<[a-zA-Z0-9_]+>",
            r"#include\s*<iostream>",
            r"#include\s*<vector>",
            r"\busing\s+namespace\s+std;",
            r"\bstd::",
            r"\bcout\s*<<",
            r"\bcin\s*>>",
            r"\bvector\s*<",
            r"\btemplate\s*<",
            r"\bnullptr\b",
            r"\bclass\s+[a-zA-Z_]\w*\s*\{",
            r"\bpublic:\s*",
            r"\bprivate:\s*",
            r"\bnew\s+[a-zA-Z_]\w*\[",
            r"\bdelete\b|\bdelete\[\]",
        ],
        "anti_patterns": [
            r"\bSystem\.out\.println\b",
            r"\bconsole\.log\b",
            r"\bdef\s+",
        ],
    },
    "c": {
        "patterns": [
            r"#include\s*<stdio\.h>",
            r"#include\s*<stdlib\.h>",
            r"#include\s*<string\.h>",
            r"\bprintf\s*\(",
            r"\bscanf\s*\(",
            r"\bmalloc\s*\(",
            r"\bfree\s*\(",
            r"\bsizeof\s*\(",
            r"\bint\s+main\s*\([^)]*\)\s*\{",
            r"\bstruct\s+[a-zA-Z_]\w*\s*\{",
            r"\bvoid\s+[a-zA-Z_]\w*\s*\(",
        ],
        "anti_patterns": [
            r"\bclass\b",
            r"\bstd::",
            r"\bcout\s*<<",
            r"\bpublic\s+",
            r"\bSystem\.out\b",
            r"\bdef\s+",
            r"\bconsole\.log\b",
        ],
    },
    "java": {
        "patterns": [
            r"\bpublic\s+class\s+[a-zA-Z_]\w*",
            r"\bpublic\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]",
            r"\bSystem\.out\.println\s*\(",
            r"\bSystem\.out\.print\s*\(",
            r"\bArrayList\s*<",
            r"\bHashMap\s*<",
            r"\bHashSet\s*<",
            r"@Override",
            r"\bprivate\s+[a-zA-Z_]\w*\s+[a-zA-Z_]\w*",
            r"\bpublic\s+[a-zA-Z_]\w*\s+[a-zA-Z_]\w*\s*\(",
            r"\bboolean\b",
            r"\bnew\s+[a-zA-Z_]\w*\[\s*[a-zA-Z0-9_]+\s*\]",
        ],
        "anti_patterns": [
            r"#include",
            r"\bdef\s+",
            r"\bconsole\.log\b",
            r"\bstd::",
        ],
    },
    "javascript": {
        "patterns": [
            r"\bfunction\s+[a-zA-Z_]\w*\s*\(",
            r"\bconst\s+[a-zA-Z_]\w*\s*=",
            r"\blet\s+[a-zA-Z_]\w*\s*=",
            r"\bvar\s+[a-zA-Z_]\w*\s*=",
            r"\bconsole\.log\s*\(",
            r"=>\s*\{?",
            r"===",
            r"!==",
            r"\bMath\.(floor|ceil|max|min|round|abs)\(",
            r"\bArray\.isArray\b",
            r"\bexport\s+default\b",
            r"\bimport\s+.*\s+from\s+['\"].*['\"]",
            r"\brequire\s*\(",
            r"\.forEach\s*\(",
            r"\.map\s*\(",
        ],
        "anti_patterns": [
            r"\bpublic\s+static\s+void\b",
            r"#include",
            r"\bSystem\.out\b",
            r"\bdef\s+",
        ],
    },
}


def detect_language(code: str) -> Tuple[str, float]:
    """
    Detect the programming language of a code snippet.
    Returns (language_name, confidence_score) where language_name is one of:
    'Python', 'C', 'C++', 'Java', 'JavaScript'.
    """
    if not code or not code.strip():
        return "Python", 0.5

    code_clean = code.strip()

    scores: Dict[str, float] = {
        "python": 0.0,
        "cpp": 0.0,
        "c": 0.0,
        "java": 0.0,
        "javascript": 0.0,
    }

    # Evaluate pattern matching weights
    for lang, config in LANGUAGE_SIGNATURES.items():
        # Positive indicators
        for pat in config["patterns"]:
            matches = len(re.findall(pat, code_clean, flags=re.MULTILINE))
            if matches > 0:
                scores[lang] += min(matches, 3) * 1.5

        # Negative indicators
        for anti in config["anti_patterns"]:
            anti_matches = len(re.findall(anti, code_clean, flags=re.MULTILINE))
            if anti_matches > 0:
                scores[lang] -= anti_matches * 2.0

    # Strong syntax differentiators
    has_curly = "{" in code_clean and "}" in code_clean
    has_semicolon = ";" in code_clean
    has_includes = "#include" in code_clean

    if has_includes:
        scores["python"] -= 10.0
        scores["java"] -= 10.0
        scores["javascript"] -= 10.0
        if "cout" in code_clean or "std::" in code_clean or "vector" in code_clean or "class" in code_clean:
            scores["cpp"] += 6.0
        elif "printf" in code_clean or "stdio.h" in code_clean or "malloc" in code_clean:
            scores["c"] += 6.0

    if not has_curly and not has_semicolon:
        scores["python"] += 5.0
        scores["c"] -= 4.0
        scores["cpp"] -= 4.0
        scores["java"] -= 4.0

    if "System.out" in code_clean or "public class" in code_clean:
        scores["java"] += 8.0

    if "console.log" in code_clean or "let " in code_clean or "const " in code_clean or "===" in code_clean:
        scores["javascript"] += 8.0

    # Pick highest scoring language
    best_lang, best_score = max(scores.items(), key=lambda item: item[1])

    # If scores are all zero or close, fallback to Python if indented, or C if curly brackets
    if best_score <= 0.5:
        if has_curly:
            best_lang = "c"
        else:
            best_lang = "python"
        confidence = 0.60
    else:
        # Normalize confidence to [0.70, 0.99]
        confidence = min(0.99, max(0.70, 0.70 + (best_score / 20.0)))

    lang_display = {
        "python": "Python",
        "cpp": "C++",
        "c": "C",
        "java": "Java",
        "javascript": "JavaScript",
    }

    return lang_display.get(best_lang, "Python"), round(confidence, 2)
