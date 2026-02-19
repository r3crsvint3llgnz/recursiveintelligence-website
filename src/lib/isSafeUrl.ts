const BARE_IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/

// Node's URL parser preserves brackets for IPv6 literals, so hostname is '[::1]'
const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0'])

export function isSafeUrl(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false

  const host = url.hostname.toLowerCase()

  if (BLOCKED_HOSTS.has(host)) return false

  // Block all bare IPv4 addresses (covers public IPs, RFC-1918, and link-local)
  if (BARE_IPV4.test(host)) return false

  // Block all IPv6 addresses (any hostname with brackets)
  if (host.includes('[') || host.includes(']')) return false

  // Must have at least one dot (blocks single-label names like "internal")
  if (!host.includes('.')) return false

  return true
}
