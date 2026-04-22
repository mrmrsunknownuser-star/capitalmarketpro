// @ts-nocheck
var requestCounts = new Map()
var WINDOW_MS = 60 * 1000
var MAX_REQUESTS = 30

export function rateLimit(identifier) {
  var now = Date.now()
  var key = identifier
  var record = requestCounts.get(key)

  if (!record) {
    requestCounts.set(key, { count: 1, start: now })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (now - record.start > WINDOW_MS) {
    requestCounts.set(key, { count: 1, start: now })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_REQUESTS - record.count }
}