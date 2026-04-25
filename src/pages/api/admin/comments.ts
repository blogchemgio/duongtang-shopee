import type { APIRoute } from 'astro';

export const prerender = false;

type D1Database = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: <T = unknown>() => Promise<{ results: T[] }>;
      run: () => Promise<unknown>;
    };
  };
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const getRuntimeEnv = async () => {
  try {
    const runtime = await import('cloudflare:workers');
    return runtime.env as { DB?: D1Database; COMMENT_ADMIN_TOKEN?: string } | undefined;
  } catch {
    return undefined;
  }
};

const getDb = async () => {
  const runtimeEnv = await getRuntimeEnv();
  return runtimeEnv?.DB;
};

type CommentColumns = {
  hasPostSlug: boolean;
  hasAuthorName: boolean;
  hasAuthor: boolean;
  hasStatus: boolean;
  hasCreatedAt: boolean;
};

const getCommentColumns = async (db: D1Database): Promise<CommentColumns> => {
  const { results } = await db
    .prepare(`PRAGMA table_info(comments)`)
    .bind()
    .all<{ name: string }>();
  const columns = new Set(results.map((row) => row.name));
  return {
    hasPostSlug: columns.has('post_slug'),
    hasAuthorName: columns.has('author_name'),
    hasAuthor: columns.has('author'),
    hasStatus: columns.has('status'),
    hasCreatedAt: columns.has('created_at'),
  };
};

const checkAdminToken = async (request: Request) => {
  const token = request.headers.get('x-admin-token')?.trim();
  const runtimeEnv = await getRuntimeEnv();
  const expected = runtimeEnv?.COMMENT_ADMIN_TOKEN?.trim();
  return Boolean(token && expected && token === expected);
};

export const GET: APIRoute = async ({ request, url }) => {
  if (!(await checkAdminToken(request))) return json({ error: 'Không có quyền truy cập' }, 401);

  const db = await getDb();
  if (!db) return json({ error: 'Chưa cấu hình D1 binding DB' }, 500);
  const columns = await getCommentColumns(db);

  const status = url.searchParams.get('status')?.trim() || 'pending';
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return json({ error: 'Trạng thái không hợp lệ' }, 400);
  }

  const postSlugExpr = columns.hasPostSlug ? 'post_slug' : "'legacy/unknown'";
  const authorExpr = columns.hasAuthorName
    ? columns.hasAuthor
      ? 'COALESCE(author_name, author)'
      : 'author_name'
    : columns.hasAuthor
      ? 'author'
      : "''";
  const createdAtExpr = columns.hasCreatedAt ? 'created_at' : "datetime('now')";
  const statusClause = columns.hasStatus ? 'WHERE status = ?' : '';
  const bindValues = columns.hasStatus ? [status] : [];

  const { results } = await db
    .prepare(
      `SELECT id, ${postSlugExpr} as postSlug, ${authorExpr} as authorName, content, ${
        columns.hasStatus ? 'status' : "'approved'"
      } as status, ${createdAtExpr} as createdAt
       FROM comments
       ${statusClause}
       ORDER BY id DESC
       LIMIT 200`
    )
    .bind(...bindValues)
    .all<{
      id: number;
      postSlug: string;
      authorName: string;
      content: string;
      status: string;
      createdAt: string;
    }>();

  return json({ comments: results });
};

export const POST: APIRoute = async ({ request }) => {
  if (!(await checkAdminToken(request))) return json({ error: 'Không có quyền truy cập' }, 401);

  const db = await getDb();
  if (!db) return json({ error: 'Chưa cấu hình D1 binding DB' }, 500);

  let payload: { id?: number; action?: 'approve' | 'reject' } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Dữ liệu không hợp lệ' }, 400);
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'ID không hợp lệ' }, 400);

  const nextStatus = payload.action === 'approve' ? 'approved' : payload.action === 'reject' ? 'rejected' : null;
  if (!nextStatus) return json({ error: 'Hành động không hợp lệ' }, 400);

  const columns = await getCommentColumns(db);
  if (!columns.hasStatus) {
    return json({ error: 'Bảng comments chưa có cột status để duyệt bình luận' }, 500);
  }

  await db.prepare(`UPDATE comments SET status = ? WHERE id = ?`).bind(nextStatus, id).run();
  return json({ ok: true });
};
