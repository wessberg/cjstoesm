## [0.0.21](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.20...v0.0.21) (2020-07-01)

### Bug Fixes

- add support for CommonJS-based barrel exports ([e6e33c0](https://github.com/wessberg/cjs-to-esm-transformer/commit/e6e33c000cd94c216284af41b16c4f0d41b2f57e))

## [0.0.20](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.19...v0.0.20) (2020-06-24)

### Bug Fixes

- fix buit-in-module-map ([10281f8](https://github.com/wessberg/cjs-to-esm-transformer/commit/10281f8ce48e7b423672aee305b2f3b8ee975a59))
- fix buit-in-module-map ([65d897e](https://github.com/wessberg/cjs-to-esm-transformer/commit/65d897ef066f77627f2982ab436a8e1ab46c4e58))
- moving require calls up from a block scope will remove the surrounding block ([a66d7b5](https://github.com/wessberg/cjs-to-esm-transformer/commit/a66d7b5d5f5e5b232b0a37874f2d5d1678d54a4f))
- use a proper TransformationContext at all times. Adds TypeScript v3.9.5 support ([1a14d64](https://github.com/wessberg/cjs-to-esm-transformer/commit/1a14d64e5ac26a6d8086dcf31f3e859d587aee3d))

## [0.0.19](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.18...v0.0.19) (2020-02-27)

## [0.0.18](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.15...v0.0.18) (2020-02-07)

### Bug Fixes

- fix UMD bug ([1b579a9](https://github.com/wessberg/cjs-to-esm-transformer/commit/1b579a9d394983d94cf58082816ec8588a7a67e7))
- support cjs. Move to ESLint since TSLint is deprecated ([6e4b269](https://github.com/wessberg/cjs-to-esm-transformer/commit/6e4b26904f5e6381c32d4a62ab07f7602ae0708e))
- support transforming code that reassigns required bindings into valid ESM ([11ec60d](https://github.com/wessberg/cjs-to-esm-transformer/commit/11ec60d43d35b421d5f3659d283f0a50c235d5b5))

### Features

- make it possible to pass a specific TypeScript version. Add support for transforming from UMD to ESM ([f6c55de](https://github.com/wessberg/cjs-to-esm-transformer/commit/f6c55de32ac27b4fb914ad5f242aa78c22b5b3d0))

## [0.0.15](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.14...v0.0.15) (2019-11-17)

### Bug Fixes

- fix Windows bugs ([5a2fa10](https://github.com/wessberg/cjs-to-esm-transformer/commit/5a2fa10c584c808f95022981c56f631702ca595c))
- fix Windows bugs ([9de491b](https://github.com/wessberg/cjs-to-esm-transformer/commit/9de491b80bb7b3f0d0f302afed114e90b613cb6a))

## [0.0.14](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.13...v0.0.14) (2019-11-11)

## [0.0.13](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.12...v0.0.13) (2019-11-09)

### Bug Fixes

- fix bug where parent links wasn't being set. Closes [#2](https://github.com/wessberg/cjs-to-esm-transformer/issues/2) ([29808ff](https://github.com/wessberg/cjs-to-esm-transformer/commit/29808ff8f74a811f25603ecc7a74893a9a1f4d61))

## [0.0.12](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.11...v0.0.12) (2019-10-19)

### Features

- **cli:** make it possible to run the transform command with simple 'cjstoesm'. ([43e51b6](https://github.com/wessberg/cjs-to-esm-transformer/commit/43e51b6a15f85c2b5f95e56c42059a49d48c0bb4))

## [0.0.11](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.10...v0.0.11) (2019-09-17)

### Performance Improvements

- improves performance by avoiding the emit-phase of TSC in the CLI ([f0e3923](https://github.com/wessberg/cjs-to-esm-transformer/commit/f0e39233d63cecfc3c919e2d71b1c8c9ab1ab6de))

## [0.0.10](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.9...v0.0.10) (2019-09-16)

### Features

- **cli:** adds CLI support for transforming a project from CJS to ESM ([b542834](https://github.com/wessberg/cjs-to-esm-transformer/commit/b5428345abb918901f8e471d81f200440f0ac068))

## [0.0.9](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.8...v0.0.9) (2019-07-09)

### Bug Fixes

- **bug:** fixes issues with handling patterns such as 'const foo = module.exports = ...' or 'const foo = exports.bar = ...' ([ef0fe30](https://github.com/wessberg/cjs-to-esm-transformer/commit/ef0fe303d355b15e68fcdf836277270748f517e2))

## [0.0.8](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.7...v0.0.8) (2019-06-26)

## [0.0.7](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.6...v0.0.7) (2019-06-21)

## [0.0.6](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.5...v0.0.6) (2019-05-29)

## [0.0.5](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.4...v0.0.5) (2019-05-09)

### Bug Fixes

- **exports:** fixes a bug where exports = require(...)() would lead to SyntaxErrors ([1803b54](https://github.com/wessberg/cjs-to-esm-transformer/commit/1803b54c80a23540311cd7f92095af2eeb7f804a))

## [0.0.4](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.3...v0.0.4) (2019-05-06)

### Features

- **exports:** adds support for re-exports with 'exports = require(...)' syntax ([19753ce](https://github.com/wessberg/cjs-to-esm-transformer/commit/19753cef73ece3af39687ff49819a0ff388cc710))

## [0.0.3](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.2...v0.0.3) (2019-04-30)

## [0.0.2](https://github.com/wessberg/cjs-to-esm-transformer/compare/v0.0.1...v0.0.2) (2019-04-30)

## 0.0.1 (2019-04-30)
