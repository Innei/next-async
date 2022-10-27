import { CoAbortError } from './error.js'
import type { Caller, CoCallerAction } from './interface.js'

export class Runner<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = any,
> {
  private caller: Caller<Args, Ctx> = null!
  private nextSibling: Runner<Args, Ctx> | null = null
  private ctx: Ctx = null as any

  private isRunned = false

  public checkIsRunned() {
    return this.isRunned
  }

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
      const result = this.caller.call(
        Object.assign({}, callerAction, this.ctx),
        ...args,
      )
      this.isRunned = true
      // if (isPromise(result)) {
      //   result.then((res) => {
      //     this.isRunned = true
      //     return res
      //   })
      // }
      return result
    } catch (err) {
      if (err instanceof CoAbortError) {
        return
      }
      throw err
    }
  }
}
