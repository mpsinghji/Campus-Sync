import net from "net";

/**
 * Extracts normalized client IP address from Express request.
 * Respects Express 'trust proxy' setup while sanitizing IPv4-mapped IPv6 prefixes.
 */
export const getClientIp = (req) => {
  let rawIp =
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  // Normalize IPv4-mapped IPv6 address (::ffff:192.168.1.1 -> 192.168.1.1)
  if (rawIp.startsWith("::ffff:")) {
    rawIp = rawIp.slice(7);
  }

  // Normalize standard loopback IPv6 (::1 -> 127.0.0.1)
  if (rawIp === "::1") {
    rawIp = "127.0.0.1";
  }

  return rawIp.trim();
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
