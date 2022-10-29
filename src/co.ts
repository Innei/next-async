import { CoAbortError, CoSyncError } from './error.js'
import type { CoAction, CoOptions } from './interface.js'
import { Runner } from './runner.js'
import { isPromise } from './utils.js'

export class Co<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = any,
> {
  private queue: Runner<Args, Ctx>[] = []
  private ctx: Ctx

  private options: CoOptions = null!
  constructor(ctx?: Ctx, options?: Partial<CoOptions>) {
    const { automaticNext = false, catchAbortError = true } = options || {}

    this.options = {
      automaticNext,
      catchAbortError,
    }

    this.queue = []
    this.ctx = ctx ?? ({} as any)
  }

  use(...actions: CoAction<Args, Ctx>[]) {
    for (let i = 0; i < actions.length; i++) {
      this.queue.push(
        new Runner({
          nextSibling: null,
          caller: actions[i],
          ctx: this.ctx,
        }),
      )
    }

    for (let i = 0; i < actions.length - 1; i++) {
      const currentRunner = this.queue[i]
      const nextRunner = this.queue[i + 1]
      if (nextRunner) {
        currentRunner.setNextSibling(nextRunner)
      }
    }

    return this
  }

  startSync(...args: Args) {
    const isAllRunnerSync = this.queue.every((runner) => !runner.isAsync())
    if (!isAllRunnerSync) {
      throw new CoSyncError()
    }
    if (!this.options.automaticNext) {
      this.queue[0]?.run(args)
      return
    }

    try {
      for (const runner of this.queue) {
        if (runner.checkIsRunned()) {
          continue
        }

        runner.run(args)
      }
    } catch (err) {
      this.shouldThrowError(err)
    }
  }

  async start(...args: Args) {
    if (this.options.automaticNext) {
      try {
        this.startSync(...args)
      } catch (err) {
        if (err instanceof CoSyncError) {
          const runAsync = async () => {
            for await (const runner of this.queue) {
              if (runner.checkIsRunned()) {
                continue
              }
              try {
                const result = runner.run(args)

                isPromise(result)
                  ? await result.catch(this.shouldThrowError)
                  : result
              } catch (err) {
                this.shouldThrowError(err)
              }
            }
          }

          try {
            await runAsync()
          } catch (err) {
            this.shouldThrowError(err)
          }
        } else {
          throw err
        }
      }
    } else {
      const runner = this.queue[0]
      if (runner) {
        try {
          const result = runner.run(args)

          return isPromise(result)
            ? result.catch(this.shouldThrowError)
            : result
        } catch (err) {
          this.shouldThrowError(err)
        }
      }
    }
  }

  private shouldThrowError = (err: any) => {
    if (this.options.catchAbortError && err instanceof CoAbortError) {
      return
    }

    throw err
  }
}
