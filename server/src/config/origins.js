function allowedOrigins() {
  const raw = process.env.FRONTEND_URL || "http://localhost:3000";
  const origins = new Set(["http://localhost:3000"]);

  for (const item of raw.split(",")) {
    const value = item.trim();
    if (!value) continue;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    let url;
    try {
      url = new URL(withProtocol);
    } catch {
      continue;
    }
    origins.add(url.origin);
    if (url.hostname.startsWith("www.")) {
      origins.add(`${url.protocol}//${url.hostname.slice(4)}`);
    } else if (url.hostname !== "localhost") {
      origins.add(`${url.protocol}//www.${url.hostname}`);
    }
  }

  return [...origins];
}

module.exports = { allowedOrigins };
