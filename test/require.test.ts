import test from "./util/test-runner";
import {generateTransformerResult} from "./setup/setup-transformer";
import {formatCode} from "./util/format-code";
import {lt} from "semver";

test("Converts ObjectBindingPatterns to NamedImportBindings. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {readFileSync} = require("./foo");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.readFileSync = () => {};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {readFileSync} from "./foo";`)
	);
});

test("Converts ObjectBindingPatterns to NamedImportBindings. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {readFileSync: _foo} = require("./foo");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.readFileSync = () => {};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {readFileSync as _foo} from "./foo";
		`)
	);
});

test("Handles complex binding patterns by using the first level as an import and the remaining levels as new VariableStatements #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {foo: {bar: baz}} = require("./foo");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.foo = {bar: 2};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {foo} from "./foo";
		const {foo: {bar: baz}} = {foo};
		`)
	);
});

test("Converts require calls wrapped in ElementAccessExpressions to NamedImportBindings. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const BAR = require("./foo")["BAR"];
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR as BAR$0} from "./foo";
		const BAR = {BAR: BAR$0}["BAR"];
		`)
	);
});

test("Converts require calls wrapped in ElementAccessExpressions to NamedImportBindings. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./foo")["BAR"];
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR} from "./foo";
		const foo = {BAR}["BAR"];
		`)
	);
});

test("Converts require calls wrapped in ElementAccessExpressions to NamedImportBindings. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {foo} = require("./foo")["BAR"];
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = {foo: 2};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR} from "./foo";
		const {foo} = {BAR}["BAR"];
		`)
	);
});

test("Converts require calls wrapped in ElementAccessExpressions to NamedImportBindings. #4", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {foo} = (require("./foo")["BAR"]);
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = {foo: 2};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR} from "./foo";
		const {foo} = ({BAR}["BAR"]);
		`)
	);
});

test("Converts require calls wrapped in non-statically analyzable ElementAccessExpressions to Namespace ImportDeclarations. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./foo")[BAR];
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.FOO_BAR_BAZ = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import * as foo$0 from "./foo";
		const foo = foo$0[BAR];
		`)
	);
});

test("Converts require calls wrapped in non-statically analyzable ElementAccessExpressions to Namespace ImportDeclarations. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {foo} = require("./foo")[BAR];
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.FOO_BAR_BAZ = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import * as foo$0 from "./foo";
		const {foo} = foo$0[BAR];
		`)
	);
});

test("Converts require calls wrapped in non-statically analyzable ElementAccessExpressions to Namespace ImportDeclarations. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				myFunction(require("./foo"));
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.FOO_BAR_BAZ = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import * as foo from "./foo";
		myFunction(foo);
		`)
	);
});

test("Converts default imports from modules that has none into namespace imports. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./foo");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.FOO_BAR_BAZ = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import * as foo from "./foo";
		`)
	);
});

test("Converts require calls wrapped in PropertyAccessExpressions to NamedImportBindings. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const BAR = require("./foo").BAR;
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR as BAR$0} from "./foo";
		const BAR = {BAR: BAR$0}.BAR
		`)
	);
});

test("Converts require calls wrapped in PropertyAccessExpressions to NamedImportBindings. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./foo").BAR;
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = {foo: 2};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR} from "./foo";
		const foo = {BAR}.BAR;
		`)
	);
});

test("Converts require calls wrapped in PropertyAccessExpressions to NamedImportBindings. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {foo} = require("./foo").BAR;
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = {foo: 2};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR} from "./foo";
		const {foo} = {BAR}.BAR;
		`)
	);
});

test("Converts require calls wrapped in PropertyAccessExpressions to NamedImportBindings. #4", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {foo} = (require("./foo").BAR);
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.BAR = {foo: 2};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {BAR} from "./foo";
		const {foo} = ({BAR}.BAR);
		`)
	);
});

test("Can handle immediately-invoked require calls. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require('foo')("bar");
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "foo";
		const foo = foo$0("bar");
		`)
	);
});

test("Can handle immediately-invoked require calls. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const bar = require('./foo').bar("bar");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.bar = () => {};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {bar as bar$0} from "./foo";
		const bar = {bar: bar$0}.bar("bar");
		`)
	);
});

test("Can handle immediately-invoked require calls. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require('./foo').bar("bar");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.bar = () => {};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {bar} from "./foo";
		const foo = {bar}.bar("bar");
		`)
	);
});

test("Can handle immediately-invoked require calls. #4", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require('./foo').bar("bar");
				const bar = 2;
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.bar = () => {};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {bar as bar$0} from "./foo";
		const foo = {bar: bar$0}.bar("bar");
		const bar = 2;
		`)
	);
});

test("Converts Identifiers to default imports. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require("foo");
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		`)
	);
});

test("Handles multiple require() calls inside one VariableStatement. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require("foo"), bar = require("bar");
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		import bar from "bar";
		`)
	);
});

test("Handles multiple require() calls inside one VariableStatement mixed with other content. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require("foo"), bar = require("bar"), baz = 2;
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		import bar from "bar";
		const baz = 2;
		`)
	);
});

test("Places imports in top of the SourceFile in the order they were parsed in from top to bottom. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = 2;
		const bar = require("bar");
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import bar from "bar";
		const foo = 2;
		`)
	);
});

test("Handles anonymous require calls. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		myFunction(require("foo"));
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		myFunction(foo);
		`)
	);
});

test("Handles anonymous require calls. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		myFunction(require("foo").bar);
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		myFunction(foo.bar);
		`)
	);
});

test("Handles anonymous require calls. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		myFunction(require("foo")["bar"]);
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		myFunction(foo["bar"]);
		`)
	);
});

test("Handles anonymous require calls. #4", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		require("foo");
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import "foo";
		`)
	);
});

test("Handles anonymous require calls. #5", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		require('./foo')({foo: "bar"});
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo";
		foo({foo: "bar"});
		`)
	);
});

test("Handles anonymous require calls. #6", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				require('./foo').bar({foo: "bar"});
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.bar = () => {};
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {bar} from "./foo";
		({bar}.bar({foo: "bar"}));
		`)
	);
});

test("Handles anonymous require calls. #7", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./foo") ? true : false;
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports = true;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "./foo";
		const foo = foo$0 ? true : false;
		`)
	);
});

test("Deconflicts named imports for anonymous require calls. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = 2;
		myFunction(require("foo"));
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "foo";
		const foo = 2;
		myFunction(foo$0);
		`)
	);
});

test("Deconflicts named imports for anonymous require calls. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const bar = 2;
		myFunction(require("foo").bar);
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		const bar = 2;
		myFunction(foo.bar);
		`)
	);
});

test("Deconflicts named imports for anonymous require calls. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const bar = 2;
		myFunction(require("foo")["bar"]);
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		const bar = 2;
		myFunction(foo["bar"]);
		`)
	);
});

test("Deconflicts named imports for anonymous require calls. #4", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = 2;
				const {foo: {bar: baz}} = require("./foo");`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `
				exports.foo = {bar: 2}`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {foo as foo$0} from "./foo";
		const foo = 2;
		const {foo: {bar: baz}} = {foo: foo$0};
		`)
	);
});

test("Won't use reserved identifiers as generated names for import bindings. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		require("export")("foo");
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import export$0 from "export";
		export$0("foo");
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const {Reflect} = require("./foo").bar;`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `
				exports = globalThis`
			}
		],
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo";
		const {Reflect} = foo.bar;
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		require('./foo').bar({foo: "bar"});
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo";
		foo.bar({foo: "bar"});
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require('foo').bar("bar");
		const bar = 2;
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "foo";
		const foo = foo$0.bar("bar");
		const bar = 2;
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #4", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = 2;
		const {foo: {bar: baz}} = require("foo");
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "foo";
		const foo = 2;
		const {foo: {bar: baz}} = foo$0;
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #5", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require('foo').bar("bar");
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "foo";
		const foo = foo$0.bar("bar");
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #6", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const {foo} = (require("./foo").BAR);
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "./foo";
		const {foo} = (foo$0.BAR);
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #7", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const bar = require('./foo').bar("bar");
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo";
		const bar = foo.bar("bar");
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #8", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require("./foo")[BAR];
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "./foo";
		const foo = foo$0[BAR];
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #9", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const {foo} = require("./foo")[BAR];
	`,
		{typescript}
	);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "./foo";
		const {foo} = foo$0[BAR];
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #10", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const {foo: {bar: baz}} = require("./foo");
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo";
		const {foo: {bar: baz}} = foo;
		`)
	);
});

test("Won't generate NamedImports when the module that is being imported from has none. #11", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const {readFileSync: _foo} = require("./foo");`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "./foo";
		const {readFileSync: _foo} = foo;
		`)
	);
});

test("Can import named bindings from built in Node modules. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const {join} = require("path");`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {join} from "path";
		`)
	);
});

test("Won't duplicate imports of the same module without an ImportClause. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		import "foo";
		require("foo");
		`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import "foo";
		`)
	);
});

test("Won't duplicate imports of the same module without an ImportClause. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		require("foo");
		require("foo");
		`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import "foo";
		`)
	);
});

test("Won't duplicate imports of the same default export. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		myFunction(require("foo"));
		myOtherFunction(require("foo"));
		`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		myFunction(foo);
		myOtherFunction(foo);
		`)
	);
});

test("Won't duplicate imports of the same default export. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require("foo");
		const bar = require("foo");
		`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "foo";
		const bar = foo;
		`)
	);
});

test("Won't duplicate imports of the same default export. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		const foo = require("foo").foo;
		const bar = require("foo").bar;
		`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo$0 from "foo";
		const foo = foo$0.foo;
		const bar = foo$0.bar;
		`)
	);
});

test("Won't duplicate imports of the same Namespace. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				require("./foo");
				require("./foo");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.FOO_BAR_BAZ = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import "./foo";
		`)
	);
});

test("Won't duplicate imports of the same Namespace. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./foo");
				const bar = require("./foo");
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.FOO_BAR_BAZ = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import * as foo from "./foo";
		const bar = foo;
		`)
	);
});

test("Won't duplicate imports of the same Named import. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const bar = require("./foo").foo;
				const baz = require("./foo").foo;
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.foo = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {foo} from "./foo";
		const bar = {foo}.foo;
		const baz = {foo}.foo;
		`)
	);
});

test("Takes deep require() calls and places them in top of the file. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		`
		(async () => {
			const foo = require("bar");
		})();
	`,
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import foo from "bar";
		(async () => {
		})();
		`)
	);
});

test("Takes deep require() calls and places them in top of the file. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				function fooBarBaz () {
					const {foo} = require("./foo");
					console.log(foo);
				}
			`
			},
			{
				entry: true,
				fileName: "foo.ts",
				text: `
				exports.foo = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		import {foo} from "./foo";
		function fooBarBaz () {
			console.log(foo);
		}
		`)
	);
});

test("Handles CommonJS-based barrel exports. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				exports.constants = require("./constants");
			`
			},
			{
				entry: true,
				fileName: "constants.ts",
				text: `
				exports.foo = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import * as constants from "./constants";
			export { constants };
		`)
	);
});

test("Handles CommonJS-based barrel exports. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				exports.constants = require("./constants");
			`
			},
			{
				entry: true,
				fileName: "constants.ts",
				text: `
				exports = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import constants from "./constants";
			export { constants };
		`)
	);
});

test("Handles CommonJS-based barrel exports. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const constants = exports.constants = require("./constants");
			`
			},
			{
				entry: true,
				fileName: "constants.ts",
				text: `
				exports = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import constants$0 from "./constants";
			const constants = constants$0;
			export { constants };
		`)
	);
});

test("Handles named CommonJS-based barrel exports. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				export const SomeLib = require('lib-2');
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			export { default as SomeLib } from "lib-2";
		`)
	);
});

test("Handles named CommonJS-based barrel exports. #2", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				export const SomeLib = require('./foo');
			`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `
				export const foo = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	// Older versions of TypeScript doesn't support named Namespace exports, so another strategy is used there
	if (lt(typescript.version, "3.8.0")) {
		t.deepEqual(
			formatCode(file.text),
			formatCode(`\
			import * as SomeLib from "./foo";
			export {SomeLib};
		`)
		);
	} else {
		t.deepEqual(
			formatCode(file.text),
			formatCode(`\
			export * as SomeLib from "./foo";
		`)
		);
	}
});

test("Handles named CommonJS-based barrel exports. #3", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				export const SomeLib = require('lib-2');
    		export const SomeLibVar = require('lib-2').someVar;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import lib2 from "lib-2";
			export const SomeLibVar = lib2.someVar;
			export { default as SomeLib } from "lib-2";
		`)
	);
});

test("Deconflicts local bindings. #1", (t, {typescript}) => {
	const bundle = generateTransformerResult(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `
				const foo = require("./a").f;
				const bar = require("./b").f;
			`
			},
			{
				entry: true,
				fileName: "a.ts",
				text: `
			exports.f = 2;
			`
			},
			{
				entry: true,
				fileName: "b.ts",
				text: `
			exports.f = 2;
			`
			}
		],
		{typescript}
	);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
			import { f } from "./a";
			import { f as f$0 } from "./b";
			const foo = { f }.f;
			const bar = { f: f$0 }.f;
		`)
	);
});
