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
