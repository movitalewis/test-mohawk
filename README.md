# Mohawk Xchange Frontend

## Local Development Setup

### Prerequisites
- **Node.js**: Version >=12 and <=22.x (LTS recommended)
- **npm**: Comes with Node.js
- **Angular CLI**: Install globally if not present
	```sh
	npm install -g @angular/cli
	```

### 1. Clone the repository
If you haven't already:
```sh
git clone <repo-url>
cd xchange-frontend
```

### 2. Install dependencies
```sh
npm install
```

### 3. Run the application locally
```sh
npm run start-local
```
- This will start the app at [http://localhost:4200](http://localhost:4200) and open it in your browser.

### 4. Useful npm scripts
- **Build (dev):**
	```sh
	npm run build-dev
	```
- **Build (production):**
	```sh
	npm run build-production
	```
- **Lint:**
	```sh
	npm run lint
	```
- **Test:**
	```sh
	npm test
	```

### Troubleshooting
- Ensure your Node.js version is within the required range (`>=12 <=22.x`).
- If you encounter issues, try deleting `node_modules` and running `npm install` again.
- For Angular CLI issues, ensure it is installed globally and matches the project version.

---
For more details, see the scripts in `package.json` and project documentation.



### https://dev-alpha.mohawkxchange.com
```sh
branch: develop
CX API endpoint: d1
Angular Version: 21.0.0
```

### https://staging-alpha.mohawkxchange.com
```sh
branch: staging-becon
CX API endpoint: s2
Angular Version: 14.x
```

### https://qa-alpha.mohawkxchange.com
```sh
branch: staging-becon-w2
CX API endpoint: s1
Angular Version: 14.x
```

### https://www.mohawkxchange.com
```sh
branch: master-crest
CX API endpoint: p1
Angular Version: 14.x
```