import { Co } from '../co.js'

describe('example', () => {
  test('example', () => {
    const data = [] as number[]
    const co = new Co({ data }, { automaticNext: true })
    co.use(
      function () {
        this.data.push(1)
      },
      function () {
        this.next()

        expect(this.data).toEqual([1, 2])
      },
      function () {
        this.data.push(2)
      },
    ).start()

    expect(data).toEqual([1, 2])
  })

  test('e.g. 2', async () => {
    const data = [] as number[]
    const co = new Co({ data })
    await co
      .use(
        function () {
          this.data.push(1)
          this.next()
        },
        async function () {
          await this.next()
          expect(this.data).toEqual([1, 2])
        },
        async function () {
          await 1
          this.data.push(2)
        },
      )
      .start()
    expect(data).toEqual([1, 2])
  })
})
