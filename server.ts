// SSR polyfills: localStorage and sessionStorage are not available in Node.js
// but are used extensively throughout the app. Provide no-op implementations
// to prevent ReferenceError crashes during server-side rendering.
const noopStorage: Storage = {
	length: 0,
	clear(): void {},
	getItem(_key: string): string | null { return null; },
	key(_index: number): string | null { return null; },
	removeItem(_key: string): void {},
	setItem(_key: string, _value: string): void {},
};
(globalThis as any).localStorage = (globalThis as any).localStorage || noopStorage;
(globalThis as any).sessionStorage = (globalThis as any).sessionStorage || noopStorage;

import 'zone.js/node';

import { CommonEngine } from '@angular/ssr/node';
import * as crypto from 'crypto';
import * as express from 'express';
import { join } from 'path';

import AppServerModule from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';



function buildCspPolicy(nonce: string): string {
	const env = process.env['NODE_ENV'] || 'dev';
	const isProd = env === 'production';

	const directives: Record<string, string[]> = {
		'default-src': ["'self'"],
		'script-src': [
			"'self'",
			'https://use.typekit.net',
			'https://web-modules-de-na1.niceincontact.com',
		],
		'style-src': ["'self'", "'unsafe-inline'", 'https://use.typekit.net'],
		'font-src': ["'self'", 'https://use.typekit.net', 'data:'],
		'img-src': [
			"'self'", 'data:', 'blob:',
			'https://*.model-t.cc.commerce.ondemand.com',
			'https://mohawkdirectory.blob.core.windows.net',
		],
		'connect-src': [
			"'self'",
			'https://*.niceincontact.com',
			'https://*.mohawkind.com',
			'https://*.model-t.cc.commerce.ondemand.com',
			'https://mohawkmailcdp.azurewebsites.net',
			'https://mohawkdirectory.blob.core.windows.net',
			'https://app.powerbi.com',
		],
		'frame-src': [
			"'self'",
			'https://app.powerbi.com',
		],
		'worker-src': ["'self'", 'blob:'],
		'object-src': ["'none'"],
		'report-uri': ['/csp-report'],
	};

	if (isProd) {
		directives['script-src'].push(
			'https://www.googletagmanager.com',
			`'nonce-${nonce}'`,
		);
		directives['connect-src'].push(
			'https://prd-crestpim-api.azurewebsites.net',
			'https://ps-tools.azurewebsites.net',
			'https://www.googletagmanager.com',
		);
		directives['frame-src'].push('https://www.googletagmanager.com');
	} else {
		directives['script-src'].push('https://embed.rcrsv.io');
		directives['connect-src'].push(
			'https://qa-crestpim-api.azurewebsites.net',
			'https://ps-tools-dev.azurewebsites.net',
			'https://embed.rcrsv.io',
		);
	}

	return Object.entries(directives)
		.map(([key, values]) => `${key} ${values.join(' ')}`)
		.join('; ');
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
	const compression = require('compression');
	const server = express();
	// compress all responses
	server.use(compression());

	// Security headers middleware
	server.use((_req, res, next) => {
		const nonce = crypto.randomBytes(16).toString('base64');
		res.locals['cspNonce'] = nonce;

		res.setHeader('Content-Security-Policy-Report-Only', buildCspPolicy(nonce));
		res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
		res.setHeader('X-Frame-Options', 'SAMEORIGIN');
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
		res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

		next();
	});

	// CSP violation report endpoint (logs violations for monitoring)
	server.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
		console.warn('[CSP Violation]', JSON.stringify(req.body, null, 2));
		res.status(204).end();
	});

	let distFolder = join(process.cwd(), 'mohawk-xchange/browser');
  // conditional to support run ssr on local and upper environments
	if (!existsSync(distFolder)) {
		distFolder = join(process.cwd(), 'dist/mohawk-xchange/browser');
	}
	const indexHtml = existsSync(join(distFolder, 'index.original.html'))
		? join(distFolder, 'index.original.html')
		: join(distFolder, 'index.html');

	const commonEngine = new CommonEngine();

	server.set('view engine', 'html');
	server.set('views', distFolder);

	// Serve static files from /browser
	// Express v5 no longer supports unnamed wildcards like '*.*'
	// Use express.static as middleware instead
	server.use(express.static(distFolder, {
		maxAge: '0',
	}));

	// All regular routes use the CommonEngine
	// Express v5 requires named wildcards: '*' → '*path'
	server.get('*path', (req, res, next) => {
		const { protocol, originalUrl, baseUrl, headers } = req;
		const nonce = res.locals['cspNonce'] as string;

		commonEngine
			.render({
				bootstrap: AppServerModule,
				documentFilePath: indexHtml,
				url: `${protocol}://${headers.host}${originalUrl}`,
				publicPath: distFolder,
				providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
			})
			.then((html: string) => {
				// Inject nonce into inline script tags for CSP compliance
				html = html.replace(/<script>/g, `<script nonce="${nonce}">`);
				res.send(html);
			})
			.catch((err: Error) => next(err));
	});

	return server;
}

function run(): void {
	const port = process.env['PORT'] || 4200;

	// Start up the Node server
	const server = app();
	server.listen(port, () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
	run();
}

export * from './src/main.server';
