const fmt = (ctx: string) => `[${ctx}]`;

export const logger = {
  error: (ctx: string, err: unknown) => console.error(fmt(ctx), err),
  warn:  (ctx: string, msg: string)  => console.warn(fmt(ctx), msg),
  info:  (ctx: string, msg: string)  => console.log(fmt(ctx), msg),
};
