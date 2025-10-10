import morgan from "morgan";

// ANSI color helper
const color = (code, str) => `\x1b[${code}m${str}\x1b[0m`;

// Custom Morgan formatter
const format = (tokens, req, res) => {
  const status = Number(tokens.status(req, res));

  // Color by status
  const statusColor =
    status >= 500
      ? 31 // red
      : status >= 400
      ? 33 // yellow
      : status >= 300
      ? 36 // cyan
      : 32; // green

  // Color by method
  const method = tokens.method(req, res);
  const methodColor =
    method === "GET"
      ? 34 // blue
      : method === "POST"
      ? 35 // magenta
      : method === "PUT"
      ? 36 // cyan
      : method === "DELETE"
      ? 31 // red
      : 37; // white (default)

  // Build formatted line
  return [
    color(90, tokens.date(req, res, "iso")),
    color(methodColor, method.padEnd(6)),
    tokens.url(req, res),
    color(statusColor, tokens.status(req, res)),
    color(90, `${tokens["response-time"](req, res)} ms`),
  ].join(" ");
};

// Export configured middleware
export const httpLogger = morgan(format);

// Optional: print legend at startup (run once)
console.log(`
${color(34, "GET")} ${color(35, "POST")} ${color(36, "PUT")} ${color(
  31,
  "DELETE"
)}
${color(32, "2xx=Success")} ${color(36, "3xx=Redirect")} ${color(
  33,
  "4xx=ClientErr"
)} ${color(31, "5xx=ServerErr")}
`);
