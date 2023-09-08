import type { CSSEntries, DeepPartial } from 'unocss'
import type { Arrayable, CssBody } from './type'

export function toArray<T>(obj: Arrayable<T>): T[] {
  return Array.isArray(obj) ? obj : [obj]
}

export function randomString() {
  return Date.now().toString() + Math.random().toString(16).slice(2)
}

export function entriesToCss(arr?: CssBody) {
  if (!arr)
    return ''
  if (isString(arr))
    return arr as string
  return (arr as CSSEntries)
    .filter(([k, v], idx) => {
      for (let i = idx - 1; i >= 0; i--) {
        if (arr[i]?.[0] === k && arr[i]?.[1] === v)
          return false
      }
      return true
    })
    .map(([key, value]) => value != null ? `${key}:${value};` : undefined)
    .filter(Boolean)
    .join('')
}

// lodash
export function isObjectLike(value: any) {
  return typeof value === 'object' && value !== null
}

const toString = Object.prototype.toString

export function getTag(value: any) {
  if (value == null)
    return value === undefined ? '[object Undefined]' : '[object Null]'

  return toString.call(value)
}

export function isString(value: any) {
  const type = typeof value
  return type === 'string' || (type === 'object' && value != null && !Array.isArray(value) && getTag(value) == '[object String]') // eslint-disable-line eqeqeq
}

export function isPlainObject(value: any) {
  if (!isObjectLike(value) || getTag(value) != '[object Object]') // eslint-disable-line eqeqeq
    return false

  if (Object.getPrototypeOf(value) === null)
    return true

  let proto = value
  while (Object.getPrototypeOf(proto) !== null)
    proto = Object.getPrototypeOf(proto)

  return Object.getPrototypeOf(value) === proto
}

// https://github.com/unocss/unocss/blob/main/packages/core/src/utils/object.ts#L54C1-L75C2
export function mergeDeep<T>(original: T, patch: DeepPartial<T>, mergeArray = false): T {
  const o = original as any
  const p = patch as any

  if (Array.isArray(p)) {
    if (mergeArray && Array.isArray(p))
      return [...o, ...p] as any
    else
      return [...p] as any
  }

  const output = { ...o }
  if (isPlainObject(o) && isPlainObject(p)) {
    Object.keys(p).forEach((key) => {
      if (((isPlainObject(o[key]) && isPlainObject(p[key])) || (Array.isArray(o[key]) && Array.isArray(p[key]))))
        output[key] = mergeDeep(o[key], p[key], mergeArray)
      else
        Object.assign(output, { [key]: p[key] })
    })
  }
  return output
}

/**
 * https://github.com/unocss/unocss/blob/main/packages/core/src/utils/escape.ts
 */
export function escapeSelector(str: string): string {
  const length = str.length
  let index = -1
  let codeUnit
  let result = ''
  const firstCodeUnit = str.charCodeAt(0)
  while (++index < length) {
    codeUnit = str.charCodeAt(index)
    // Note: there's no need to special-case astral symbols, surrogate
    // pairs, or lone surrogates.

    // If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
    // (U+FFFD).
    if (codeUnit === 0x0000) {
      result += '\uFFFD'
      continue
    }

    // Comma
    if (codeUnit === 44) {
      result += '\\,'
      continue
    }

    if (
      // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
      // U+007F, […]
      (codeUnit >= 0x0001 && codeUnit <= 0x001F)
      || codeUnit === 0x007F
      // If the character is the first character and is in the range [0-9]
      // (U+0030 to U+0039), […]
      || (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039)
      // If the character is the second character and is in the range [0-9]
      // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
      || (index === 1
        && codeUnit >= 0x0030
        && codeUnit <= 0x0039
        && firstCodeUnit === 0x002D)
    ) {
      // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
      result += `\\${codeUnit.toString(16)} `
      continue
    }

    if (
      // If the character is the first character and is a `-` (U+002D), and
      // there is no second character, […]
      index === 0
      && length === 1
      && codeUnit === 0x002D
    ) {
      result += `\\${str.charAt(index)}`
      continue
    }

    // If the character is not handled by one of the above rules and is
    // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
    // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
    // U+005A), or [a-z] (U+0061 to U+007A), […]
    if (
      codeUnit >= 0x0080
      || codeUnit === 0x002D
      || codeUnit === 0x005F
      || (codeUnit >= 0x0030 && codeUnit <= 0x0039)
      || (codeUnit >= 0x0041 && codeUnit <= 0x005A)
      || (codeUnit >= 0x0061 && codeUnit <= 0x007A)
    ) {
      // the character itself
      result += str.charAt(index)
      continue
    }

    // Otherwise, the escaped character.
    // https://drafts.csswg.org/cssom/#escape-a-character
    result += `\\${str.charAt(index)}`
  }
  return result
}

export const e = escapeSelector

// https://github.com/unocss/unocss/blob/main/packages/core/src/generator/index.ts#L747
const attributifyRe = /^\[(.+?)(~?=)"(.*)"\]$/

// https://github.com/unocss/unocss/blob/main/packages/core/src/generator/index.ts#L749
export function toEscapedSelector(raw: string) {
  if (attributifyRe.test(raw))
    return raw.replace(attributifyRe, (_, n, s, i) => `[${e(n)}${s}"${e(i)}"]`)
  return `.${e(raw)}`
}
