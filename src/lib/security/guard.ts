import { NextApiRequest, NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';
import { secureRouteGuard } from '@/lib/security/guard';

// Inside your API handler:
if (!secureRouteGuard(req, res)) return;

// In-memory memory-efficient rate cache engine to block flood attacks
const rateLimiter = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60000 // 1-minute tracking window
});

export function secureRouteGuard(req: NextApiRequest, res: NextApiResponse): boolean {
  // 1. Extract structural proxy remote client fingerprint safely
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  // 2. Immediate baseline behavioral Bot Isolation Firewall
  const isMaliciousBot = /bot|spider|crawl|headless|puppeteer|scanner|sqlmap|nikto/i.test(userAgent);
  if (isMaliciousBot) {
    res.status(403).json({ error: 'Security Violation: Automated bot interaction framework blocked.' });
    return false;
  }

  // 3. Rate-Limiting Protection (Max 10 sensitive transaction attempts per minute per IP address)
  const currentTime = Date.now();
  const userTimestamps = rateLimiter.get(ip) || [];
  const activeWindowRequests = userTimestamps.filter(timestamp => currentTime - timestamp < 60000);

  if (activeWindowRequests.length >= 10) {
    res.status(429).json({ error: 'Too Many Requests. Rate isolation limits exceeded.' });
    return false;
  }

  activeWindowRequests.push(currentTime);
  rateLimiter.set(ip, activeWindowRequests);

  // 4. Content Type Verification enforcing strict sanitization
  if (req.method === 'POST' && req.headers['content-type'] !== 'application/json') {
    res.status(400).json({ error: 'Malformed payload encapsulation specification.' });
    return false;
  }

  return true;
}
