export const isAsyncFunction = (func: any): boolean => {
  return func && func.constructor && func.constructor.name === 'AsyncFunction'
}

export const isGeneratorFunction = (func: any): boolean => {
  return (
    func && func.constructor && func.constructor.name === 'GeneratorFunction'
  )
}

export const isPromise = (obj: any): boolean => {
  return (
    obj &&
    typeof obj.then === 'function' &&
    typeof obj.catch === 'function' &&
    typeof obj.finally === 'function'
  )
}
