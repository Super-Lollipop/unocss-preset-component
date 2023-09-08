import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, presetUno } from 'unocss'
import postcssNested from 'postcss-nested'
import { globSync } from 'glob'
import presetComponent from '../src'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded-lg inline-block bg-blue-500 text-white cursor-pointer hover:bg-blue-400 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
  ],
  presets: [
    presetUno(),
    presetComponent({
      style: readFileSync(resolve(__dirname, './style/switch.css')),
      postcssPlugins: [postcssNested()],
    }),
  ],
  configDeps: [...globSync([
    './style/**/*.css',
    '../src/**/*.ts',
  ])],
})
