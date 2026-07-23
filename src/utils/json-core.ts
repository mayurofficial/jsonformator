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
}

export function repairJsonString(input: string): string {
  let cleaned = input.trim();
  // Replace single quotes with double quotes for keys/strings if unquoted
  cleaned = cleaned.replace(/'/g, '"');
  // Remove trailing commas in objects and arrays
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
  // Wrap unquoted keys in quotes
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
  return cleaned;
}

export function getJsonStats(input: string): JsonStats {
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
    
    return {
      sizeBytes: bytes,
      lines,
      keysCount: 0,
      depth: 0,
      isValid: false,
      error: err.message,
      errorLine
    };
  }
}

export { jsonToCsv, jsonToTypescript, jsonToGo, jsonToYaml, computeJsonDiff };
