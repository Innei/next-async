import { CoSyncError } from './error.js'
import type { CoAction, CoOptions } from './interface.js'
import { Runner } from './runner.js'

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
          cae: this.options.catchAbortError,
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
      this.queue[0]?.runSync(args)
      return
    }

    let prevRunner = null as Runner<Args, Ctx> | null

    for (const runner of this.queue) {
      if (runner.checkIsRunned()) {
        continue
      }
      if (prevRunner?.isAbort) {
        break
      }

      runner.runSync(args)
      prevRunner = runner
    }
  }

  async start(...args: Args) {
    try {
      this.startSync(...args)
      return
    } catch (err) {
      if (!(err instanceof CoSyncError)) {
        throw err
      }
    }

    if (this.options.automaticNext) {
      const runAsync = async () => {
        // TODO refactor
        let prevRunner = null as Runner<Args, Ctx> | null
        for await (const runner of this.queue) {
          if (runner.checkIsRunned()) {
            continue
          }

          if (prevRunner?.isAbort) {
            break
          }

          runner.isAsync() ? await runner.run(args) : runner.runSync(args)
          prevRunner = runner
        }
      }

      await runAsync()
    } else {
      const runner = this.queue[0]
      if (runner) {
        await runner.run(args)
      }
    }
  }
}
