// ─── Types ────────────────────────────────────────────────────────────────────

export type FlagValue = string | number | boolean;

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, FlagValue>;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parses a raw command string into { command, args, flags }.
 * Returns null for empty input.
 *
 * Examples:
 *   "nmap 192.168.1.1 -p 80"
 *     → { command: "nmap", args: ["192.168.1.1"], flags: { p: 80 } }
 *
 *   "ssh 10.0.0.1 -u admin -p secret"
 *     → { command: "ssh", args: ["10.0.0.1"], flags: { u: "admin", p: "secret" } }
 *
 *   "ls /etc"
 *     → { command: "ls", args: ["/etc"], flags: {} }
 */
export function parseInput(raw: string): ParsedCommand | null {
  const tokens = tokenize(raw.trim());
  if (!tokens.length) return null;

  const [command, ...rest] = tokens;
  const args: string[] = [];
  const flags: Record<string, FlagValue> = {};

  let i = 0;
  while (i < rest.length) {
    const token = rest[i];

    if (token.startsWith('--')) {
      // --key=value  or  --key value
      const eqIndex = token.indexOf('=');
      if (eqIndex !== -1) {
        const key = token.slice(2, eqIndex);
        const value = token.slice(eqIndex + 1);
        flags[key] = castValue(value);
      } else {
        const key = token.slice(2);
        const next = rest[i + 1];
        if (next !== undefined && !next.startsWith('-')) {
          flags[key] = castValue(next);
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (token.startsWith('-') && token.length > 1) {
      // -p 80  or  -abc (boolean cluster)
      const chars = token.slice(1);
      if (chars.length === 1) {
        const next = rest[i + 1];
        if (next !== undefined && !next.startsWith('-')) {
          flags[chars] = castValue(next);
          i++;
        } else {
          flags[chars] = true;
        }
      } else {
        // clustered booleans: -abc → { a: true, b: true, c: true }
        for (const c of chars) flags[c] = true;
      }
    } else {
      args.push(token);
    }

    i++;
  }

  return { command: command.toLowerCase(), args, flags };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Splits on spaces but respects "quoted strings" */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (const char of input) {
    if (inQuote) {
      if (char === quoteChar) {
        inQuote = false;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = true;
      quoteChar = char;
    } else if (char === ' ') {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) tokens.push(current);
  return tokens;
}

/** Casts "80" → 80, "true" → true, "false" → false, else string */
export function castValue(val: string): FlagValue {
  if (val === 'true') return true;
  if (val === 'false') return false;
  const num = Number(val);
  return isNaN(num) ? val : num;
}