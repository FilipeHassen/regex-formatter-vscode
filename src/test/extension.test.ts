import * as assert from 'assert';
import { RegexFormatter } from '../formatter';
import { FormatterRuleBlock, mergeWithDefaults } from '../config';

suite('Formatter Test Suite - Independent Variables', () => {

  // 1. indentSize - 2
  test('indentSize - value 2', () => {
    const code = 'class Test {\nvoid run() {\n}\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 2,
      continuationIndentSize: 4
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'class Test {\n  void run() {\n  }\n}\n');
  });

  // 2. indentSize - 4
  test('indentSize - value 4', () => {
    const code = 'class Test {\nvoid run() {\n}\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'class Test {\n    void run() {\n    }\n}\n');
  });

  // 3. continuationIndentSize - 4
  test('continuationIndentSize - value 4', () => {
    const code = 'list.stream()\n.filter(x -> x > 0);';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 4,
      lineBreakOnCharacters: [{ char: '.', position: 'before' }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'list.stream()\n    .filter(x -> x > 0);\n'
    );
  });

  // 4. continuationIndentSize - 8
  test('continuationIndentSize - value 8', () => {
    const code = 'list.stream()\n.filter(x -> x > 0);';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      lineBreakOnCharacters: [{ char: '.', position: 'before' }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'list.stream()\n        .filter(x -> x > 0);\n'
    );
  });

  // 5. bracesStyle - sameLine
  test('bracesStyle - value sameLine', () => {
    const code = 'if (x)\n{\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      bracesStyle: 'sameLine',
      breakBraceBlocks: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'if (x) {\n}\n');
  });

  // 6. bracesStyle - newLine
  test('bracesStyle - value newLine', () => {
    const code = 'if (x) {\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      bracesStyle: 'newLine',
      breakBraceBlocks: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'if (x)\n{\n}\n');
  });

  // 7. breakBraceBlocks - true
  test('breakBraceBlocks - value true', () => {
    const code = 'class Test { public int a; }';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      bracesStyle: 'sameLine',
      breakBraceBlocks: true
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'class Test {\n    public int a;\n}\n'
    );
  });

  // 8. breakBraceBlocks - false
  test('breakBraceBlocks - value false', () => {
    const code = 'class Test { public int a; }';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      bracesStyle: 'sameLine',
      breakBraceBlocks: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'class Test { public int a; }\n');
  });

  // 9. spaces.insideParentheses - true
  test('spaces.insideParentheses - value true', () => {
    const code = 'doCall(x);';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { insideParentheses: true }
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'doCall( x );\n');
  });

  // 10. spaces.insideParentheses - false
  test('spaces.insideParentheses - value false', () => {
    const code = 'doCall( x );';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { insideParentheses: false }
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'doCall(x);\n');
  });

  // 11. spaces.insideBrackets - true
  test('spaces.insideBrackets - value true', () => {
    const code = 'int[] arr = [1];';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { insideBrackets: true }
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'int[] arr = [ 1 ];\n');
  });

  // 12. spaces.insideBrackets - false
  test('spaces.insideBrackets - value false', () => {
    const code = 'int[] arr = [ 1 ];';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { insideBrackets: false }
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'int[] arr = [1];\n');
  });

  // 13. spaces.insideBraces - true
  test('spaces.insideBraces - value true', () => {
    const code = 'int[] arr = {1};';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { insideBraces: true },
      breakBraceBlocks: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'int[] arr = { 1 };\n');
  });

  // 14. spaces.insideBraces - false
  test('spaces.insideBraces - value false', () => {
    const code = 'int[] arr = { 1 };';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { insideBraces: false },
      breakBraceBlocks: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'int[] arr = {1};\n');
  });

  // 15. spaces.beforeParentheses - true
  test('spaces.beforeParentheses - value true', () => {
    const code = 'if(x) { }';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { beforeParentheses: true },
      breakBraceBlocks: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'if (x) { }\n');
  });

  // 16. spaces.beforeParentheses - false
  test('spaces.beforeParentheses - value false', () => {
    const code = 'if (x) { }';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      spaces: { beforeParentheses: false },
      breakBraceBlocks: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'if(x) { }\n');
  });

  // 17. lineBreakOnCharacters - position before
  test('lineBreakOnCharacters - position before', () => {
    const code = 'list.stream().filter();';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      lineBreakOnCharacters: [{ char: '.', position: 'before', requireParenthesis: false }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'list\n        .stream()\n        .filter();\n'
    );
  });

  // 18. lineBreakOnCharacters - position after
  test('lineBreakOnCharacters - position after', () => {
    const code = 'list.stream().filter();';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      lineBreakOnCharacters: [{ char: '.', position: 'after', requireParenthesis: false }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'list.\n        stream().\n        filter();\n'
    );
  });

  // 19. lineBreakOnCharacters - requireParenthesis true
  test('lineBreakOnCharacters - requireParenthesis true', () => {
    const code = 'DB.find().flgAtivo.eq(1).findOne();';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      lineBreakOnCharacters: [{ char: '.', position: 'before', requireParenthesis: true }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'DB.find()\n        .flgAtivo.eq(1)\n        .findOne();\n'
    );
  });

  // 20. lineBreakOnCharacters - requireParenthesis false
  test('lineBreakOnCharacters - requireParenthesis false', () => {
    const code = 'DB.find().flgAtivo.eq(1).findOne();';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      lineBreakOnCharacters: [{ char: '.', position: 'before', requireParenthesis: false }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'DB\n        .find()\n        .flgAtivo\n        .eq(1)\n        .findOne();\n'
    );
  });

  // 21. indentOnly - true
  test('indentOnly - value true', () => {
    const code = 'if(x){\nint a = 1;\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      indentOnly: true,
      bracesStyle: 'newLine',
      spaces: { beforeParentheses: true }
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'if(x){\n    int a = 1;\n}\n');
  });

  // 22. indentOnly - false
  test('indentOnly - value false', () => {
    const code = 'if(x){\nint a = 1;\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      indentOnly: false,
      bracesStyle: 'newLine',
      spaces: { beforeParentheses: true }
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'if (x)\n{\n    int a = 1;\n}\n');
  });

  // 23. commentAndStringRules - lineComment
  test('commentAndStringRules - lineComment', () => {
    const code = '# This is a comment\nval = 123; # inline comment';
    const config: FormatterRuleBlock = {
      fileExtensions: ['py'],
      indentSize: 4,
      continuationIndentSize: 4,
      commentAndStringRules: {
        lineComment: '#',
        blockCommentStart: '"""',
        blockCommentEnd: '"""',
        stringDelimiters: ['"']
      },
      customRules: [{ pattern: 'val', replace: 'VALUE' }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), '# This is a comment\nVALUE = 123; # inline comment\n');
  });

  // 24. commentAndStringRules - blockComment
  test('commentAndStringRules - blockComment', () => {
    const code = '/* keep\n   this comment\n   block untouched */\nval = 1;';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 4,
      commentAndStringRules: {
        lineComment: '//',
        blockCommentStart: '/*',
        blockCommentEnd: '*/',
        stringDelimiters: ['"']
      },
      customRules: [{ pattern: 'val', replace: 'VALUE' }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      '/* keep\n   this comment\n   block untouched */\nVALUE = 1;\n'
    );
  });

  // 25. commentAndStringRules - stringDelimiters
  test('commentAndStringRules - stringDelimiters', () => {
    const code = 'String query = """\n    SELECT *\n    FROM users\n    """;\nval = 1;';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 4,
      commentAndStringRules: {
        lineComment: '//',
        blockCommentStart: '/*',
        blockCommentEnd: '*/',
        stringDelimiters: ['"""', '"']
      },
      customRules: [{ pattern: 'val', replace: 'VALUE' }]
    };
    const formatter = new RegexFormatter(config);
    const formatted = formatter.format(code);
    assert.ok(formatted.includes('    SELECT *\n    FROM users\n    """'));
    assert.ok(formatted.includes('VALUE = 1;'));
  });

  // 26. customRules
  test('customRules - pattern and replace', () => {
    const code = 'void handleEvent();';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      customRules: [{ pattern: '\\bvoid\\b', replace: 'VOID' }]
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(formatter.format(code), 'VOID handleEvent();\n');
  });

  // 27. mergeWithDefaults
  test('mergeWithDefaults - partial rule merging', () => {
    const partialBlock = {
      fileExtensions: ['java'],
      indentSize: 2
    };
    const merged = mergeWithDefaults(partialBlock);
    assert.strictEqual(merged.indentSize, 2);
    assert.strictEqual(merged.continuationIndentSize, 8); // defaults from java
    assert.deepStrictEqual(merged.lineBreakOnCharacters, [{ char: '.', position: 'before' }]);
    assert.strictEqual(merged.bracesStyle, 'sameLine');
    assert.strictEqual(merged.spaces?.insideBraces, true);
  });

  // 28. forceReformat - value true
  test('forceReformat - value true', () => {
    const code = '        DB.find(\n                )\n                .flgAtivo.eq(1\n                )\n                .findOne();';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      lineBreakOnCharacters: [{ char: '.', position: 'before', requireParenthesis: true }],
      forceReformat: true,
      spaces: { insideParentheses: false }
    };
    const formatter = new RegexFormatter(config);
    // Since forceReformat is true, all the manual breaks in parentheses and .eq are collapsed,
    // and re-split correctly.
    assert.strictEqual(
      formatter.format(code),
      'DB.find()\n        .flgAtivo.eq(1)\n        .findOne();\n'
    );
  });

  // 29. forceReformat - value false
  test('forceReformat - value false', () => {
    const code = '        DB.find(\n                )\n                .flgAtivo.eq(1\n                )\n                .findOne();';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      lineBreakOnCharacters: [{ char: '.', position: 'before', requireParenthesis: true }],
      forceReformat: false,
      spaces: { insideParentheses: false }
    };
    const formatter = new RegexFormatter(config);
    // Since forceReformat is false (default), the manual breaks inside parentheses are preserved.
    assert.strictEqual(
      formatter.format(code),
      'DB.find(\n        )\n        .flgAtivo.eq(1\n        )\n        .findOne();\n'
    );
  });

  // 30. keepBlankLines - value true
  test('keepBlankLines - value true', () => {
    const code = 'class Test {\n\n    int a = 1;\n\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      keepBlankLines: true
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'class Test {\n\n    int a = 1;\n\n}\n'
    );
  });

  // 31. keepBlankLines - value false
  test('keepBlankLines - value false', () => {
    const code = 'class Test {\n\n    int a = 1;\n\n}';
    const config: FormatterRuleBlock = {
      fileExtensions: ['java'],
      indentSize: 4,
      continuationIndentSize: 8,
      keepBlankLines: false
    };
    const formatter = new RegexFormatter(config);
    assert.strictEqual(
      formatter.format(code),
      'class Test {\n    int a = 1;\n}\n'
    );
  });

});
