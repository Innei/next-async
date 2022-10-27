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

  test('should run only once', () => {
    const co = new Co<any[]>(undefined, { automaticNext: true })

    co.use(middleware3, middleware2, middleware1)
    const arr: any[] = []
    co.start(arr)
    expect(arr).toEqual([2, 1])
  })

  // TODO promise and async function
})
