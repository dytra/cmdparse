# cmd-parser

A lightweight CLI-style command parser that converts raw input strings into structured `{ command, args, flags }`.

Supports:

* Positional arguments
* Short flags (`-p 80`)
* Long flags (`--port=80`, `--port 80`)
* Boolean flag clusters (`-abc`)
* Quoted strings (`"hello world"`)
* Automatic type casting (`"80" → 80`, `"true" → true`)

---

## 📦 Installation

```bash
npm install cmd-parser
```

---

## 🚀 Usage

```ts
import { parseInput } from 'cmd-parser';

const result = parseInput("ssh 10.0.0.1 -u admin -p secret");

console.log(result);
```

### Output

```ts
{
  command: "ssh",
  args: ["10.0.0.1"],
  flags: {
    u: "admin",
    p: "secret"
  }
}
```

---

## 🧠 Examples

### Basic command

```ts
parseInput("ls /etc");
```

```ts
{
  command: "ls",
  args: ["/etc"],
  flags: {}
}
```

---

### With short flags

```ts
parseInput("nmap 192.168.1.1 -p 80");
```

```ts
{
  command: "nmap",
  args: ["192.168.1.1"],
  flags: { p: 80 }
}
```

---

### With long flags

```ts
parseInput("run --env=prod --debug true");
```

```ts
{
  command: "run",
  args: [],
  flags: {
    env: "prod",
    debug: true
  }
}
```

---

### Boolean flag cluster

```ts
parseInput("cmd -abc");
```

```ts
{
  command: "cmd",
  args: [],
  flags: {
    a: true,
    b: true,
    c: true
  }
}
```

---

### Quoted strings

```ts
parseInput("echo \"hello world\"");
```

```ts
{
  command: "echo",
  args: ["hello world"],
  flags: {}
}
```

---

## 🔧 API

### `parseInput(raw: string): ParsedCommand | null`

Parses a raw CLI-like string into structured data.

Returns `null` if input is empt
