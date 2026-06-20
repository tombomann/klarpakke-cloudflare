import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Generate the Cloudflare-specific base config, then inject the build command.
// This prevents `opennextjs-cloudflare build` from recursively invoking `npm run build`.
const cloudflareConfig = defineCloudflareConfig();

export default {
  ...cloudflareConfig,
  buildCommand: "npx next build",
};
