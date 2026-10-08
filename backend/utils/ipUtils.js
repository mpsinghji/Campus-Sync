import net from "net";

// Cloudflare official IP CIDR ranges
export const CLOUDFLARE_CIDRS = [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
  "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
  "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
  "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22"
];

/**
 * Checks if an IP is within private RFC 1918 / RFC 4193 subnets (e.g. 10.x.x.x, 172.16-31.x.x, 192.168.x.x, fc00::/7).
 * Excludes 127.0.0.1 (loopback is checked by isLocalIp).
 */
export const isInternalIp = (ip) => {
  if (!ip || typeof ip !== "string") return false;
  let clean = ip.trim();
  if (clean.startsWith("::ffff:")) clean = clean.slice(7);

  // 10.0.0.0/8 (Render internal container mesh)
  if (clean.startsWith("10.")) return true;

  // 172.16.0.0/12 (Docker / bridge)
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;

  // 192.168.0.0/16
  if (clean.startsWith("192.168.")) return true;

  // 169.254.0.0/16 (Link-local)
  if (clean.startsWith("169.254.")) return true;

  // IPv6 Unique Local Address (fc00::/7) or Link-Local (fe80::/10)
  const lower = clean.toLowerCase();
  if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) return true;

  return false;
};

/**
 * Checks if an IP is a known Cloudflare proxy IP.
 */
export const isCloudflareIp = (ip) => {
  if (!ip) return false;
  let clean = ip.trim();
  if (clean.startsWith("::ffff:")) clean = clean.slice(7);
  for (const cidr of CLOUDFLARE_CIDRS) {
    if (isIpInCidr(clean, cidr)) return true;
  }
  return false;
};

/**
 * Extracts and normalizes the real client IP address from an Express request.
 * Prioritizes verified edge proxy headers on Render (Cloudflare CF-Connecting-IP / True-Client-IP),
 * falls back to Express's secure proxy-evaluated req.ip, and handles local development.
 * Never returns internal/private proxy addresses (10.x, 172.16-31.x, 192.168.x) when a valid
 * public client IP exists.
 */
export const getClientIp = (req) => {
  if (!req) return "127.0.0.1";

  let detectedIp = null;

  // 1. Check Cloudflare / Render edge headers:
  // Render is fronted by Cloudflare. Cloudflare strips any client-provided CF-Connecting-IP
  // and True-Client-IP headers at the edge and populates them with the validated client IP.
  const cfIp = req.headers?.["cf-connecting-ip"]?.trim();
  const trueClientIp = req.headers?.["true-client-ip"]?.trim();

  if (cfIp && isValidIp(cfIp) && !isInternalIp(cfIp)) {
    detectedIp = cfIp;
  } else if (trueClientIp && isValidIp(trueClientIp) && !isInternalIp(trueClientIp)) {
    detectedIp = trueClientIp;
  }

  // 2. If no edge header, use Express's securely evaluated req.ip (using compile with trusted proxies)
  if (!detectedIp && req.ip) {
    let expressIp = req.ip.trim();
    if (expressIp.startsWith("::ffff:")) expressIp = expressIp.slice(7);
    if (isValidIp(expressIp) && !isInternalIp(expressIp)) {
      detectedIp = expressIp;
    }
  }

  // 3. If req.ip or edge header is an internal private IP (like Render's internal 10.x.x.x),
  // extract from X-Forwarded-For by finding the first non-private, non-proxy IP from the right (client entry)
  if (!detectedIp && req.headers?.["x-forwarded-for"]) {
    const rawXff = req.headers["x-forwarded-for"];
    const hops = rawXff.split(",").map((h) => h.trim()).filter(Boolean);
    // Walk hops from right to left, skipping internal proxies (10.x, etc.) and Cloudflare proxies
    for (let i = hops.length - 1; i >= 0; i--) {
      let candidate = hops[i];
      if (candidate.startsWith("::ffff:")) candidate = candidate.slice(7);
      if (isValidIp(candidate) && !isInternalIp(candidate) && !isCloudflareIp(candidate)) {
        detectedIp = candidate;
        break;
      }
    }
  }

  // 4. Fall back to socket / connection remote address or loopback
  if (!detectedIp) {
    let raw = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "127.0.0.1";
    if (raw.startsWith("::ffff:")) raw = raw.slice(7);
    detectedIp = raw;
  }

  // Normalize IPv4-mapped IPv6 (::ffff:192.168.1.1 -> 192.168.1.1)
  if (detectedIp.startsWith("::ffff:")) {
    detectedIp = detectedIp.slice(7);
  }

  // Normalize standard loopback IPv6 (::1 -> 127.0.0.1)
  if (detectedIp === "::1" || detectedIp === "localhost") {
    detectedIp = "127.0.0.1";
  }

  return detectedIp.trim();
};

/**
 * Validates whether a string is a valid IPv4 or IPv6 address.
 */
export const isValidIp = (ip) => {
  if (!ip || typeof ip !== "string") return false;
  return net.isIP(ip.trim()) !== 0;
};

/**
 * Returns IP version: 'v4', 'v6', or null.
 */
export const getIpVersion = (ip) => {
  const version = net.isIP(ip?.trim() || "");
  if (version === 4) return "v4";
  if (version === 6) return "v6";
  return null;
};

/**
 * Checks if an IP is a local/loopback address.
 */
export const isLocalIp = (ip) => {
  const clean = ip?.trim();
  return (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean === "localhost" ||
    clean?.startsWith("127.")
  );
};

/**
 * Checks if a candidate IP is inside a CIDR subnet range (supports IPv4 CIDR).
 */
export const isIpInCidr = (ip, cidr) => {
  if (!ip || !cidr || !cidr.includes("/")) return false;
  try {
    const [range, bitsStr] = cidr.split("/");
    const bits = parseInt(bitsStr, 10);
    if (isNaN(bits) || bits < 0 || bits > 32) return false;

    const ipToLong = (ipAddr) => {
      return (
        ipAddr
          .split(".")
          .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
      );
    };

    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    const ipLong = ipToLong(ip);
    const rangeLong = ipToLong(range);

    return (ipLong & mask) === (rangeLong & mask);
  } catch {
    return false;
  }
};
