import type { Arrayable, CSSEntries, Preset } from 'unocss'
import type { AcceptedPlugin, LazyResult, Result, Root } from 'postcss'
import type { CssInJs } from 'postcss-js'

export type { Arrayable } from 'unocss'

export type Style = { toString(): string } | LazyResult | Result | Root | string | CssInJs

export interface ComponentOption {
  // style string | css in js | Root object
  style: Arrayable<Style>
  // The layer name of this component
  layer?: string | undefined
  postcssPlugins?: Arrayable<AcceptedPlugin>
}

export type ComponentPreset = Omit<Preset, 'name'>

export type CssBody = string | CSSEntries

// parent selector (e.g. [['media', 'hover:hover'], ['supports', 'hover']])
export type ParentSelector = readonly [
  name: string,
  params: string,
]

export type ParsedRule = readonly [
  // candidate shortcut name
  candidates: string[],
  selector: string,
  cssbody: CssBody,
  parents: ParentSelector[],
]
