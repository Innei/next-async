# Next Async

A simple implementation of koa middleware.

```ts
import { Co } from '@innei/next-async'

const co = new Co()
co.use(someMiddlewares)
await co.start()
```

## Using middleware

```ts
const middleware = function (args) {
  this.next()
}

co.use(middleware)
```

## Pass context to `Co`

```ts
const co = new Co({ data: [] })
co.use(
  function () {
    this.data.push(1)
    this.next()
  },
  function () {
    console.log(this.data) // [1]

    this.next()
    console.log(this.data) // [1, 2]
  },
  function () {
    this.data.push(2)
  },
).start()
```

## Use async runner and await next runner done then back

```ts
const co = new Co({ data: [] })
await co
  .use(
    function () {
      this.data.push(1)
      this.next()
    },
    async function () {
      console.log(this.data) // [1]

      await this.next()
      console.log(this.data) // [1, 2]
    },
    async function () {
      await 1
      this.data.push(2)
    },
  )
  .start()
```

## Abort

```ts
const co = new Co({ data: [] })
co.use(
  function () {
    this.data.push(1)
    this.next()
  },
  function () {
    this.abort()
  },
  function () {
    this.data.push(2) // will do not run
  },
).start()
```

## Options

```ts
const co = new Co(ctx, options)
```

| Key           | Type    | Default | Description                                       |
| ------------- | ------- | ------- | ------------------------------------------------- |
| automaticNext | boolean | false   | Always run next action when this action returned. |
