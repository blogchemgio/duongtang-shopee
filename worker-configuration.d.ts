declare module 'cloudflare:workers' {
  export const env: {
    DB?: {
      prepare: (query: string) => {
        bind: (...values: unknown[]) => {
          all: <T = unknown>() => Promise<{ results: T[] }>;
          run: () => Promise<unknown>;
        };
      };
    };
    AI?: any;
    COMMENT_ADMIN_TOKEN?: string;
  };
}
