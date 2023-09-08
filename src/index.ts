import type { AcceptedPlugin, ChildNode, Declaration, Root } from 'postcss'
import postcss from 'postcss'
import type { CssInJs } from 'postcss-js'
import { parse as cssInJsParser } from 'postcss-js'
import _selectorParser from 'postcss-selector-parser'
import type { Processor } from 'postcss/lib/processor'
import type { CSSEntries, Preflight, Preset, Rule, RuleMeta, Shortcut } from 'unocss'
import type { Arrayable, ComponentOption, ComponentPreset, ParentSelector, ParsedRule, Style } from './type'
import { entriesToCss, isPlainObject, mergeDeep, randomString, toArray, toEscapedSelector } from './uitls'
import conflicts from './conflicts'

export * from './type'

function parseStyles(styles: Arrayable<Style>, postcssPlugins: Arrayable<AcceptedPlugin> = []) {
  return toArray(styles).flatMap(style =>
    isPlainObject(style) && !['root', 'document'].includes((style as Root).type)
      // css in js object
      ? (postcss(toArray(postcssPlugins)) as Processor).process(style as CssInJs, { parser: cssInJsParser }).root.nodes as ChildNode[]
      // css string OR Root object
      : postcss(toArray(postcssPlugins)).process(style).root.nodes as ChildNode[],
  )
}

function formatSelector(selector: string) {
  return selector.trim().replaceAll('_', '\\_').replaceAll('\"', '\'').split(/\s/).filter(Boolean).join('_')
}

const selectorParser = _selectorParser((selector) => {
  // :not pseudo can't be candidata
  selector.walk((node) => {
    if (node.value === ':not')
      node.remove()
  })
  const candidates = []
  const selectorNodes = selector.nodes[0].nodes
  for (const selectorNode of selectorNodes) {
    if (selectorNode.type === 'class')
      candidates.push(selectorNode.value)
    // nested pseudo e.g :where(.foo .bar) :is(.foo .bar)
    if (selectorNode.type === 'pseudo' && selectorNode.nodes && selectorNode.nodes.length) {
      selectorNode.walkClasses((classNode) => {
        candidates.push(classNode.value)
      })
    }
  }
  return candidates
})

function extractCandidates(selector: string) {
  return selectorParser.transformSync(selector)
}

function parseRule(rule: ChildNode): ParsedRule[] {
  if (rule.type === 'rule') {
    return rule.selectors.map((selector) => {
      const candidates = extractCandidates(selector).map((candidate) => {
        if (conflicts.some(conflict => candidate.startsWith(conflict))) {
          selector = selector.replaceAll(`.${candidate}`, `._${candidate}`)
          return `_${candidate}`
        }
        return candidate
      })
      return [candidates, selector, (rule.nodes as Declaration[]).map(decl => [decl.prop, decl.value]), []]
    })
  }
  else if (rule.type === 'atrule' && ['supports', 'media'].includes(rule.name)) {
    const parent = [rule.name.trim(), rule.params.trim()] as ParentSelector
    return rule.nodes.flatMap(parseRule).map((parsedRule) => {
      parsedRule[3]?.push(parent)
      return parsedRule
    })
  }
  else {
    return [[[], '', String(rule), []]]
  }
}

function genComponentPreset(option: ComponentOption): ComponentPreset {
  const {
    style,
    layer = 'default',
    postcssPlugins,
  } = option
  const rules: Rule[] = []
  const shortcuts: Map<string, string[]> = new Map()
  const preflights: Preflight[] = []
  parseStyles(style, postcssPlugins ?? [])
    .flatMap(parseRule)
    .forEach(([candidates, selector, cssbody, parents]) => {
      if (!candidates.length) {
        preflights.push({
          getCSS: () =>
            (parents.length ? `${parents.reverse().map(([name, params]) => `@${name} ${(params)}`).join('{')}{` : '')
                + (selector ? `${selector}{` : '')
                + entriesToCss(cssbody)
                + (selector ? '}' : '')
                + '}'.repeat(parents.length),
          layer,
        })
      }
      const ruleName = randomString()
      rules.push([
        ruleName,
        cssbody as CSSEntries,
        {
          layer,
          internal: true,
          // e.g .range::-moz-range-track,.range::-webkit-slider-runnable-track {decl...}
          // if merged, css may not take effect
          noMerge: selector.includes('::-'),
        },
      ])
      candidates.forEach((candidate) => {
        const shortcutProps = shortcuts.get(candidate) ?? []
        shortcutProps.push(`${parents.length ? `${parents.reverse().map(([name, params]) => `[@${name}${formatSelector(params)}]`).join(':')}:` : ''}selector-[${formatSelector(selector)}]:${ruleName}`)
        shortcuts.set(candidate, shortcutProps)
      })
    })
  return {
    rules,
    shortcuts: [...shortcuts]
      .map(([shortcutName, shortcutProps]) => [
        new RegExp(`^${shortcutName}$`),
        (_, { rawSelector, currentSelector }) => {
          if (rawSelector === currentSelector)
            return shortcutProps
          else
            return shortcutProps.map(prop => prop.replaceAll(new RegExp(`(\\.${shortcutName.replaceAll('_', String.raw`\\_`)})(?![-\\w])?`, 'g'), toEscapedSelector(formatSelector(rawSelector))))
        },
        { layer },
      ] as Shortcut),
    preflights,
  }
}

export default function presetComponent(options: Arrayable<ComponentOption>): Preset<any> {
  return {
    name: 'unocss-preset-component',
    ...toArray(options).map(genComponentPreset)
      .reduce((prev, curr) => (mergeDeep(prev, curr, true)), {}),
  }
}
