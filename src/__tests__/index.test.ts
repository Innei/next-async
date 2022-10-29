import { Co } from '../co.js'
import type { CoAction } from '../interface.js'

const middleware1: CoAction<any[][]> = function (arr) {
  arr.push(1)

  this.next()
}

const middleware2: CoAction<any[][]> = function (arr) {
  arr.push(2)

  this.next()
}

const middleware3: CoAction<any[][]> = function (arr) {
  this.abort()
}

const middleware4: CoAction<any[][]> = function (arr) {}

describe('Co', () => {
  it('should work', () => {
    const co = new Co<any[][]>()
    co.use(middleware1)
    const arr: any[] = []
    co.start(arr)

    expect(arr).toEqual([1])
  })

  it('should next', () => {
    const co = new Co<any[][]>()
    co.use(middleware1, middleware2)
    const arr: any[] = []
    co.start(arr)

    expect(arr).toEqual([1, 2])
  })

  it('should abort', () => {
    const co = new Co<any[][]>()
    co.use(middleware1, middleware3, middleware2)
    const arr: any[] = []
    co.start(arr)

    expect(arr).toEqual([1])
  })

  it('should without next', () => {
    const co = new Co<any[][]>()
    co.use(middleware4, middleware3, middleware2)
    const arr: any[] = []
    co.start(arr)

    expect(arr).toEqual([])
  })

  it('should get modified data', () => {
    const co = new Co<number[]>({
      data: [],
    })
    co.use(
      function () {
        this.next()
        expect(this.data).toEqual([1])
      },
      function () {
        this.data.push(1)
        this.next()
        expect(this.data).toEqual([1])
      },
    ).start()
  })
})

describe('Co automatically next', () => {
  const middleware1: CoAction<any[][]> = function (arr) {
    arr.push(1)

    this.next()
  }

  const middleware2: CoAction<any[][]> = function (arr) {
    arr.push(2)

    this.next()
  }

  const middleware3: CoAction<any[][]> = function (arr) {}

  test('should automatically run', () => {
    const co = new Co<any[]>(undefined, {
      automaticNext: true,
    })

    co.use(middleware3, middleware1)
    const arr: any[] = []
    co.start(arr)
    expect(arr).toEqual([1])
  })

  test('should not automatically run', () => {
    const co = new Co<any[]>(undefined, {
      automaticNext: false,
    })

    co.use(middleware3, middleware1)
    const arr: any[] = []
    co.start(arr)
    expect(arr).toEqual([])
  })

  test('should run only once', async () => {
    const co = new Co<any[]>(undefined, { automaticNext: true })

    co.use(middleware3, middleware2, middleware1)
    const arr: any[] = []
    co.start(arr)
    expect(arr).toEqual([2, 1])
  })

  test('async run', async () => {
    const co = new Co<any[]>(undefined, { automaticNext: false })

    co.use(
      async function () {
        await new Promise((resolve) => setTimeout(resolve, 100))
        arr.push(2)
        this.next()
      },
      function (arr) {
        arr.push(1)
        this.next()
      },
    )

    const arr: any[] = []
    await co.start(arr)

    expect(arr).toEqual([2, 1])
  })

  test('async run no await', async () => {
    const co = new Co<any[]>(undefined, { automaticNext: true })

    co.use(
      async function () {
        await 1

        this.next()
      },
      async function () {
        this.next()
      },
      function (arr) {
        arr.push(1)

        this.next()
      },
    )

    const arr: any[] = []

    await co.start(arr)
    expect(arr).toEqual([1])
  })
})
