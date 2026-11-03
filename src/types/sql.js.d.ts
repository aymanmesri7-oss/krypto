declare module "sql.js" {
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  interface Database {
    run(sql: string, params?: unknown[]): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  interface Statement {
    bind(params?: unknown[]): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  export type { Database, SqlJsStatic, Statement };
  export default function initSqlJs(config?: Record<string, unknown>): Promise<SqlJsStatic>;
}
