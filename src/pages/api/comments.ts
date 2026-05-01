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
    return runtime.env as { DB?: D1Database; AI?: any } | undefined;
  } catch {
    return undefined;
  }
};

const getEnv = async () => {
  return await getRuntimeEnv();
};

const getDb = async () => {
  const env = await getEnv();
  return env?.DB;
};

const getAi = async () => {
  const env = await getEnv();
  return env?.AI;
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

export const GET: APIRoute = async ({ url }) => {
  try {
    const postSlug = url.searchParams.get('postSlug')?.trim();
    if (!postSlug) return json({ error: 'Thiếu postSlug' }, 400);

    const db = await getDb();
    if (!db) return json({ error: 'Chưa cấu hình D1 binding DB' }, 500);
    const columns = await getCommentColumns(db);

    const authorExpr = columns.hasAuthorName
      ? columns.hasAuthor
        ? 'COALESCE(author_name, author)'
        : 'author_name'
      : columns.hasAuthor
        ? 'author'
        : "''";
    const createdAtExpr = columns.hasCreatedAt ? 'created_at' : "datetime('now')";
    const whereByPost = columns.hasPostSlug ? 'post_slug = ?' : '1 = 1';
    const statusFilter = columns.hasStatus ? "AND status = 'approved'" : '';
    const query = `SELECT id, ${authorExpr} as authorName, content, ${createdAtExpr} as createdAt
         FROM comments
         WHERE ${whereByPost} ${statusFilter}
         ORDER BY id DESC`;
    const queryBind = columns.hasPostSlug ? [postSlug] : [];

    const { results } = await db
      .prepare(query)
      .bind(...queryBind)
      .all<{ id: number; authorName: string; content: string; createdAt: string }>();

    return json({ comments: results });
  } catch (error) {
    return json({ error: `Lỗi đọc bình luận: ${String(error)}` }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const env = await getEnv();
    const db = env?.DB;
    const ai = env?.AI;

    if (!db) return json({ error: 'Chưa cấu hình D1 binding DB' }, 500);
    const columns = await getCommentColumns(db);

    let payload: {
      postSlug?: string;
      authorName?: string;
      gmail?: string;
      isAnonymous?: boolean;
      content?: string;
    } = {};
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Dữ liệu không hợp lệ' }, 400);
    }

    const postSlug = payload.postSlug?.trim();
    const rawAuthorName = payload.authorName?.trim() || '';
    const gmail = payload.gmail?.trim() || '';
    const isAnonymous = Boolean(payload.isAnonymous);
    const content = payload.content?.trim();

    if (!postSlug || !content) {
      return json({ error: 'Thiếu dữ liệu bắt buộc' }, 400);
    }

    if (content.length > 1000) {
      return json({ error: 'Dữ liệu vượt quá giới hạn' }, 400);
    }

    // --- CLOUDFLARE WORKERS AI: KIỂM DUYỆT NỘI DUNG ---
    let commentStatus = 'pending';
    if (ai) {
      try {
        const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'Bạn là một trợ lý kiểm duyệt bình luận cho blog "Đường Tăng.vn". Hãy kiểm tra xem bình luận sau có chứa nội dung độc hại, xúc phạm, quảng cáo rác (spam) hoặc vi phạm thuần phong mỹ tục không. Chỉ trả về duy nhất một từ: "SAFE" nếu nội dung ổn, hoặc "TOXIC" nếu nội dung không ổn.'
            },
            {
              role: 'user',
              content: content
            }
          ]
        });
        
        const aiResult = response.response?.toUpperCase() || '';
        if (aiResult.includes('TOXIC')) {
          return json({ error: 'Bình luận chứa nội dung không phù hợp và bị hệ thống AI từ chối.' }, 400);
        }
        if (aiResult.includes('SAFE')) {
          commentStatus = 'approved'; // Tự động duyệt nếu AI xác nhận an toàn
        }
      } catch (aiError) {
        console.error('Lỗi AI Moderation:', aiError);
        // Nếu AI lỗi, vẫn cho phép gửi nhưng để trạng thái pending
      }
    }

    const gmailRegex = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
    if (!isAnonymous && !gmailRegex.test(gmail)) {
      return json({ error: 'Bạn cần dùng Gmail hợp lệ hoặc chọn bình luận ẩn danh' }, 400);
    }

    const resolvedAuthorName = isAnonymous
      ? 'Ẩn danh'
      : rawAuthorName || gmail.split('@')[0] || 'Người dùng Gmail';

    if (resolvedAuthorName.length > 60) {
      return json({ error: 'Tên hiển thị vượt quá giới hạn' }, 400);
    }

    const insertColumns: string[] = [];
    const insertValues: string[] = [];
    const bindValues: unknown[] = [];

    if (columns.hasPostSlug) {
      insertColumns.push('post_slug');
      insertValues.push('?');
      bindValues.push(postSlug);
    }
    if (columns.hasAuthorName) {
      insertColumns.push('author_name');
      insertValues.push('?');
      bindValues.push(resolvedAuthorName);
    }
    if (columns.hasAuthor) {
      insertColumns.push('author');
      insertValues.push('?');
      bindValues.push(resolvedAuthorName);
    }
    insertColumns.push('content');
    insertValues.push('?');
    bindValues.push(content);

    if (columns.hasStatus) {
      insertColumns.push('status');
      insertValues.push('?');
      bindValues.push(commentStatus);
    }
    if (columns.hasCreatedAt) {
      insertColumns.push('created_at');
      insertValues.push(`datetime('now')`);
    }

    await db
      .prepare(`INSERT INTO comments (${insertColumns.join(', ')}) VALUES (${insertValues.join(', ')})`)
      .bind(...bindValues)
      .run();

    return json({ ok: true, status: commentStatus }, 201);
  } catch (error) {
    return json({ error: `Lỗi gửi bình luận: ${String(error)}` }, 500);
  }
};
