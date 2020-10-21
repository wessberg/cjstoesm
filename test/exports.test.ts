import test from "ava";
import {generateTransformerResult} from "./setup/setup-transformer";
import {formatCode} from "./util/format-code";

test("Converts 'exports = ...' syntax into an ExportAssignment. #1", t => {
	const bundle = generateTransformerResult(`
		function foo () {}
		exports = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export default foo;
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #2", t => {
	const bundle = generateTransformerResult(`
		function foo () {}
		module.exports = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export default foo;
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #3", t => {
	const bundle = generateTransformerResult(`
		exports = function foo () {};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default (function foo () {});
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #4", t => {
	const bundle = generateTransformerResult(`
		class Baz {}

		module.exports = {
			foo: () => {},
			bar: 2,
			Baz,
			Lolz: Baz
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		class Baz {}
		export const foo = () => {};
		export const bar = 2;
		export {Baz};
		export {Baz as Lolz};
		export default {
			foo,
			bar,
			Baz,
			Lolz: Baz
		};
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #5", t => {
	const bundle = generateTransformerResult(`

		module.exports = {
			aMethod () {
				return 2+2;
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export function aMethod () {
			return 2 + 2;
		}
		export default {
			aMethod
		};
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #6", t => {
	const bundle = generateTransformerResult(`
		const foo = "bar";
		module.exports = {
			get something () {
				return foo;
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const foo = "bar";
		export default {
			get something () {
				return foo;
			}
		};
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #7", t => {
	const bundle = generateTransformerResult(`
		module.exports = {};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default {}
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #8", t => {
	const bundle = generateTransformerResult(`
		(module.exports = {});
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default {}
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #1", t => {
	const bundle = generateTransformerResult(`
		exports.foo = 1;
	`);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = 1;
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #2", t => {
	const bundle = generateTransformerResult(`
		function foo () {}
		exports.foo = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export {foo};
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #3", t => {
	const bundle = generateTransformerResult(`
		exports.foo = function foo () {};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export function foo () {}
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #4", t => {
	const bundle = generateTransformerResult(`
		exports.foo = () => {}
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = () => {}
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #5", t => {
	const bundle = generateTransformerResult(`
		exports.f = Object.getOwnPropertySymbols;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const f = Object.getOwnPropertySymbols;
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #6", t => {
	const bundle = generateTransformerResult(`
		function foo () {}
		exports.bar = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export {foo as bar};
		`)
	);
});

test("Converts 'exports.<something>' into ExportDeclarations. #7", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
			module.exports.f = function getOwnPropertyNames() {
  			return 2;
			};`
		}
	]);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const f = function getOwnPropertyNames() {
  		return 2;
		}
		`)
	);
});

test("Converts 'exports.default into a default export. #1", t => {
	const bundle = generateTransformerResult(`
		exports.default = function foo () {}
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default (function foo () {})
		`)
	);
});

test("Converts 'exports.default into a default export. #2", t => {
	const bundle = generateTransformerResult(`
		module.exports.default = function foo () {}
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default (function foo () {})
		`)
	);
});

test("Won't generate duplicate ExportAssignments. #1", t => {
	const bundle = generateTransformerResult(`
		function foo () {}
		exports.default = foo;
		module.exports = foo;
		module.exports.default = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export default foo;
		`)
	);
});

test("Won't generate duplicate ExportDeclarations. #1", t => {
	const bundle = generateTransformerResult(`
		function foo () {}
		exports.foo = foo;
		module.exports.foo = foo;
		module.exports.default = foo;
		exports.bar = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export {foo};
		export default foo;
		export {foo as bar};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #1", t => {
	const bundle = generateTransformerResult(`
		module.exports = {
			foo: true
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = true;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #2", t => {
	const bundle = generateTransformerResult(`
		module.exports = {
			foo: false
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = false;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #3", t => {
	const bundle = generateTransformerResult(`
		module.exports = {
			foo: 2
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = 2;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #4", t => {
	const bundle = generateTransformerResult(`
		module.exports = {
			foo: 2n
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = 2n;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #5", t => {
	const bundle = generateTransformerResult(`
		module.exports = {
			foo: /foo/
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = /foo/;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #6", t => {
	const bundle = generateTransformerResult(`
		module.exports = {
			foo: {
				a: 1,
				b: 2
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = {
			a: 1,
			b: 2
		};
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #7", t => {
	const bundle = generateTransformerResult(`
		module.exports = {
			foo () {
				return 2;
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export function foo () {
			return 2;
		}
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #8", t => {
	const bundle = generateTransformerResult(`
		const obj = {
			foo: 1,
			bar: 10
		};
		module.exports = {
			...obj,
			bar: 2
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const obj = {
			foo: 1,
			bar: 10
		};
		export const bar = 2;
		export default {
			...obj,
			bar
		};
		`)
	);
});

test("Converts 'exports = require(...)' syntax into namespace re-exports if the required module has named exports. #1", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				module.exports = require("./foo");
			`
		},
		{
			entry: true,
			fileName: "foo.ts",
			text: `
				exports.readFileSync = () => {};
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export * from "./foo";
		`)
	);
});

test("Converts 'exports = require(...)()' syntax into namespace import along with a default export if the required module has named exports. #1", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				module.exports = require("./foo")();
			`
		},
		{
			entry: true,
			fileName: "foo.ts",
			text: `
				exports.readFileSync = () => {};
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import * as foo from "./foo";
		export default foo();
		`)
	);
});

test("Converts 'exports = require(...)' syntax into a default export if the required module has one. #1", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				module.exports = require("./foo");
			`
		},
		{
			entry: true,
			fileName: "foo.ts",
			text: `
				exports = () => {};
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export {default} from "./foo";
		`)
	);
});

test("Converts 'exports = require(...)' syntax into a default export if the required module is unknown. #1", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				module.exports = require("./foo");
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export {default} from "./foo";
		`)
	);
});

test("Converts 'exports = require(...)()' syntax into a default export if the required module is unknown. #2", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				module.exports = require("./foo")();
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo";
		export default foo();
		`)
	);
});

test("Converts 'const foo = module.exports = ...' syntax into a VariableStatement followed by an ExportAssignment. #1", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				const iterate = module.exports = {};
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const iterate = {};
		export default iterate;
		`)
	);
});

test("Converts 'const foo = module.exports = ...' syntax into a VariableStatement followed by an ExportAssignment. #2", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				const iterate = module.exports = function () {};
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const iterate = function () {};
		export default iterate;
		`)
	);
});

test("Converts 'const foo = module.exports = ...' syntax into a VariableStatement followed by an ExportAssignment. #3", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				const iterate = module.exports = {foo: 1};
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const iterate = {foo: 1};
		export default iterate;
		`)
	);
});

test("Converts 'const foo = exports.foo = ...' syntax into a VariableStatement followed by an ExportDeclaration. #4", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				const iterate = exports.foo = 1;
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const iterate = 1;
		export {iterate as foo};
		`)
	);
});

test("Converts 'const foo = exports.foo = ...' syntax into a VariableStatement followed by an ExportDeclaration. #5", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				const foo = exports.foo = function foobarbaz () {};
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const foo = function foobarbaz () {};
		export {foo};
		`)
	);
});

test("Converts 'const foo = exports.foo = ...' syntax into a VariableStatement followed by an ExportDeclaration. #6", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				const foo = exports.foo = function foobarbaz () {}, bar = 3;
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const foo = function foobarbaz () {}, bar = 3;
		export {foo};
		`)
	);
});

test("When rewriting 'exports.something = function () {...}', no error will occur if a local binding already exists for 'something'", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				function something () {}
				module.exports.something = function () {
					return something;
				}
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function something () {}
		const something$0 = function () {
			return something;
		}
		export {something$0 as something};
		`)
	);
});

test("When bundling UMD containing exports assignments, the SourceFile will be flattened to the body of the UMD wrapper", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				(function (global, factory) {
					typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
					typeof define === 'function' && define.amd ? define(['exports'], factory) :
					(factory((global.URI = global.URI || {})));
				}(this, (function (exports) {
					'use strict';
					function bar () {return 2;}
					exports.foo = bar();
					}
				))
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		'use strict';
		function bar() { return 2; }
		export const foo = bar();
		`)
	);
});

test("Handles reassignments to imported bindings. #1", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				let {foo} = require("./foo");
				foo = 2; 
			`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `
				exports.foo = 10;
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import { foo as foo$0 } from "./foo";
		let foo = foo$0;
		foo = 2;
		`)
	);
});

test("Handles reassignments to imported bindings. #2", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				let foo = require("./foo");
				foo = 2; 
			`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `
				exports = 10;
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "./foo";
		let foo = foo$0;
		foo = 2;
		`)
	);
});

test("Handles reassignments to imported bindings. #3", t => {
	const bundle = generateTransformerResult([
		{
			entry: true,
			fileName: "index.ts",
			text: `
				let foo = require("./foo");
				foo = 2; 
			`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `
				export.foo = 10;
			`
		}
	]);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import * as foo$0 from "./foo";
		let foo = foo$0;
		foo = 2;
		`)
	);
});
