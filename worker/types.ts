export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
}

export type AuthUser = { id: number; email: string };

export type AppEnv = {
  Bindings: Env;
  Variables: { user: AuthUser };
};
