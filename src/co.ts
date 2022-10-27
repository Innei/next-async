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
    const { automaticNext = false } = options || {}

    this.options = {
      automaticNext,
    }

    this.queue = []
    this.ctx = ctx ?? ({} as any)
  }

  use(...actions: CoAction<Args>[]) {
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
  }

  start(...args: Args) {
    if (this.options.automaticNext) {
      for (const runner of this.queue) {
        if (runner.checkIsRunned()) {
          continue
        }
        runner.run(args)
      }
    } else {
      const runner = this.queue[0]
      if (runner) {
        return runner.run(args)
      }
    }
  }
}
