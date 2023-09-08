declare module 'postcss/lib/processor' {
  import type { ProcessOptions, LazyResult } from 'postcss'
  import type { CssInJs, parse } from "postcss-js";
  import NoWorkResult = require('postcss/lib/no-work-result')
  class Processor {
      process(
          obj: CssInJs,
          opts: Omit<ProcessOptions, 'parser'> & { parser: typeof parse },
      ): LazyResult | NoWorkResult;
  }
}