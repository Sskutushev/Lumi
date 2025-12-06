// Polyfill for TextEncoder/TextDecoder for test environment
// This resolves the "new TextEncoder().encode("") instanceof Uint8Array" issue

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Export empty module to satisfy import requirements
export {};
