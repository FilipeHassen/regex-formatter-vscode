import { FormatterRuleBlock, LineBreakRule, CustomRegexRule } from './config';

interface CodeSegment {
  type: 'code' | 'string' | 'comment';
  text: string;
}

/**
 * Splits text into segments of code, strings, and comments to prevent
 * formatting rules from corrupting literal strings or comments.
 */
export function segmentCode(
  text: string,
  lineComment: string = '//',
  blockCommentStart: string = '/*',
  blockCommentEnd: string = '*/',
  stringDelimiters: string[] = ['"', "'"]
): CodeSegment[] {
  const segments: CodeSegment[] = [];
  let currentText = '';
  let currentType: 'code' | 'string' | 'comment' = 'code';
  let stringDelimUsed = '';
  
  let i = 0;
  const len = text.length;
  
  while (i < len) {
    if (currentType === 'code') {
      // Check block comment start
      if (blockCommentStart && text.startsWith(blockCommentStart, i)) {
        if (currentText) {
          segments.push({ type: 'code', text: currentText });
          currentText = '';
        }
        currentType = 'comment';
        currentText = blockCommentStart;
        i += blockCommentStart.length;
        continue;
      }
      
      // Check line comment start
      if (lineComment && text.startsWith(lineComment, i)) {
        if (currentText) {
          segments.push({ type: 'code', text: currentText });
          currentText = '';
        }
        currentType = 'comment';
        currentText = lineComment;
        i += lineComment.length;
        continue;
      }
      
      // Check string start
      let foundDelim = false;
      for (const delim of stringDelimiters) {
        if (text.startsWith(delim, i)) {
          if (currentText) {
            segments.push({ type: 'code', text: currentText });
            currentText = '';
          }
          currentType = 'string';
          stringDelimUsed = delim;
          currentText = delim;
          i += delim.length;
          foundDelim = true;
          break;
        }
      }
      if (foundDelim) {
        continue;
      }
      
      currentText += text[i];
      i++;
    } else if (currentType === 'string') {
      // Handle escape character
      if (text[i] === '\\' && i + 1 < len) {
        currentText += '\\' + text[i + 1];
        i += 2;
        continue;
      }
      
      // Check for closing delimiter
      if (text.startsWith(stringDelimUsed, i)) {
        currentText += stringDelimUsed;
        segments.push({ type: 'string', text: currentText });
        currentText = '';
        currentType = 'code';
        i += stringDelimUsed.length;
        stringDelimUsed = '';
        continue;
      }
      
      currentText += text[i];
      i++;
    } else if (currentType === 'comment') {
      // Check if it's block comment ending
      if (blockCommentStart && blockCommentEnd && currentText.startsWith(blockCommentStart)) {
        if (text.startsWith(blockCommentEnd, i)) {
          currentText += blockCommentEnd;
          segments.push({ type: 'comment', text: currentText });
          currentText = '';
          currentType = 'code';
          i += blockCommentEnd.length;
          continue;
        }
      }
      // Check if it's line comment ending (newline)
      else if (lineComment && currentText.startsWith(lineComment)) {
        if (text[i] === '\n') {
          segments.push({ type: 'comment', text: currentText });
          currentText = '';
          currentType = 'code';
          // Let the loop process the newline in code mode
          continue;
        } else if (text[i] === '\r' && text[i + 1] === '\n') {
          segments.push({ type: 'comment', text: currentText });
          currentText = '';
          currentType = 'code';
          continue;
        }
      }
      
      currentText += text[i];
      i++;
    }
  }
  
  if (currentText) {
    segments.push({ type: currentType, text: currentText });
  }
  
  return segments;
}

/**
 * Splits segment list by newlines into an array of lines,
 * where each line is its own list of segments.
 */
export function splitSegmentsIntoLines(segments: CodeSegment[]): CodeSegment[][] {
  const lines: CodeSegment[][] = [];
  let currentLine: CodeSegment[] = [];
  
  for (const segment of segments) {
    const parts = segment.text.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        lines.push(currentLine);
        currentLine = [];
      }
      // Keep segment part if it has length or if it's the first/last empty parts
      if (parts[i].length > 0 || parts.length === 1) {
        currentLine.push({
          type: segment.type,
          text: parts[i]
        });
      }
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Standardizes spacing inside parentheses, brackets, braces, and control keywords.
 */
function applySpacingRules(text: string, spacesConf: FormatterRuleBlock['spaces']): string {
  let result = text;
  if (!spacesConf) {
    return result;
  }

  // 1. spaces.beforeParentheses
  if (spacesConf.beforeParentheses !== undefined) {
    const keywords = ['if', 'for', 'while', 'catch', 'switch', 'synchronized'];
    for (const kw of keywords) {
      if (spacesConf.beforeParentheses) {
        const regex = new RegExp(`\\b(${kw})\\s*\\(`, 'g');
        result = result.replace(regex, '$1 (');
      } else {
        const regex = new RegExp(`\\b(${kw})\\s*\\(`, 'g');
        result = result.replace(regex, '$1(');
      }
    }
  }

  // 2. spaces.insideParentheses
  if (spacesConf.insideParentheses !== undefined) {
    if (spacesConf.insideParentheses) {
      // (expr) -> ( expr )
      result = result.replace(/\(\s*(?!\))/g, '( ');
      result = result.replace(/(?<!\()\s*\)/g, ' )');
    } else {
      // ( expr ) -> (expr)
      result = result.replace(/\(\s+(?!\))/g, '(');
      result = result.replace(/(?<!\()\s+\)/g, ')');
    }
  }

  // 3. spaces.insideBrackets
  if (spacesConf.insideBrackets !== undefined) {
    if (spacesConf.insideBrackets) {
      result = result.replace(/\[\s*(?!\])/g, '[ ');
      result = result.replace(/(?<!\[)\s*\]/g, ' ]');
    } else {
      result = result.replace(/\[\s+(?!\])/g, '[');
      result = result.replace(/(?<!\[)\s+\]/g, ']');
    }
  }

  // 4. spaces.insideBraces (only for single line braces, e.g. { val })
  if (spacesConf.insideBraces !== undefined) {
    if (spacesConf.insideBraces) {
      result = result.replace(/\{\s*(?!\})/g, '{ ');
      result = result.replace(/(?<!\{)\s*\}/g, ' }');
    } else {
      result = result.replace(/\{\s+(?!\})/g, '{');
      result = result.replace(/(?<!\{)\s+\}/g, '}');
    }
  }

  return result;
}

/**
 * Inserts line breaks before or after configured characters.
 */
function applyLineBreakRules(text: string, rules: LineBreakRule[]): string {
  let result = text;
  for (const rule of rules) {
    if (!rule.char) {
      continue;
    }
    // Escape regex characters
    const escapedChar = rule.char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regex: RegExp;
    
    if (rule.char === '.') {
      // To avoid breaking float numbers like 3.14, only match dots followed by a word character
      regex = new RegExp(`\\.(?=[a-zA-Z_])`, 'g');
    } else {
      regex = new RegExp(escapedChar, 'g');
    }

    if (rule.position === 'before') {
      result = result.replace(regex, (match) => `\n${match}`);
    } else {
      result = result.replace(regex, (match) => `${match}\n`);
    }
  }
  return result;
}

/**
 * Adjusts curly braces { placement (same line or new line).
 */
function applyBracesStyle(text: string, style: 'sameLine' | 'newLine'): string {
  if (style === 'sameLine') {
    // Replace newline followed by open brace with space + brace
    return text.replace(/[ \t]*\r?\n[ \t]*\{/g, ' {');
  } else if (style === 'newLine') {
    // Replace non-whitespace followed by open brace with newline + brace
    // Ensure we capture the preceding character to put back
    return text.replace(/([^\s])[ \t]*\{/g, '$1\n{');
  }
  return text;
}

/**
 * Applies custom regex rules sequentially.
 */
function applyCustomRules(text: string, rules: CustomRegexRule[]): string {
  let result = text;
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, 'g');
      result = result.replace(regex, rule.replace);
    } catch (err) {
      console.error(`Error applying custom regex pattern "${rule.pattern}":`, err);
    }
  }
  return result;
}

/**
 * Core formatter class. Can format any text code given a config block.
 */
export class RegexFormatter {
  constructor(private config: FormatterRuleBlock) {}

  public format(code: string): string {
    // Normalize to Unix line endings
    let normalized = code.replace(/\r\n/g, '\n');

    // Extract comment and string rules for segmentation
    const lineComment = this.config.commentAndStringRules?.lineComment || '//';
    const blockStart = this.config.commentAndStringRules?.blockCommentStart || '/*';
    const blockEnd = this.config.commentAndStringRules?.blockCommentEnd || '*/';
    const stringDelims = this.config.commentAndStringRules?.stringDelimiters || ['"', "'"];

    // 1. Initial segmentation
    let segments = segmentCode(normalized, lineComment, blockStart, blockEnd, stringDelims);

    // 2. Process code segments (spacing, line breaks, custom regex)
    if (!this.config.indentOnly) {
      for (const seg of segments) {
        if (seg.type === 'code') {
          let t = seg.text;
          // Apply line breaks on characters
          if (this.config.lineBreakOnCharacters && this.config.lineBreakOnCharacters.length > 0) {
            t = applyLineBreakRules(t, this.config.lineBreakOnCharacters);
          }
          // Apply spacing rules
          if (this.config.spaces) {
            t = applySpacingRules(t, this.config.spaces);
          }
          // Apply braces style
          if (this.config.bracesStyle) {
            t = applyBracesStyle(t, this.config.bracesStyle);
          }
          // Apply custom regex rules
          if (this.config.customRules && this.config.customRules.length > 0) {
            t = applyCustomRules(t, this.config.customRules);
          }
          seg.text = t;
        }
      }
      
      // Re-segment to clean up any changes made to delimiters/comments
      const combined = segments.map(s => s.text).join('');
      segments = segmentCode(combined, lineComment, blockStart, blockEnd, stringDelims);
    }

    // 3. Line-by-line Indentation
    const lines = splitSegmentsIntoLines(segments);
    let currentIndentLevel = 0;
    let inContinuation = false;

    for (let i = 0; i < lines.length; i++) {
      const lineSegments = lines[i];

      // Reconstruct raw line text to check if it's whitespace-only
      const rawLineText = lineSegments.map(s => s.text).join('');
      if (rawLineText.trim() === '') {
        lines[i] = [{ type: 'code', text: '' }];
        continue;
      }

      // Count code segments characters
      let codeInLine = '';
      for (const seg of lineSegments) {
        if (seg.type === 'code') {
          codeInLine += seg.text;
        }
      }

      // Count leading closing braces '}' in the code of this line
      let leadingCloseBraces = 0;
      const trimmedCode = codeInLine.trimStart();
      let k = 0;
      while (k < trimmedCode.length && trimmedCode[k] === '}') {
        leadingCloseBraces++;
        k++;
        while (k < trimmedCode.length && (trimmedCode[k] === ' ' || trimmedCode[k] === '\t')) {
          k++;
        }
      }

      // Count braces in this line
      let openBraces = 0;
      let closeBraces = 0;
      for (const char of codeInLine) {
        if (char === '{') {
          openBraces++;
        } else if (char === '}') {
          closeBraces++;
        }
      }

      // Determine indentation level
      const baseIndent = Math.max(0, currentIndentLevel - leadingCloseBraces);
      let extraIndent = 0;

      // Continuation indentation check
      // E.g., if line starts with '.' (for chaining) or if previous line was incomplete
      const startsWithDot = trimmedCode.startsWith('.');
      if (inContinuation || startsWithDot) {
        extraIndent = this.config.continuationIndentSize;
      }

      // Update indent level for the next lines
      currentIndentLevel += (openBraces - closeBraces);

      // Determine continuation status for the next line
      const endsWithContinuationOp = 
        rawLineText.trim().endsWith(',') ||
        rawLineText.trim().endsWith('+') ||
        rawLineText.trim().endsWith('-') ||
        rawLineText.trim().endsWith('*') ||
        rawLineText.trim().endsWith('/') ||
        rawLineText.trim().endsWith('&&') ||
        rawLineText.trim().endsWith('||') ||
        (rawLineText.trim().endsWith('.') && !rawLineText.trim().endsWith('..'));

      const isLineComplete = 
        rawLineText.trim().endsWith(';') ||
        rawLineText.trim().endsWith('{') ||
        rawLineText.trim().endsWith('}') ||
        rawLineText.trim().startsWith(lineComment) ||
        rawLineText.trim().startsWith(blockStart) ||
        rawLineText.trim().endsWith(blockEnd);

      inContinuation = !isLineComplete || endsWithContinuationOp;

      // Apply indentation prefix to the first segment of the line
      const totalSpaces = baseIndent * this.config.indentSize + extraIndent;
      const indentStr = ' '.repeat(totalSpaces);

      // Strip existing leading whitespace from the line
      let removedLeadingWhitespace = false;
      for (let sIdx = 0; sIdx < lineSegments.length; sIdx++) {
        if (lineSegments[sIdx].text.trim() !== '') {
          lineSegments[sIdx].text = lineSegments[sIdx].text.trimStart();
          removedLeadingWhitespace = true;
          break;
        } else {
          lineSegments[sIdx].text = '';
        }
      }

      lineSegments[0].text = indentStr + lineSegments[0].text;
    }

    // 4. Reconstruct final code
    return lines.map(line => line.map(s => s.text).join('')).join('\n');
  }
}
