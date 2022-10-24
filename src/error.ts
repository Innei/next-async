export class CoAbortError extends Error {
  get [Symbol.toStringTag]() {
    return 'CoAbortError'
  }
}
