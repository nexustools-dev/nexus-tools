/* ── SQL Keywords ── */
const KEYWORDS = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'INNER',
  'LEFT',
  'RIGHT',
  'OUTER',
  'CROSS',
  'JOIN',
  'ON',
  'GROUP',
  'BY',
  'ORDER',
  'ASC',
  'DESC',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'CREATE',
  'TABLE',
  'ALTER',
  'DROP',
  'ADD',
  'COLUMN',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'INDEX',
  'UNIQUE',
  'AS',
  'DISTINCT',
  'ALL',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'UNION',
  'EXCEPT',
  'INTERSECT',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'IF',
  'CAST',
  'COALESCE',
  'TOP',
  'WITH',
  'RECURSIVE',
  'RETURNING',
  'CONFLICT',
  'DO',
  'TRUNCATE',
  'REPLACE',
  'EXPLAIN',
  'ANALYZE',
  'VACUUM',
  'BEGIN',
  'COMMIT',
  'ROLLBACK',
  'TRANSACTION',
  'SAVEPOINT',
  'GRANT',
  'REVOKE',
  'DEFAULT',
  'CHECK',
  'CONSTRAINT',
  'CASCADE',
  'RESTRICT',
  'TEMPORARY',
  'TEMP',
  'VIEW',
  'TRIGGER',
  'PROCEDURE',
  'FUNCTION',
  'RETURNS',
  'DECLARE',
  'BOOLEAN',
  'INTEGER',
  'VARCHAR',
  'TEXT',
  'BIGINT',
  'SMALLINT',
  'FLOAT',
  'DOUBLE',
  'DECIMAL',
  'NUMERIC',
  'DATE',
  'TIME',
  'TIMESTAMP',
  'SERIAL',
  'AUTOINCREMENT',
  'AUTO_INCREMENT',
]);

// Derived from KEYWORDS — keywords that start a new clause and get their own line
const CLAUSE_STARTER_LIST = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS',
  'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'UNION', 'EXCEPT',
  'INTERSECT', 'ON', 'AND', 'OR', 'RETURNING', 'WITH',
] as const;

const CLAUSE_STARTERS: Set<string> = new Set(CLAUSE_STARTER_LIST);

/* ── Tokenizer ── */
export type TokenType =
  | 'keyword'
  | 'identifier'
  | 'string'
  | 'number'
  | 'operator'
  | 'paren'
  | 'comma'
  | 'comment'
  | 'whitespace'
  | 'semicolon';

export interface Token {
  type: TokenType;
  value: string;
}

function readWhitespace(sql: string, start: number): { value: string; end: number } {
  let i = start;
  let ws = '';
  while (i < sql.length && /\s/.test(sql[i])) {
    ws += sql[i];
    i++;
  }
  return { value: ws, end: i };
}

function readLineComment(sql: string, start: number): { value: string; end: number } {
  let i = start + 2;
  let comment = '--';
  while (i < sql.length && sql[i] !== '\n') {
    comment += sql[i];
    i++;
  }
  return { value: comment, end: i };
}

function readBlockComment(sql: string, start: number): { value: string; end: number } {
  let i = start + 2;
  let comment = '/*';
  while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) {
    comment += sql[i];
    i++;
  }
  if (i < sql.length) {
    comment += '*/';
    i += 2;
  }
  return { value: comment, end: i };
}

function readString(sql: string, start: number): { value: string; end: number } {
  const quote = sql[start];
  let i = start + 1;
  let str = quote;
  while (i < sql.length) {
    if (sql[i] === quote && sql[i + 1] === quote) {
      str += quote + quote;
      i += 2;
      continue;
    }
    if (sql[i] === quote) {
      str += quote;
      i++;
      break;
    }
    str += sql[i];
    i++;
  }
  return { value: str, end: i };
}

function readNumber(sql: string, start: number): { value: string; end: number } {
  let i = start;
  let num = '';
  while (i < sql.length && /[0-9.]/.test(sql[i])) {
    num += sql[i];
    i++;
  }
  return { value: num, end: i };
}

function readOperator(sql: string, start: number): { value: string; end: number } {
  let op = sql[start];
  let i = start + 1;
  if (i < sql.length && /[=<>]/.test(sql[i]) && op + sql[i] !== '--') {
    op += sql[i];
    i++;
  }
  return { value: op, end: i };
}

function readBacktickIdentifier(sql: string, start: number): { value: string; end: number } {
  let i = start + 1;
  let id = '`';
  while (i < sql.length && sql[i] !== '`') {
    id += sql[i];
    i++;
  }
  if (i < sql.length) {
    id += '`';
    i++;
  }
  return { value: id, end: i };
}

function readIdentifierOrKeyword(sql: string, start: number): { token: Token; end: number } {
  let i = start;
  let id = '';
  while (i < sql.length && /[a-zA-Z0-9_]/.test(sql[i])) {
    id += sql[i];
    i++;
  }
  const upper = id.toUpperCase();
  return {
    token: { type: KEYWORDS.has(upper) ? 'keyword' : 'identifier', value: id },
    end: i,
  };
}

export function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];

    if (/\s/.test(ch)) {
      const r = readWhitespace(sql, i);
      tokens.push({ type: 'whitespace', value: r.value });
      i = r.end;
    } else if (ch === '-' && sql[i + 1] === '-') {
      const r = readLineComment(sql, i);
      tokens.push({ type: 'comment', value: r.value });
      i = r.end;
    } else if (ch === '/' && sql[i + 1] === '*') {
      const r = readBlockComment(sql, i);
      tokens.push({ type: 'comment', value: r.value });
      i = r.end;
    } else if (ch === "'" || ch === '"') {
      const r = readString(sql, i);
      tokens.push({ type: 'string', value: r.value });
      i = r.end;
    } else if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < sql.length && /[0-9]/.test(sql[i + 1]))) {
      const r = readNumber(sql, i);
      tokens.push({ type: 'number', value: r.value });
      i = r.end;
    } else if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
    } else if (ch === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
    } else if (ch === ';') {
      tokens.push({ type: 'semicolon', value: ';' });
      i++;
    } else if (/[=<>!+\-*/%&|^~]/.test(ch)) {
      const r = readOperator(sql, i);
      tokens.push({ type: 'operator', value: r.value });
      i = r.end;
    } else if (ch === '`') {
      const r = readBacktickIdentifier(sql, i);
      tokens.push({ type: 'identifier', value: r.value });
      i = r.end;
    } else if (ch === '.') {
      tokens.push({ type: 'operator', value: '.' });
      i++;
    } else if (/[a-zA-Z_]/.test(ch)) {
      const r = readIdentifierOrKeyword(sql, i);
      tokens.push(r.token);
      i = r.end;
    } else {
      tokens.push({ type: 'identifier', value: ch });
      i++;
    }
  }
  return tokens;
}

/* ── Formatter ── */
export function formatSql(sql: string, indent: string, uppercaseKw: boolean): string {
  const tokens = tokenize(sql);
  const parts: string[] = [];
  let depth = 0;
  let newLine = true;

  const addNewline = () => {
    parts.push('\n' + indent.repeat(depth));
    newLine = true;
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.type === 'whitespace') continue;

    if (tok.type === 'comment') {
      if (!newLine) addNewline();
      parts.push(tok.value);
      addNewline();
      continue;
    }

    if (tok.type === 'semicolon') {
      parts.push(';');
      if (i < tokens.length - 1) {
        parts.push('\n');
        addNewline();
      }
      continue;
    }

    if (tok.type === 'paren' && tok.value === '(') {
      parts.push(' (');
      depth++;
      addNewline();
      continue;
    }

    if (tok.type === 'paren' && tok.value === ')') {
      depth = Math.max(0, depth - 1);
      addNewline();
      parts.push(')');
      continue;
    }

    const val =
      tok.type === 'keyword'
        ? uppercaseKw
          ? tok.value.toUpperCase()
          : tok.value.toLowerCase()
        : tok.value;

    if (tok.type === 'keyword' && CLAUSE_STARTERS.has(tok.value.toUpperCase())) {
      const upper = tok.value.toUpperCase();
      if (upper === 'AND' || upper === 'OR') {
        addNewline();
        parts.push(val + ' ');
        newLine = false;
        continue;
      }
      if (parts.length > 0) addNewline();
      parts.push(val + ' ');
      newLine = false;
      continue;
    }

    if (tok.type === 'comma') {
      parts.push(',');
      addNewline();
      parts.push(indent);
      continue;
    }

    if (!newLine) parts.push(' ');
    parts.push(val);
    newLine = false;
  }

  return parts
    .join('')
    .trim()
    .replace(/\n{3,}/g, '\n\n');
}

export function minifySql(sql: string): string {
  const tokens = tokenize(sql);
  const parts: string[] = [];
  let prevNeedsSpace = false;
  for (const tok of tokens) {
    if (tok.type === 'whitespace' || tok.type === 'comment') {
      prevNeedsSpace = true;
      continue;
    }
    if (
      prevNeedsSpace &&
      parts.length > 0 &&
      tok.type !== 'comma' &&
      tok.type !== 'paren' &&
      tok.type !== 'semicolon'
    ) {
      const last = parts[parts.length - 1];
      if (last !== '(' && last !== '.') parts.push(' ');
    }
    if (tok.type === 'operator' && tok.value === '.') {
      parts.push('.');
      prevNeedsSpace = false;
      continue;
    }
    parts.push(tok.value);
    prevNeedsSpace = false;
  }
  return parts.join('');
}

/* ── Syntax Highlight ──
 * SECURITY: All token values are HTML-escaped (&, <, >) before insertion.
 * The output is used with dangerouslySetInnerHTML — escaping is critical.
 */
export function highlightSql(sql: string): { html: string; lineCount: number; keywordCount: number } {
  const tokens = tokenize(sql);
  let html = '';
  let keywordCount = 0;
  for (const tok of tokens) {
    const escaped = tok.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    switch (tok.type) {
      case 'keyword':
        html += `<span class="text-blue-400 font-semibold">${escaped}</span>`;
        keywordCount++;
        break;
      case 'string':
        html += `<span class="text-emerald-400">${escaped}</span>`;
        break;
      case 'number':
        html += `<span class="text-amber-400">${escaped}</span>`;
        break;
      case 'comment':
        html += `<span class="text-zinc-500 italic">${escaped}</span>`;
        break;
      default:
        html += `<span class="text-zinc-300">${escaped}</span>`;
    }
  }
  const lineCount = sql.split('\n').length;
  return { html, lineCount, keywordCount };
}
