/**
 * One-shot DDL apply for production (Wave 10).
 * Auth: Authorization Bearer CRON_SECRET
 * Body: { "file": "20260721_beta_invites.sql" } — basename under supabase/migrations only.
 *
 * Remove this route after migrations are applied (sensitive DB URLs only exist at runtime).
 */
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { withApiLogging } from '@/lib/api/withApiLogging';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED = new Set([
  '20260721_beta_invites.sql',
]);

export const POST = withApiLogging('cron/migrate', async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { file?: string } | null;
  const file = body?.file?.trim() || '';
  if (!ALLOWED.has(file) || file.includes('..') || file.includes('/')) {
    return NextResponse.json(
      { ok: false, error: 'file not allowed', allowed: [...ALLOWED] },
      { status: 400 }
    );
  }

  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', file);
  let sql: string;
  try {
    sql = await readFile(sqlPath, 'utf8');
  } catch {
    return NextResponse.json({ ok: false, error: 'migration file missing in deploy' }, { status: 404 });
  }

  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    '';

  if (!connectionString) {
    // Construct from discrete vars if marketplace split them
    const host = process.env.POSTGRES_HOST?.trim();
    const user = process.env.POSTGRES_USER?.trim();
    const password = process.env.POSTGRES_PASSWORD?.trim();
    const database = process.env.POSTGRES_DATABASE?.trim() || 'postgres';
    if (!host || !user || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No Postgres connection env at runtime',
          have: {
            POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
            POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
            POSTGRES_HOST: Boolean(host),
            POSTGRES_USER: Boolean(user),
            POSTGRES_PASSWORD: Boolean(password),
            SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          },
        },
        { status: 503 }
      );
    }
    // fall through with constructed URL
    const encUser = encodeURIComponent(user);
    const encPass = encodeURIComponent(password);
    const cs = `postgresql://${encUser}:${encPass}@${host}:5432/${database}?sslmode=require`;
    return applySql(cs, sql, file);
  }

  return applySql(connectionString, sql, file);
});

async function applySql(connectionString: string, sql: string, file: string) {
  try {
    // Dynamic import so local typecheck doesn't require pg types in deps if missing
    const { default: pg } = await import('pg');
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
      await client.query(sql);
      const { rows } = await client.query(`
        select
          to_regclass('public.beta_invites')::text as beta_invites,
          to_regclass('public.checkout_recovery')::text as checkout_recovery,
          exists(
            select 1 from information_schema.columns
            where table_schema = 'public'
              and table_name = 'profiles'
              and column_name = 'invited_via'
          ) as invited_via
      `);
      return NextResponse.json({ ok: true, file, verify: rows[0] });
    } finally {
      await client.end();
    }
  } catch (e) {
    console.error('cron/migrate', e);
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message.slice(0, 300) : 'migrate failed',
      },
      { status: 500 }
    );
  }
}
