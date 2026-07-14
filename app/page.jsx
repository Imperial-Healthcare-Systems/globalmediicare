import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

// The full marketing DOM is generated verbatim from the original single-file
// site by `npm run build:content` (scripts/build-from-html.mjs). Base64 images
// have been extracted to /public/assets and the vanilla-JS engine to
// /public/engine.js, which renders and wires up all interactivity.
const bodyHtml = fs.readFileSync(
  path.join(process.cwd(), "content", "body.html"),
  "utf8"
);

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script src="/engine.js" strategy="afterInteractive" />
    </>
  );
}
