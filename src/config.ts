export interface LineBreakRule {
  char: string;
  position: 'before' | 'after';
  requireParenthesis?: boolean;
  beforePattern?: string;
  afterPattern?: string;
}

export interface CustomRegexRule {
  pattern: string;
  replace: string;
  description?: string;
}

export interface FormatterRuleBlock {
  fileExtensions: string[];
  indentSize: number;
  continuationIndentSize: number;
  lineBreakOnCharacters?: LineBreakRule[];
  bracesStyle?: 'sameLine' | 'newLine';
  breakBraceBlocks?: boolean;
  forceReformat?: boolean;
  keepBlankLines?: boolean;
  spaces?: {
    insideParentheses?: boolean;
    insideBrackets?: boolean;
    insideBraces?: boolean;
    beforeParentheses?: boolean;
  };
  indentOnly?: boolean;
  commentAndStringRules?: {
    lineComment?: string;
    blockCommentStart?: string;
    blockCommentEnd?: string;
    stringDelimiters?: string[];
  };
  customRules?: CustomRegexRule[];
  completeLinePatterns?: string[];
}

export const DEFAULT_CONFIGS: FormatterRuleBlock[] = [
  {
    fileExtensions: ["java", "cs"],
    indentSize: 4,
    continuationIndentSize: 8,
    lineBreakOnCharacters: [
      { char: ".", position: "before" }
    ],
    bracesStyle: "sameLine",
    spaces: {
      insideParentheses: false,
      insideBrackets: false,
      insideBraces: true,
      beforeParentheses: true
    },
    commentAndStringRules: {
      lineComment: "//",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      stringDelimiters: ["\"\"\"", "\"", "'"]
    },
    completeLinePatterns: [
      "^\\s*@"
    ]
  },
  {
    fileExtensions: ["go"],
    indentSize: 4,
    continuationIndentSize: 4,
    lineBreakOnCharacters: [
      { char: ".", position: "after" }
    ],
    bracesStyle: "sameLine",
    spaces: {
      insideParentheses: false,
      insideBrackets: false,
      insideBraces: true,
      beforeParentheses: false
    },
    commentAndStringRules: {
      lineComment: "//",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      stringDelimiters: ["\"", "`"]
    },
    completeLinePatterns: []
  },
  {
    fileExtensions: ["js", "ts", "jsx", "tsx", "json"],
    indentSize: 2,
    continuationIndentSize: 4,
    lineBreakOnCharacters: [
      { char: ".", position: "before" }
    ],
    bracesStyle: "sameLine",
    spaces: {
      insideParentheses: false,
      insideBrackets: false,
      insideBraces: true,
      beforeParentheses: true
    },
    commentAndStringRules: {
      lineComment: "//",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      stringDelimiters: ["\"", "'", "`"]
    },
    completeLinePatterns: [
      "^\\s*@"
    ]
  }
];

/**
 * Merges a user rule block with defaults if certain fields are missing.
 */
export function mergeWithDefaults(userBlock: Partial<FormatterRuleBlock>): FormatterRuleBlock {
  const matchingDefault = DEFAULT_CONFIGS.find(d =>
    d.fileExtensions.some(ext => userBlock.fileExtensions?.includes(ext))
  ) || DEFAULT_CONFIGS[0]; // fallback to first default

  return {
    fileExtensions: userBlock.fileExtensions || matchingDefault.fileExtensions,
    indentSize: userBlock.indentSize !== undefined ? userBlock.indentSize : matchingDefault.indentSize,
    continuationIndentSize: userBlock.continuationIndentSize !== undefined ? userBlock.continuationIndentSize : matchingDefault.continuationIndentSize,
    lineBreakOnCharacters: userBlock.lineBreakOnCharacters !== undefined ? userBlock.lineBreakOnCharacters : matchingDefault.lineBreakOnCharacters,
    bracesStyle: userBlock.bracesStyle !== undefined ? userBlock.bracesStyle : matchingDefault.bracesStyle,
    breakBraceBlocks: userBlock.breakBraceBlocks !== undefined ? userBlock.breakBraceBlocks : true,
    spaces: {
      ...matchingDefault.spaces,
      ...userBlock.spaces
    },
    indentOnly: userBlock.indentOnly !== undefined ? userBlock.indentOnly : matchingDefault.indentOnly,
    forceReformat: userBlock.forceReformat !== undefined ? userBlock.forceReformat : matchingDefault.forceReformat,
    keepBlankLines: userBlock.keepBlankLines !== undefined ? userBlock.keepBlankLines : true,
    commentAndStringRules: {
      ...matchingDefault.commentAndStringRules,
      ...userBlock.commentAndStringRules
    },
    customRules: userBlock.customRules !== undefined ? userBlock.customRules : matchingDefault.customRules,
    completeLinePatterns: userBlock.completeLinePatterns !== undefined ? userBlock.completeLinePatterns : matchingDefault.completeLinePatterns
  };
}
