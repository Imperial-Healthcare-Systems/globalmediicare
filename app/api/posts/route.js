// Public read endpoint for News & Blogs. Returns published posts from Supabase
// when configured, otherwise the bundled seed. Dynamic so admin edits show
// immediately. Powers any client-side use (e.g. a "latest posts" strip).
import { getPosts } from "../../../lib/posts";

export const dynamic = "force-dynamic";

export async function GET() {
  const { source, posts } = await getPosts();
  return Response.json({ source, posts });
}
