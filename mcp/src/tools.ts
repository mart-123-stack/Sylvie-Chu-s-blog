import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10000,
});

export const TOOLS = [
  {
    name: "blog_list_posts",
    description: "List blog posts with optional tag, search, and pagination filters",
    inputSchema: {
      type: "object",
      properties: {
        tag: { type: "string", description: "Filter by tag" },
        search: { type: "string", description: "Search in title/content/excerpt" },
        page: { type: "number", description: "Page number (1-based)", default: 1 },
        limit: { type: "number", description: "Posts per page", default: 10 },
      },
    },
  },
  {
    name: "blog_get_post",
    description: "Get a single blog post by its slug",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Post slug (URL identifier)" },
      },
      required: ["slug"],
    },
  },
  {
    name: "blog_create_post",
    description: "Create a new blog post",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Post title" },
        content: { type: "string", description: "Markdown content" },
        excerpt: { type: "string", description: "Short summary" },
        author: { type: "string", description: "Author name", default: "Admin" },
        slug: { type: "string", description: "URL slug (auto if omitted)" },
        published: { type: "boolean", description: "Publish immediately", default: false },
        tags: { type: "array", items: { type: "string" }, description: "Tags" },
      },
      required: ["title", "content", "excerpt"],
    },
  },
  {
    name: "blog_update_post",
    description: "Update an existing blog post",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Post ID" },
        title: { type: "string" },
        content: { type: "string" },
        excerpt: { type: "string" },
        author: { type: "string" },
        slug: { type: "string" },
        published: { type: "boolean" },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["id"],
    },
  },
  {
    name: "blog_delete_post",
    description: "Delete a blog post by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Post ID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "blog_list_tags",
    description: "List all unique tags used across posts",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "blog_get_about",
    description: "Get the About page configuration",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "blog_update_about",
    description: "Update the About page configuration",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        initials: { type: "string" },
        title: { type: "string" },
        location: { type: "string" },
        bio: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              company: { type: "string" },
              period: { type: "string" },
            },
          },
        },
        avatar_url: { type: "string" },
      },
    },
  },
  {
    name: "blog_list_photos",
    description: "List all photos in the gallery",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "blog_add_photo",
    description: "Add a new photo to the gallery",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Photo title" },
        category: { type: "string", description: "Category (e.g. Nature, Urban)" },
        url: { type: "string", description: "Photo URL" },
      },
      required: ["title", "category"],
    },
  },
  {
    name: "blog_delete_photo",
    description: "Delete a photo from the gallery",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Photo ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "blog_list_comments",
    description: "List comments for a blog post",
    inputSchema: {
      type: "object",
      properties: {
        post_slug: { type: "string", description: "Post slug" },
      },
      required: ["post_slug"],
    },
  },
  {
    name: "blog_delete_comment",
    description: "Delete a comment by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Comment ID" },
      },
      required: ["id"],
    },
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function handleTool(name: string, args: any) {
  switch (name) {
    case "blog_list_posts": {
      const { tag, search } = args;
      const page = args.page ?? 1;
      const limit = args.limit ?? 10;
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (tag) { conditions.push(`$${idx++} = ANY(tags)`); params.push(tag); }
      if (search) {
        conditions.push(`(title ILIKE $${idx} OR content ILIKE $${idx} OR excerpt ILIKE $${idx})`);
        params.push(`%${search}%`); idx++;
      }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const count = await pool.query(`SELECT COUNT(*) FROM posts ${where}`, params);
      const total = parseInt(count.rows[0]?.count || "0", 10);

      const result = await pool.query(
        `SELECT * FROM posts ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      );

      return { posts: result.rows, total, page, totalPages: Math.ceil(total / limit) };
    }

    case "blog_get_post": {
      const result = await pool.query("SELECT * FROM posts WHERE slug = $1 LIMIT 1", [args.slug]);
      if (!result.rows.length) throw new Error(`Post not found: ${args.slug}`);
      return result.rows[0];
    }

    case "blog_create_post": {
      const id = Date.now().toString();
      const slug = args.slug || slugify(args.title);
      const result = await pool.query(
        `INSERT INTO posts (id, title, content, excerpt, author, slug, published, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [id, args.title, args.content, args.excerpt, args.author || "Admin", slug, args.published ?? false, args.tags || []]
      );
      return result.rows[0];
    }

    case "blog_update_post": {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      for (const key of ["title", "content", "excerpt", "author", "slug", "published", "tags"] as const) {
        if (args[key] !== undefined) { fields.push(`${key} = $${idx++}`); values.push(args[key]); }
      }
      if (!fields.length) throw new Error("No fields to update");
      values.push(args.id);
      const result = await pool.query(
        `UPDATE posts SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING *`, values
      );
      if (!result.rows.length) throw new Error(`Post not found: ${args.id}`);
      return result.rows[0];
    }

    case "blog_delete_post": {
      const result = await pool.query("DELETE FROM posts WHERE id = $1 RETURNING id", [args.id]);
      if (!result.rows.length) throw new Error(`Post not found: ${args.id}`);
      return { deleted: true, id: args.id };
    }

    case "blog_list_tags": {
      const result = await pool.query("SELECT DISTINCT unnest(tags) AS tag FROM posts ORDER BY tag");
      return { tags: result.rows.map((r: any) => r.tag) };
    }

    case "blog_get_about": {
      const result = await pool.query("SELECT * FROM about_config WHERE id = 1 LIMIT 1");
      if (!result.rows.length) throw new Error("About config not found");
      return result.rows[0];
    }

    case "blog_update_about": {
      const fields: string[] = []; const values: any[] = []; let idx = 1;
      const fieldMap: Record<string, string> = { name: "name", initials: "initials", title: "title", location: "location", bio: "bio", avatar_url: "avatar_url" };
      for (const [key, col] of Object.entries(fieldMap)) {
        if ((args as any)[key] !== undefined) { fields.push(`${col} = $${idx++}`); values.push((args as any)[key]); }
      }
      if (args.skills !== undefined) { fields.push(`skills = $${idx++}`); values.push(JSON.stringify(args.skills)); }
      if (args.experience !== undefined) { fields.push(`experience = $${idx++}`); values.push(JSON.stringify(args.experience)); }
      if (!fields.length) throw new Error("No fields to update");
      const result = await pool.query(`UPDATE about_config SET ${fields.join(", ")}, updated_at = NOW() WHERE id = 1 RETURNING *`, values);
      return result.rows[0];
    }

    case "blog_list_photos": {
      const result = await pool.query("SELECT * FROM photos ORDER BY created_at DESC");
      return { photos: result.rows };
    }

    case "blog_add_photo": {
      const id = Date.now().toString();
      const result = await pool.query("INSERT INTO photos (id, title, category, url) VALUES ($1, $2, $3, $4) RETURNING *", [id, args.title, args.category, args.url || null]);
      return result.rows[0];
    }

    case "blog_delete_photo": {
      const result = await pool.query("DELETE FROM photos WHERE id = $1 RETURNING id", [args.id]);
      if (!result.rows.length) throw new Error(`Photo not found: ${args.id}`);
      return { deleted: true, id: args.id };
    }

    case "blog_list_comments": {
      const result = await pool.query("SELECT * FROM comments WHERE post_slug = $1 ORDER BY created_at DESC", [args.post_slug]);
      return { comments: result.rows };
    }

    case "blog_delete_comment": {
      const result = await pool.query("DELETE FROM comments WHERE id = $1 RETURNING id", [args.id]);
      if (!result.rows.length) throw new Error(`Comment not found: ${args.id}`);
      return { deleted: true, id: args.id };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
