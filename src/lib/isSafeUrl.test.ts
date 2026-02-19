import { describe, it, expect } from 'vitest'
import { isSafeUrl } from './isSafeUrl'

describe('isSafeUrl', () => {
  // Valid
  it('accepts standard https URL', () =>
    expect(isSafeUrl('https://example.com/page')).toBe(true))
  it('accepts https URL with query string', () =>
    expect(isSafeUrl('https://arxiv.org/abs/2501.12345?q=1')).toBe(true))
  it('accepts https URL with subdomain', () =>
    expect(isSafeUrl('https://blog.anthropic.com/article')).toBe(true))

  // Protocol
  it('rejects http', () =>
    expect(isSafeUrl('http://example.com')).toBe(false))
  it('rejects ftp', () =>
    expect(isSafeUrl('ftp://example.com')).toBe(false))
  it('rejects javascript:', () =>
    expect(isSafeUrl('javascript:alert(1)')).toBe(false))
  it('rejects data:', () =>
    expect(isSafeUrl('data:text/html,<h1>x</h1>')).toBe(false))

  // Localhost
  it('rejects localhost', () =>
    expect(isSafeUrl('https://localhost/admin')).toBe(false))
  it('rejects 127.0.0.1', () =>
    expect(isSafeUrl('https://127.0.0.1/')).toBe(false))
  it('rejects ::1', () =>
    expect(isSafeUrl('https://[::1]/')).toBe(false))
  it('rejects 0.0.0.0', () =>
    expect(isSafeUrl('https://0.0.0.0/')).toBe(false))

  // RFC-1918 and bare IPs (all blocked by bare-IP regex)
  it('rejects 10.x.x.x', () =>
    expect(isSafeUrl('https://10.0.0.1/')).toBe(false))
  it('rejects 10.255.255.255', () =>
    expect(isSafeUrl('https://10.255.255.255/')).toBe(false))
  it('rejects 192.168.x.x', () =>
    expect(isSafeUrl('https://192.168.1.1/')).toBe(false))
  it('rejects 172.16.x.x', () =>
    expect(isSafeUrl('https://172.16.0.1/')).toBe(false))
  it('rejects 172.31.x.x', () =>
    expect(isSafeUrl('https://172.31.255.255/')).toBe(false))
  it('rejects 172.15.x.x (still a bare IP)', () =>
    expect(isSafeUrl('https://172.15.0.1/')).toBe(false))

  // Link-local
  it('rejects 169.254.x.x', () =>
    expect(isSafeUrl('https://169.254.1.1/')).toBe(false))

  // Bare IP (public)
  it('rejects public bare IP 8.8.8.8', () =>
    expect(isSafeUrl('https://8.8.8.8/')).toBe(false))
  it('rejects public bare IP 1.1.1.1', () =>
    expect(isSafeUrl('https://1.1.1.1/')).toBe(false))

  // Single-label hostname
  it('rejects single-label hostname', () =>
    expect(isSafeUrl('https://internal/')).toBe(false))
  it('rejects single-label hostname without slash', () =>
    expect(isSafeUrl('https://intranet')).toBe(false))

  // Malformed
  it('rejects malformed URL', () =>
    expect(isSafeUrl('not a url')).toBe(false))
  it('rejects empty string', () =>
    expect(isSafeUrl('')).toBe(false))
})
