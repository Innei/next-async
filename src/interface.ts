export interface CoCallerAction {
  abort: () => void
  next: () => Promise<void> | void
}
export type Caller<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = {},
> = (this: CoCallerAction & Ctx, ...args: Args) => void | Promise<void>

export type CoAction<Args extends any[]> = (
  this: CoCallerAction,
  ...args: Args
) => void

export interface CoOptions {
  automaticNext: boolean
}
