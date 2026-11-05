// Solo para comprobar tipos con TypeScript local; el runtime real es Supabase Edge/Deno.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};
