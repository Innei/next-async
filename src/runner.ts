import { CoAbortError } from './error.js'
import type { Caller, CoCallerAction } from './interface.js'

export class Runner<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = any,
> {
  private caller: Caller<Args, Ctx> = null!
  private nextSibling: Runner<Args, Ctx> | null = null
  private ctx: Ctx = null as any
  constructor(
    private readonly options: {
      nextSibling: Runner<Args, Ctx> | null
      caller: Caller<Args, Ctx>

      ctx?: Ctx
    },
  ) {
    this.caller = options.caller
    this.nextSibling = options.nextSibling
    this.ctx = (options.ctx || {}) as any
  }

  public setNextSibling(runner: Runner<Args, Ctx>) {
    this.nextSibling = runner
  }

  public run(args: Args) {
    const callerAction: CoCallerAction = {
      abort() {
        throw new CoAbortError()
      },
      next: () => {
        if (this.nextSibling) {
          return this.nextSibling.run(args)
        }
      },
    }

    try {
      return this.caller.call(
        Object.assign({}, callerAction, this.ctx),
        ...args,
      )
    } catch (err) {
      if (err instanceof CoAbortError) {
        return
      }
      throw err
    }
  }
}
