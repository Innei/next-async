import { Runner } from './runner.js'

export class Co<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = any,
> {
  private queue: Runner<Args, Ctx>[] = []
  private ctx: Ctx
  constructor(ctx?: Ctx) {
    this.queue = []
    this.ctx = ctx ?? ({} as any)
  }

  use(...actions: ((...args: Args) => void)[]) {
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
    const runner = this.queue[0]
    if (runner) {
      return runner.run(args)
    }
  }
}
