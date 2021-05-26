/* eslint-disable */
/**
 * @file This file is auto-generated. Do not change its contents.
 */

import {ElementOf} from "../util/element-of";
import {ModuleExports} from "../module-exports/module-exports";

export const BUILT_IN_MODULE = new Set([
	"assert",
	"assert/strict",
	"async_hooks",
	"buffer",
	"child_process",
	"cluster",
	"console",
	"constants",
	"crypto",
	"dgram",
	"diagnostics_channel",
	"dns",
	"dns/promises",
	"domain",
	"events",
	"fs",
	"fs/promises",
	"http",
	"http2",
	"https",
	"inspector",
	"module",
	"net",
	"os",
	"path",
	"path/posix",
	"path/win32",
	"perf_hooks",
	"process",
	"punycode",
	"querystring",
	"readline",
	"repl",
	"stream",
	"stream/promises",
	"string_decoder",
	"timers",
	"timers/promises",
	"tls",
	"trace_events",
	"tty",
	"url",
	"util",
	"util/types",
	"v8",
	"vm",
	"worker_threads",
	"zlib"
] as const);

export type BuiltInModule = ElementOf<typeof BUILT_IN_MODULE>;
export type BuiltInModuleMap = {
	[Key in BuiltInModule]: ModuleExports;
};

export function isBuiltInModule(moduleName: string): moduleName is BuiltInModule {
	return BUILT_IN_MODULE.has(moduleName as BuiltInModule);
}

export const BUILT_IN_MODULE_MAP: BuiltInModuleMap = {
	assert: {
		namedExports: new Set([]),
		hasDefaultExport: true
	},
	"assert/strict": {
		namedExports: new Set([]),
		hasDefaultExport: true
	},
	async_hooks: {
		namedExports: new Set(["AsyncLocalStorage", "createHook", "executionAsyncId", "triggerAsyncId", "executionAsyncResource", "AsyncResource"]),
		hasDefaultExport: true
	},
	buffer: {
		namedExports: new Set(["Blob", "Buffer", "SlowBuffer", "transcode", "kMaxLength", "kStringMaxLength", "btoa", "atob", "constants", "INSPECT_MAX_BYTES"]),
		hasDefaultExport: true
	},
	child_process: {
		namedExports: new Set(["ChildProcess", "exec", "execFile", "execFileSync", "execSync", "fork", "spawn", "spawnSync"]),
		hasDefaultExport: true
	},
	cluster: {
		namedExports: new Set(["isWorker", "isMaster", "Worker", "workers", "settings", "SCHED_NONE", "SCHED_RR", "schedulingPolicy", "setupMaster", "fork", "disconnect"]),
		hasDefaultExport: true
	},
	console: {
		namedExports: new Set([
			"log",
			"warn",
			"dir",
			"time",
			"timeEnd",
			"timeLog",
			"trace",
			"assert",
			"clear",
			"count",
			"countReset",
			"group",
			"groupEnd",
			"table",
			"debug",
			"info",
			"dirxml",
			"error",
			"groupCollapsed",
			"Console",
			"profile",
			"profileEnd",
			"timeStamp",
			"context"
		]),
		hasDefaultExport: true
	},
	constants: {
		namedExports: new Set([
			"RTLD_LAZY",
			"RTLD_NOW",
			"RTLD_GLOBAL",
			"RTLD_LOCAL",
			"E2BIG",
			"EACCES",
			"EADDRINUSE",
			"EADDRNOTAVAIL",
			"EAFNOSUPPORT",
			"EAGAIN",
			"EALREADY",
			"EBADF",
			"EBADMSG",
			"EBUSY",
			"ECANCELED",
			"ECHILD",
			"ECONNABORTED",
			"ECONNREFUSED",
			"ECONNRESET",
			"EDEADLK",
			"EDESTADDRREQ",
			"EDOM",
			"EDQUOT",
			"EEXIST",
			"EFAULT",
			"EFBIG",
			"EHOSTUNREACH",
			"EIDRM",
			"EILSEQ",
			"EINPROGRESS",
			"EINTR",
			"EINVAL",
			"EIO",
			"EISCONN",
			"EISDIR",
			"ELOOP",
			"EMFILE",
			"EMLINK",
			"EMSGSIZE",
			"EMULTIHOP",
			"ENAMETOOLONG",
			"ENETDOWN",
			"ENETRESET",
			"ENETUNREACH",
			"ENFILE",
			"ENOBUFS",
			"ENODATA",
			"ENODEV",
			"ENOENT",
			"ENOEXEC",
			"ENOLCK",
			"ENOLINK",
			"ENOMEM",
			"ENOMSG",
			"ENOPROTOOPT",
			"ENOSPC",
			"ENOSR",
			"ENOSTR",
			"ENOSYS",
			"ENOTCONN",
			"ENOTDIR",
			"ENOTEMPTY",
			"ENOTSOCK",
			"ENOTSUP",
			"ENOTTY",
			"ENXIO",
			"EOPNOTSUPP",
			"EOVERFLOW",
			"EPERM",
			"EPIPE",
			"EPROTO",
			"EPROTONOSUPPORT",
			"EPROTOTYPE",
			"ERANGE",
			"EROFS",
			"ESPIPE",
			"ESRCH",
			"ESTALE",
			"ETIME",
			"ETIMEDOUT",
			"ETXTBSY",
			"EWOULDBLOCK",
			"EXDEV",
			"PRIORITY_LOW",
			"PRIORITY_BELOW_NORMAL",
			"PRIORITY_NORMAL",
			"PRIORITY_ABOVE_NORMAL",
			"PRIORITY_HIGH",
			"PRIORITY_HIGHEST",
			"SIGHUP",
			"SIGINT",
			"SIGQUIT",
			"SIGILL",
			"SIGTRAP",
			"SIGABRT",
			"SIGIOT",
			"SIGBUS",
			"SIGFPE",
			"SIGKILL",
			"SIGUSR1",
			"SIGSEGV",
			"SIGUSR2",
			"SIGPIPE",
			"SIGALRM",
			"SIGTERM",
			"SIGCHLD",
			"SIGCONT",
			"SIGSTOP",
			"SIGTSTP",
			"SIGTTIN",
			"SIGTTOU",
			"SIGURG",
			"SIGXCPU",
			"SIGXFSZ",
			"SIGVTALRM",
			"SIGPROF",
			"SIGWINCH",
			"SIGIO",
			"SIGINFO",
			"SIGSYS",
			"UV_FS_SYMLINK_DIR",
			"UV_FS_SYMLINK_JUNCTION",
			"O_RDONLY",
			"O_WRONLY",
			"O_RDWR",
			"UV_DIRENT_UNKNOWN",
			"UV_DIRENT_FILE",
			"UV_DIRENT_DIR",
			"UV_DIRENT_LINK",
			"UV_DIRENT_FIFO",
			"UV_DIRENT_SOCKET",
			"UV_DIRENT_CHAR",
			"UV_DIRENT_BLOCK",
			"S_IFMT",
			"S_IFREG",
			"S_IFDIR",
			"S_IFCHR",
			"S_IFBLK",
			"S_IFIFO",
			"S_IFLNK",
			"S_IFSOCK",
			"O_CREAT",
			"O_EXCL",
			"UV_FS_O_FILEMAP",
			"O_NOCTTY",
			"O_TRUNC",
			"O_APPEND",
			"O_DIRECTORY",
			"O_NOFOLLOW",
			"O_SYNC",
			"O_DSYNC",
			"O_SYMLINK",
			"O_NONBLOCK",
			"S_IRWXU",
			"S_IRUSR",
			"S_IWUSR",
			"S_IXUSR",
			"S_IRWXG",
			"S_IRGRP",
			"S_IWGRP",
			"S_IXGRP",
			"S_IRWXO",
			"S_IROTH",
			"S_IWOTH",
			"S_IXOTH",
			"F_OK",
			"R_OK",
			"W_OK",
			"X_OK",
			"UV_FS_COPYFILE_EXCL",
			"COPYFILE_EXCL",
			"UV_FS_COPYFILE_FICLONE",
			"COPYFILE_FICLONE",
			"UV_FS_COPYFILE_FICLONE_FORCE",
			"COPYFILE_FICLONE_FORCE",
			"OPENSSL_VERSION_NUMBER",
			"SSL_OP_ALL",
			"SSL_OP_ALLOW_NO_DHE_KEX",
			"SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION",
			"SSL_OP_CIPHER_SERVER_PREFERENCE",
			"SSL_OP_CISCO_ANYCONNECT",
			"SSL_OP_COOKIE_EXCHANGE",
			"SSL_OP_CRYPTOPRO_TLSEXT_BUG",
			"SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS",
			"SSL_OP_EPHEMERAL_RSA",
			"SSL_OP_LEGACY_SERVER_CONNECT",
			"SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER",
			"SSL_OP_MICROSOFT_SESS_ID_BUG",
			"SSL_OP_MSIE_SSLV2_RSA_PADDING",
			"SSL_OP_NETSCAPE_CA_DN_BUG",
			"SSL_OP_NETSCAPE_CHALLENGE_BUG",
			"SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG",
			"SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG",
			"SSL_OP_NO_COMPRESSION",
			"SSL_OP_NO_ENCRYPT_THEN_MAC",
			"SSL_OP_NO_QUERY_MTU",
			"SSL_OP_NO_RENEGOTIATION",
			"SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION",
			"SSL_OP_NO_SSLv2",
			"SSL_OP_NO_SSLv3",
			"SSL_OP_NO_TICKET",
			"SSL_OP_NO_TLSv1",
			"SSL_OP_NO_TLSv1_1",
			"SSL_OP_NO_TLSv1_2",
			"SSL_OP_NO_TLSv1_3",
			"SSL_OP_PKCS1_CHECK_1",
			"SSL_OP_PKCS1_CHECK_2",
			"SSL_OP_PRIORITIZE_CHACHA",
			"SSL_OP_SINGLE_DH_USE",
			"SSL_OP_SINGLE_ECDH_USE",
			"SSL_OP_SSLEAY_080_CLIENT_DH_BUG",
			"SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG",
			"SSL_OP_TLS_BLOCK_PADDING_BUG",
			"SSL_OP_TLS_D5_BUG",
			"SSL_OP_TLS_ROLLBACK_BUG",
			"ENGINE_METHOD_RSA",
			"ENGINE_METHOD_DSA",
			"ENGINE_METHOD_DH",
			"ENGINE_METHOD_RAND",
			"ENGINE_METHOD_EC",
			"ENGINE_METHOD_CIPHERS",
			"ENGINE_METHOD_DIGESTS",
			"ENGINE_METHOD_PKEY_METHS",
			"ENGINE_METHOD_PKEY_ASN1_METHS",
			"ENGINE_METHOD_ALL",
			"ENGINE_METHOD_NONE",
			"DH_CHECK_P_NOT_SAFE_PRIME",
			"DH_CHECK_P_NOT_PRIME",
			"DH_UNABLE_TO_CHECK_GENERATOR",
			"DH_NOT_SUITABLE_GENERATOR",
			"ALPN_ENABLED",
			"RSA_PKCS1_PADDING",
			"RSA_SSLV23_PADDING",
			"RSA_NO_PADDING",
			"RSA_PKCS1_OAEP_PADDING",
			"RSA_X931_PADDING",
			"RSA_PKCS1_PSS_PADDING",
			"RSA_PSS_SALTLEN_DIGEST",
			"RSA_PSS_SALTLEN_MAX_SIGN",
			"RSA_PSS_SALTLEN_AUTO",
			"defaultCoreCipherList",
			"TLS1_VERSION",
			"TLS1_1_VERSION",
			"TLS1_2_VERSION",
			"TLS1_3_VERSION",
			"POINT_CONVERSION_COMPRESSED",
			"POINT_CONVERSION_UNCOMPRESSED",
			"POINT_CONVERSION_HYBRID"
		]),
		hasDefaultExport: true
	},
	crypto: {
		namedExports: new Set([
			"checkPrime",
			"checkPrimeSync",
			"createCipheriv",
			"createDecipheriv",
			"createDiffieHellman",
			"createDiffieHellmanGroup",
			"createECDH",
			"createHash",
			"createHmac",
			"createPrivateKey",
			"createPublicKey",
			"createSecretKey",
			"createSign",
			"createVerify",
			"diffieHellman",
			"generatePrime",
			"generatePrimeSync",
			"getCiphers",
			"getCipherInfo",
			"getCurves",
			"getDiffieHellman",
			"getHashes",
			"hkdf",
			"hkdfSync",
			"pbkdf2",
			"pbkdf2Sync",
			"generateKeyPair",
			"generateKeyPairSync",
			"generateKey",
			"generateKeySync",
			"privateDecrypt",
			"privateEncrypt",
			"publicDecrypt",
			"publicEncrypt",
			"randomBytes",
			"randomFill",
			"randomFillSync",
			"randomInt",
			"randomUUID",
			"scrypt",
			"scryptSync",
			"sign",
			"setEngine",
			"timingSafeEqual",
			"getFips",
			"setFips",
			"verify",
			"Certificate",
			"Cipher",
			"Cipheriv",
			"Decipher",
			"Decipheriv",
			"DiffieHellman",
			"DiffieHellmanGroup",
			"ECDH",
			"Hash",
			"Hmac",
			"KeyObject",
			"Sign",
			"Verify",
			"X509Certificate",
			"secureHeapUsed",
			"constants",
			"webcrypto"
		]),
		hasDefaultExport: true
	},
	dgram: {
		namedExports: new Set(["createSocket", "Socket"]),
		hasDefaultExport: true
	},
	diagnostics_channel: {
		namedExports: new Set(["channel", "hasSubscribers", "Channel"]),
		hasDefaultExport: true
	},
	dns: {
		namedExports: new Set([
			"lookup",
			"lookupService",
			"Resolver",
			"setServers",
			"ADDRCONFIG",
			"ALL",
			"V4MAPPED",
			"NODATA",
			"FORMERR",
			"SERVFAIL",
			"NOTFOUND",
			"NOTIMP",
			"REFUSED",
			"BADQUERY",
			"BADNAME",
			"BADFAMILY",
			"BADRESP",
			"CONNREFUSED",
			"TIMEOUT",
			"EOF",
			"FILE",
			"NOMEM",
			"DESTRUCTION",
			"BADSTR",
			"BADFLAGS",
			"NONAME",
			"BADHINTS",
			"NOTINITIALIZED",
			"LOADIPHLPAPI",
			"ADDRGETNETWORKPARAMS",
			"CANCELLED",
			"getServers",
			"resolve",
			"resolve4",
			"resolve6",
			"resolveAny",
			"resolveCaa",
			"resolveCname",
			"resolveMx",
			"resolveNaptr",
			"resolveNs",
			"resolvePtr",
			"resolveSoa",
			"resolveSrv",
			"resolveTxt",
			"reverse",
			"promises"
		]),
		hasDefaultExport: true
	},
	"dns/promises": {
		namedExports: new Set([
			"lookup",
			"lookupService",
			"Resolver",
			"getServers",
			"resolve",
			"resolve4",
			"resolve6",
			"resolveAny",
			"resolveCaa",
			"resolveCname",
			"resolveMx",
			"resolveNaptr",
			"resolveNs",
			"resolvePtr",
			"resolveSoa",
			"resolveSrv",
			"resolveTxt",
			"reverse",
			"setServers"
		]),
		hasDefaultExport: true
	},
	domain: {
		namedExports: new Set(["Domain", "createDomain", "create", "active"]),
		hasDefaultExport: true
	},
	events: {
		namedExports: new Set([]),
		hasDefaultExport: true
	},
	fs: {
		namedExports: new Set([
			"appendFile",
			"appendFileSync",
			"access",
			"accessSync",
			"chown",
			"chownSync",
			"chmod",
			"chmodSync",
			"close",
			"closeSync",
			"copyFile",
			"copyFileSync",
			"createReadStream",
			"createWriteStream",
			"exists",
			"existsSync",
			"fchown",
			"fchownSync",
			"fchmod",
			"fchmodSync",
			"fdatasync",
			"fdatasyncSync",
			"fstat",
			"fstatSync",
			"fsync",
			"fsyncSync",
			"ftruncate",
			"ftruncateSync",
			"futimes",
			"futimesSync",
			"lchown",
			"lchownSync",
			"lchmod",
			"lchmodSync",
			"link",
			"linkSync",
			"lstat",
			"lstatSync",
			"lutimes",
			"lutimesSync",
			"mkdir",
			"mkdirSync",
			"mkdtemp",
			"mkdtempSync",
			"open",
			"openSync",
			"opendir",
			"opendirSync",
			"readdir",
			"readdirSync",
			"read",
			"readSync",
			"readv",
			"readvSync",
			"readFile",
			"readFileSync",
			"readlink",
			"readlinkSync",
			"realpath",
			"realpathSync",
			"rename",
			"renameSync",
			"rm",
			"rmSync",
			"rmdir",
			"rmdirSync",
			"stat",
			"statSync",
			"symlink",
			"symlinkSync",
			"truncate",
			"truncateSync",
			"unwatchFile",
			"unlink",
			"unlinkSync",
			"utimes",
			"utimesSync",
			"watch",
			"watchFile",
			"writeFile",
			"writeFileSync",
			"write",
			"writeSync",
			"writev",
			"writevSync",
			"Dir",
			"Dirent",
			"Stats",
			"ReadStream",
			"WriteStream",
			"FileReadStream",
			"FileWriteStream",
			"F_OK",
			"R_OK",
			"W_OK",
			"X_OK",
			"constants",
			"promises"
		]),
		hasDefaultExport: true
	},
	"fs/promises": {
		namedExports: new Set([
			"access",
			"copyFile",
			"open",
			"opendir",
			"rename",
			"truncate",
			"rm",
			"rmdir",
			"mkdir",
			"readdir",
			"readlink",
			"symlink",
			"lstat",
			"stat",
			"link",
			"unlink",
			"chmod",
			"lchmod",
			"lchown",
			"chown",
			"utimes",
			"lutimes",
			"realpath",
			"mkdtemp",
			"writeFile",
			"appendFile",
			"readFile",
			"watch"
		]),
		hasDefaultExport: true
	},
	http: {
		namedExports: new Set([
			"METHODS",
			"STATUS_CODES",
			"Agent",
			"ClientRequest",
			"IncomingMessage",
			"OutgoingMessage",
			"Server",
			"ServerResponse",
			"createServer",
			"validateHeaderName",
			"validateHeaderValue",
			"get",
			"request",
			"maxHeaderSize",
			"globalAgent"
		]),
		hasDefaultExport: true
	},
	http2: {
		namedExports: new Set([
			"connect",
			"constants",
			"createServer",
			"createSecureServer",
			"getDefaultSettings",
			"getPackedSettings",
			"getUnpackedSettings",
			"sensitiveHeaders",
			"Http2ServerRequest",
			"Http2ServerResponse"
		]),
		hasDefaultExport: true
	},
	https: {
		namedExports: new Set(["Agent", "globalAgent", "Server", "createServer", "get", "request"]),
		hasDefaultExport: true
	},
	inspector: {
		namedExports: new Set(["open", "close", "url", "waitForDebugger", "console", "Session"]),
		hasDefaultExport: true
	},
	module: {
		namedExports: new Set([]),
		hasDefaultExport: true
	},
	net: {
		namedExports: new Set(["BlockList", "SocketAddress", "connect", "createConnection", "createServer", "isIP", "isIPv4", "isIPv6", "Server", "Socket", "Stream"]),
		hasDefaultExport: true
	},
	os: {
		namedExports: new Set([
			"arch",
			"cpus",
			"endianness",
			"freemem",
			"getPriority",
			"homedir",
			"hostname",
			"loadavg",
			"networkInterfaces",
			"platform",
			"release",
			"setPriority",
			"tmpdir",
			"totalmem",
			"type",
			"userInfo",
			"uptime",
			"version",
			"constants",
			"EOL"
		]),
		hasDefaultExport: true
	},
	path: {
		namedExports: new Set([
			"resolve",
			"normalize",
			"isAbsolute",
			"join",
			"relative",
			"toNamespacedPath",
			"dirname",
			"basename",
			"extname",
			"format",
			"parse",
			"sep",
			"delimiter",
			"win32",
			"posix"
		]),
		hasDefaultExport: true
	},
	"path/posix": {
		namedExports: new Set([
			"resolve",
			"normalize",
			"isAbsolute",
			"join",
			"relative",
			"toNamespacedPath",
			"dirname",
			"basename",
			"extname",
			"format",
			"parse",
			"sep",
			"delimiter",
			"win32",
			"posix"
		]),
		hasDefaultExport: true
	},
	"path/win32": {
		namedExports: new Set([
			"resolve",
			"normalize",
			"isAbsolute",
			"join",
			"relative",
			"toNamespacedPath",
			"dirname",
			"basename",
			"extname",
			"format",
			"parse",
			"sep",
			"delimiter",
			"win32",
			"posix"
		]),
		hasDefaultExport: true
	},
	perf_hooks: {
		namedExports: new Set(["performance", "PerformanceObserver", "monitorEventLoopDelay", "createHistogram", "constants"]),
		hasDefaultExport: true
	},
	process: {
		namedExports: new Set([
			"version",
			"versions",
			"arch",
			"platform",
			"release",
			"moduleLoadList",
			"binding",
			"domain",
			"config",
			"dlopen",
			"uptime",
			"reallyExit",
			"cpuUsage",
			"resourceUsage",
			"memoryUsage",
			"kill",
			"exit",
			"openStdin",
			"getuid",
			"geteuid",
			"getgid",
			"getegid",
			"getgroups",
			"allowedNodeEnvironmentFlags",
			"assert",
			"features",
			"setUncaughtExceptionCaptureCallback",
			"hasUncaughtExceptionCaptureCallback",
			"emitWarning",
			"nextTick",
			"stdout",
			"stdin",
			"stderr",
			"abort",
			"umask",
			"chdir",
			"cwd",
			"initgroups",
			"setgroups",
			"setegid",
			"seteuid",
			"setgid",
			"setuid",
			"env",
			"title",
			"argv",
			"execArgv",
			"pid",
			"ppid",
			"execPath",
			"debugPort",
			"hrtime",
			"argv0",
			"mainModule",
			"emit"
		]),
		hasDefaultExport: true
	},
	punycode: {
		namedExports: new Set(["version", "ucs2", "decode", "encode", "toASCII", "toUnicode"]),
		hasDefaultExport: true
	},
	querystring: {
		namedExports: new Set(["unescapeBuffer", "unescape", "escape", "stringify", "encode", "parse", "decode"]),
		hasDefaultExport: true
	},
	readline: {
		namedExports: new Set(["Interface", "clearLine", "clearScreenDown", "createInterface", "cursorTo", "emitKeypressEvents", "moveCursor"]),
		hasDefaultExport: true
	},
	repl: {
		namedExports: new Set(["start", "writer", "REPLServer", "REPL_MODE_SLOPPY", "REPL_MODE_STRICT", "Recoverable", "builtinModules"]),
		hasDefaultExport: true
	},
	stream: {
		namedExports: new Set([]),
		hasDefaultExport: true
	},
	"stream/promises": {
		namedExports: new Set(["finished", "pipeline"]),
		hasDefaultExport: true
	},
	string_decoder: {
		namedExports: new Set(["StringDecoder"]),
		hasDefaultExport: true
	},
	timers: {
		namedExports: new Set(["setTimeout", "clearTimeout", "setImmediate", "clearImmediate", "setInterval", "clearInterval", "active", "unenroll", "enroll"]),
		hasDefaultExport: true
	},
	"timers/promises": {
		namedExports: new Set(["setTimeout", "setImmediate", "setInterval"]),
		hasDefaultExport: true
	},
	tls: {
		namedExports: new Set([
			"CLIENT_RENEG_LIMIT",
			"CLIENT_RENEG_WINDOW",
			"DEFAULT_CIPHERS",
			"DEFAULT_ECDH_CURVE",
			"DEFAULT_MIN_VERSION",
			"DEFAULT_MAX_VERSION",
			"getCiphers",
			"rootCertificates",
			"convertALPNProtocols",
			"checkServerIdentity",
			"parseCertString",
			"createSecureContext",
			"SecureContext",
			"TLSSocket",
			"Server",
			"createServer",
			"connect",
			"createSecurePair"
		]),
		hasDefaultExport: true
	},
	trace_events: {
		namedExports: new Set(["createTracing", "getEnabledCategories"]),
		hasDefaultExport: true
	},
	tty: {
		namedExports: new Set(["isatty", "ReadStream", "WriteStream"]),
		hasDefaultExport: true
	},
	url: {
		namedExports: new Set([
			"Url",
			"parse",
			"resolve",
			"resolveObject",
			"format",
			"URL",
			"URLSearchParams",
			"domainToASCII",
			"domainToUnicode",
			"pathToFileURL",
			"fileURLToPath",
			"urlToHttpOptions"
		]),
		hasDefaultExport: true
	},
	util: {
		namedExports: new Set([
			"callbackify",
			"debug",
			"debuglog",
			"deprecate",
			"format",
			"formatWithOptions",
			"getSystemErrorName",
			"inherits",
			"inspect",
			"isArray",
			"isBoolean",
			"isBuffer",
			"isDeepStrictEqual",
			"isNull",
			"isNullOrUndefined",
			"isNumber",
			"isString",
			"isSymbol",
			"isUndefined",
			"isRegExp",
			"isObject",
			"isDate",
			"isError",
			"isFunction",
			"isPrimitive",
			"log",
			"promisify",
			"TextDecoder",
			"TextEncoder",
			"types"
		]),
		hasDefaultExport: true
	},
	"util/types": {
		namedExports: new Set([
			"isExternal",
			"isDate",
			"isArgumentsObject",
			"isBigIntObject",
			"isBooleanObject",
			"isNumberObject",
			"isStringObject",
			"isSymbolObject",
			"isNativeError",
			"isRegExp",
			"isAsyncFunction",
			"isGeneratorFunction",
			"isGeneratorObject",
			"isPromise",
			"isMap",
			"isSet",
			"isMapIterator",
			"isSetIterator",
			"isWeakMap",
			"isWeakSet",
			"isArrayBuffer",
			"isDataView",
			"isSharedArrayBuffer",
			"isProxy",
			"isModuleNamespaceObject",
			"isAnyArrayBuffer",
			"isBoxedPrimitive",
			"isArrayBufferView",
			"isTypedArray",
			"isUint8Array",
			"isUint8ClampedArray",
			"isUint16Array",
			"isUint32Array",
			"isInt8Array",
			"isInt16Array",
			"isInt32Array",
			"isFloat32Array",
			"isFloat64Array",
			"isBigInt64Array",
			"isBigUint64Array"
		]),
		hasDefaultExport: true
	},
	v8: {
		namedExports: new Set([
			"cachedDataVersionTag",
			"getHeapSnapshot",
			"getHeapStatistics",
			"getHeapSpaceStatistics",
			"getHeapCodeStatistics",
			"setFlagsFromString",
			"Serializer",
			"Deserializer",
			"DefaultSerializer",
			"DefaultDeserializer",
			"deserialize",
			"takeCoverage",
			"stopCoverage",
			"serialize",
			"writeHeapSnapshot"
		]),
		hasDefaultExport: true
	},
	vm: {
		namedExports: new Set(["Script", "createContext", "createScript", "runInContext", "runInNewContext", "runInThisContext", "isContext", "compileFunction", "measureMemory"]),
		hasDefaultExport: true
	},
	worker_threads: {
		namedExports: new Set([
			"isMainThread",
			"MessagePort",
			"MessageChannel",
			"markAsUntransferable",
			"moveMessagePortToContext",
			"receiveMessageOnPort",
			"resourceLimits",
			"threadId",
			"SHARE_ENV",
			"Worker",
			"parentPort",
			"workerData",
			"BroadcastChannel",
			"setEnvironmentData",
			"getEnvironmentData"
		]),
		hasDefaultExport: true
	},
	zlib: {
		namedExports: new Set([
			"Deflate",
			"Inflate",
			"Gzip",
			"Gunzip",
			"DeflateRaw",
			"InflateRaw",
			"Unzip",
			"BrotliCompress",
			"BrotliDecompress",
			"deflate",
			"deflateSync",
			"gzip",
			"gzipSync",
			"deflateRaw",
			"deflateRawSync",
			"unzip",
			"unzipSync",
			"inflate",
			"inflateSync",
			"gunzip",
			"gunzipSync",
			"inflateRaw",
			"inflateRawSync",
			"brotliCompress",
			"brotliCompressSync",
			"brotliDecompress",
			"brotliDecompressSync",
			"createDeflate",
			"createInflate",
			"createDeflateRaw",
			"createInflateRaw",
			"createGzip",
			"createGunzip",
			"createUnzip",
			"createBrotliCompress",
			"createBrotliDecompress",
			"constants",
			"codes"
		]),
		hasDefaultExport: true
	}
};
