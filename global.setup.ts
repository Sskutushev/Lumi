// Fix TextEncoder/TextDecoder issue that occurs in some Node.js environments
// This polyfill should be loaded before any other modules to prevent esbuild errors

// In Vitest globalSetup, we need to export a setup function
export const setup = async () => {
  // Add TextEncoder/TextDecoder to global scope if they're not already defined
  if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder } = await import('util');
    global.TextEncoder = TextEncoder;
  }

  if (typeof global.TextDecoder === 'undefined') {
    const { TextDecoder } = await import('util');
    global.TextDecoder = TextDecoder;
  }
};

export const teardown = async () => {
  // No teardown needed for this setup
};
