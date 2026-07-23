import { jsonToCsv, jsonToTypescript, jsonToGo, jsonToYaml } from './json-converters';
import { computeJsonDiff } from './json-diff';

export interface JsonStats {
  sizeBytes: number;
  lines: number;
  keysCount: number;
  depth: number;
  isValid: boolean;
  error?: string;
  errorLine?: number;
  suggestions?: string[];
}

/**
 * Intelligent JSON Error Diagnostic Engine
 * Analyzes syntax failures and returns step-by-step human-readable suggestions.
 */
export function diagnoseJsonError(input: string, errorMsg: string): string[] {
  const suggestions: string[] = [];
  if (!input.trim()) return [];

  // Check 1: Trailing commas
  if (/,\s*[\]}]/.test(input)) {
    suggestions.push("Found trailing comma before closing brace or bracket. Standard JSON forbids trailing commas (e.g. {\"a\": 1,}).");
  }

  // Check 2: Single quotes
  if (/'[^']*'/.test(input)) {
    suggestions.push("Single quotes (') detected. JSON specifications require double quotes (\") for keys and string values.");
  }

  // Check 3: Unquoted object keys
  if (/(^|[{,]\s*)([a-zA-Z0-9_$]+)\s*:/.test(input)) {
    suggestions.push("Unquoted keys found (e.g. { name: \"John\" }). Object keys must be wrapped in double quotes.");
  }

  // Check 4: Non-standard literals
  if (/\b(True|False|None|nil|undefined|NaN)\b/.test(input)) {
    suggestions.push("Non-standard language literal found (True/False/None/undefined). In JSON, use lowercase 'true', 'false', and 'null'.");
  }

  // Check 5: Comments present
  if (/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*/.test(input)) {
    suggestions.push("JavaScript or C-style comments (// or /* */) found. Comments are not allowed in standard JSON.");
  }

  // Check 6: Missing root opening/closing braces
  if (!input.trim().startsWith('{') && !input.trim().startsWith('[') && /^("?[a-zA-Z0-9_$]+"|\b[a-zA-Z0-9_$]+\b)\s*:/s.test(input.trim())) {
    suggestions.push("Root payload starts directly with a key-value property without outer enclosing braces '{ ... }'.");
  }

  // Check 7: Unbalanced braces / brackets
  const openBraces = (input.match(/\{/g) || []).length;
  const closeBraces = (input.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    suggestions.push(`Unbalanced curly braces: ${openBraces} opening '{' vs ${closeBraces} closing '}'.`);
  }

  const openBrackets = (input.match(/\[/g) || []).length;
  const closeBrackets = (input.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    suggestions.push(`Unbalanced square brackets: ${openBrackets} opening '[' vs ${closeBrackets} closing ']'.`);
  }

  if (suggestions.length === 0) {
    suggestions.push(`Syntax error detail: "${errorMsg}". Click Auto Repair to attempt automatic fix.`);
  }

  return suggestions;
}

/**
 * Bulletproof Multi-Pass JSON Auto-Repair Engine
 */
export function repairJsonString(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();

  // Pass 1: Remove BOM and zero-width spaces
  cleaned = cleaned.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Pass 2: Strip comments without breaking http:// or https:// URLs
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.split('\n').map(line => {
    // Only strip // if not preceded by http: or https:
    if (line.includes('//') && !line.includes('http://') && !line.includes('https://')) {
      const idx = line.indexOf('//');
      return line.substring(0, idx);
    }
    return line;
  }).join('\n');

  // Pass 3: Fix missing root braces if payload starts directly with key-value (e.g. "glossary": { ...)
  cleaned = cleaned.trim();
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[') && /^("?[a-zA-Z0-9_$]+"|\b[a-zA-Z0-9_$]+\b)\s*:/s.test(cleaned)) {
    cleaned = `{\n${cleaned}\n}`;
  }

  // Pass 4: Fix Python/C# boolean and null literals (True -> true, False -> false, None/nil -> null)
  cleaned = cleaned.replace(/\bTrue\b/g, 'true')
                   .replace(/\bFalse\b/g, 'false')
                   .replace(/\b(None|nil|undefined)\b/g, 'null');

  // Pass 5: Replace single-quoted keys and string values with valid double quotes
  cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');

  // Pass 6: Remove trailing commas in objects and arrays
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Pass 7: Wrap unquoted object keys (supports line 1 and nested keys)
  cleaned = cleaned.replace(/(^|[{,]\s*)([a-zA-Z0-9_$]+)\s*:/gm, '$1"$2":');

  // Pass 8: Add missing commas between consecutive lines of key-value pairs or items
  cleaned = cleaned.replace(/(["0-9truefalsenull\]}])\s*[\r\n]+\s*(["a-zA-Z0-9_$]+\s*:|[\{\[]|"[^"]*")/g, '$1,\n$2');

  // Pass 9: Balance missing closing or opening curly braces
  const openBraces = (cleaned.match(/\{/g) || []).length;
  const closeBraces = (cleaned.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    cleaned += '\n' + '}'.repeat(openBraces - closeBraces);
  } else if (closeBraces > openBraces) {
    cleaned = '{'.repeat(closeBraces - openBraces) + '\n' + cleaned;
  }

  // Pass 10: Balance missing closing or opening square brackets
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    cleaned += '\n' + ']'.repeat(openBrackets - closeBrackets);
  } else if (closeBrackets > openBrackets) {
    cleaned = '['.repeat(closeBrackets - openBrackets) + '\n' + cleaned;
  }

  // Final check: Validate if parsed JSON works; if not, return cleaned fallback
  try {
    const testParse = JSON.parse(cleaned);
    return JSON.stringify(testParse, null, 2);
  } catch (e) {
    return cleaned;
  }
}

export function getJsonStats(input: string): JsonStats {
  if (!input.trim()) {
    return {
      sizeBytes: 0,
      lines: 0,
      keysCount: 0,
      depth: 0,
      isValid: true
    };
  }

  const bytes = new Blob([input]).size;
  const lines = input.split('\n').length;
  
  try {
    const parsed = JSON.parse(input);
    let keysCount = 0;
    let maxDepth = 0;

    function traverse(obj: any, currentDepth: number) {
      if (currentDepth > maxDepth) maxDepth = currentDepth;
      if (obj && typeof obj === 'object') {
        const keys = Object.keys(obj);
        keysCount += keys.length;
        for (const key of keys) {
          traverse(obj[key], currentDepth + 1);
        }
      }
    }

    traverse(parsed, 1);
    return {
      sizeBytes: bytes,
      lines,
      keysCount,
      depth: maxDepth,
      isValid: true
    };
  } catch (err: any) {
    let errorLine: number | undefined = undefined;
    const match = err.message.match(/at position (\d+)/) || err.message.match(/line (\d+)/);
    if (match) {
      const pos = parseInt(match[1], 10);
      errorLine = input.substring(0, pos).split('\n').length;
    }

    const suggestions = diagnoseJsonError(input, err.message);

    return {
      sizeBytes: bytes,
      lines,
      keysCount: 0,
      depth: 0,
      isValid: false,
      error: err.message,
      errorLine,
      suggestions
    };
  }
}

export { jsonToCsv, jsonToTypescript, jsonToGo, jsonToYaml, computeJsonDiff };
