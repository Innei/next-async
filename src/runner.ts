import { CoAbortError } from './error.js'
import type { Caller, CoCallerAction } from './interface.js'
import { isAsyncFunction, isPromise } from './utils.js'

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
      /**
       * should catch abort error
       */
      cae: boolean

      ctx?: Ctx
    },
  ) {
    this.caller = options.caller
    this.nextSibling = options.nextSibling
    this.ctx = options.ctx as any
  }

  public setNextSibling(runner: Runner<Args, Ctx>) {
    this.nextSibling = runner
  }

  public isAsync() {
    return isAsyncFunction(this.caller)
  }

  public runSync(args: Args): void {
    const [callerAction, checkToThrow] = this.getCallerAction(args)

    try {
      const result = this.caller.call(
        Object.assign({}, callerAction, this.ctx),
        ...args,
      ) as void

      return result
    } catch (err) {
      checkToThrow(err)
    } finally {
      this.isRunned = true
    }
  }

  public isAbort = false

  private getCallerAction(args: Args) {
    const cae = this.options.cae
    const checkToThrow = shouldThrowError.bind(null, cae, () => {
      this.isAbort = true
    })

    return [
      {
        abort() {
          throw new CoAbortError()
        },
        next: () => {
          if (this.isAbort) {
            return
          }
          if (this.nextSibling) {
            try {
              const result = this.nextSibling.run(args)
              isPromise(result) && result.catch(checkToThrow)
            } catch (err) {
              checkToThrow(err)
            }
          }
        },
      } as CoCallerAction,
      checkToThrow,
    ] as const
  }

  public async run(args: Args) {
    const [callerAction, checkToThrow] = this.getCallerAction(args)

    try {
      const result = this.caller.call(
        Object.assign({}, callerAction, this.ctx),
        ...args,
      )

      this.isRunned = true
      const nextResult =
        isPromise(result) && (await result.catch(checkToThrow)) === false
          ? Promise.resolve()
          : result

      return nextResult
    } catch (err) {
      checkToThrow(err)
    } finally {
      this.isRunned = true
    }
  }
}

const shouldThrowError = (cae: boolean, cb: any, err: any) => {
  if (cae && err instanceof CoAbortError) {
    cb()
    return false
  }

  throw err
}
