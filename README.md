# unocss-preset-component

Easy to generate preset from css string, css in js object, postcss Rule

## Installation

```bash
npm i -D unocss-preset-component
```

## Usages

uno.config.ts

```typescript
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, presetUno } from 'unocss'
import postcssNested from 'postcss-nested'
import presetComponent from 'unocss-preset-component'

export default defineConfig({
  presets: [
    presetUno(),
    presetComponent({
      style: readFileSync(resolve(__dirname, './style/switch.css')),
      postcssPlugins: [postcssNested()],
    }),
  ],
})
```
## Options

### style
style string | css in js |Root object
### layer
The layer name of this component
### postcssPlugins
postcss plugins (do not support async plugin)

## NOTE

Some special prefixes(e.g 'link-', 'file-') may conflict with variants in presetMini().
To avoid conflicts, add '_' as prefix (e.g 'link-' to '_link-')

## License

MIT License