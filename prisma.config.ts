import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: "postgresql://postgres:cprrhghkdlxld@db.beiiwykdmvqoovbetjnl.supabase.co:5432/postgres",
  },
});