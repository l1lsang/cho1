import type { IncomingMessage, ServerResponse } from "node:http";

function appendHeaders(headers: Headers, source: IncomingMessage["headers"]) {
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
      continue;
    }

    if (value !== undefined) {
      headers.set(key, value);
    }
  }
}

async function readRequestBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function serializeParsedBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body).toString("utf8");
  }

  return JSON.stringify(body);
}

export async function nodeRequestToWebRequest(
  req: IncomingMessage,
  bodyOverride?: unknown,
) {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const method = req.method ?? "GET";
  const headers = new Headers();

  appendHeaders(headers, req.headers);

  if (method === "GET" || method === "HEAD") {
    return new Request(url, { headers, method });
  }

  let body: BodyInit | undefined;

  if (bodyOverride !== undefined) {
    body = serializeParsedBody(bodyOverride);
    headers.delete("content-length");

    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  } else {
    body = await readRequestBody(req);
  }

  return new Request(url, {
    body,
    headers,
    method,
  });
}

export async function sendWebResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    res.write(Buffer.from(value));
  }

  res.end();
}
