# GitHub Copilot Code Generation Instructions for Angular and UI Development

This file provides rules and preferences to guide GitHub Copilot's behavior in this repository. It is intended to enforce security, performance, and development standards for scalable Angular applications and maintain governance across the engineering organization.

---

## 🔒 Code Access Restrictions

Copilot must avoid generating or referencing code from:

- `src/environments/`: Sensitive environment-specific values.
- `src/assets/secrets/`: Contains encrypted or private files.
- `src/config/`: Internal app configuration with potential PII.
- Files marked with `@internal` or `@private`.
- Any `.spec.ts` files when generating production code.

---

## 📐 Architecture Guidelines

- Follow a **layered architecture**: components → services → data layer.
- Use **barrel files (`index.ts`)** for clean imports.
- Generate code that favors **Angular module boundaries**.
- Avoid suggesting **deep imports** from Angular packages or internal modules.
- Generate **pure, testable services** with minimal side effects.
- Prefer **standalone components** for reusability (Angular 16+).
- Avoid **logic in templates**; shift to component class methods.
- Use **feature modules** for better scalability and maintainability.
- Ensure **strict typing** in all TypeScript files (`strict` mode in `tsconfig.json`).

---

## 🎨 UI/UX Development Rules

- Adhere to the design system: use Angular Material or [custom system name].
- Do not generate inline styles; use SCSS.
- Generate components that support:
  - Accessibility (`aria-*` attributes).
  - Mobile responsiveness.
  - Internationalization (`i18n` pipes or libraries).
- Prefer `ng-container` over unnecessary DOM wrappers.
- Use **Angular CDK** for advanced UI behaviors (e.g., drag-and-drop, overlays).
- Ensure **dark mode support** using `prefers-color-scheme` media queries.

---

## 🛡 Security & Compliance Rules

- Never generate hardcoded credentials or secrets.
- Do not use `innerHTML` without proper sanitization.
- Use Angular binding syntax (`[attr]`, `{{ }}`) to prevent XSS.
- Avoid logic that manipulates DOM directly unless using Renderer2.
- Assume secure API communication via `HttpClient` and interceptors.
- Do not reference deprecated or unmaintained libraries.
- Validate all user inputs and sanitize outputs.
- Use **Angular Route Guards** for securing routes.

---

## ⚡️ Performance Standards

- Use `OnPush` change detection strategy by default.
- Use `trackBy` in `ngFor` to optimize rendering.
- Suggest `lazy loading` for feature modules and routes.
- Avoid using `ngZone.run()` unless required.
- Optimize for bundle size; suggest tree-shakable modules.
- Minimize suggestion of large, synchronous computations in UI code.
- Use **RxJS best practices**: avoid memory leaks by unsubscribing from observables.

---

## 🧪 Testing & Quality Guidance

- Always generate corresponding `.spec.ts` files for new components/services.
- Use `TestBed` setup with clear arrange-act-assert structure.
- Prefer mocking services using `spyOn` or `jest.fn()`.
- Encourage test coverage above 80% with meaningful assertions.
- Suggest `ng-mocks` or `spectator` for simplifying test generation.
- Avoid tests that rely on real API calls or timers.
- Use **Jasmine** or **Karma** for unit tests and **Protractor** or **Cypress** for end-to-end tests.

---

## 🧰 Tooling & Linting Standards

- Prefer Prettier + ESLint configuration for formatting.
- Suggest generation of code that passes `ng lint` and `ng test`.
- Avoid code patterns that introduce cyclic dependencies or `any` typing.
- Respect `.editorconfig` and workspace-specific VS Code settings.
- Do not generate or suggest usage of unsupported or legacy Angular APIs.
- Use **Angular CLI** for generating components, services, and modules.

---

## 🚀 Developer Productivity Rules

- Suggest commands like `ng generate component/service` where applicable.
- Use CLI-aligned naming conventions (kebab-case for files, PascalCase for classes).
- Generate file headers with JSDoc where relevant.
- Generate reusable code: pipes, directives, and shared modules.
- Avoid code duplication across modules.
- Use **Angular DevTools** for debugging and performance profiling.

---

## 🧩 Governance Meta-Rules

- This repository follows secure-by-default and performance-by-default principles.
- All generated code must conform to enterprise quality standards.
- Copilot must not suggest logic that bypasses security reviews, testing, or CI checks.
- Copilot should prioritize maintainability over shortcuts.
- Respect this instruction file as the authoritative source of generation policy.

---

## PRIME DIRECTIVE

- Avoid working on more than one file at a time.
- Multiple simultaneous edits to a file will cause corruption.
- Be chatting and teach about what you are doing while coding.

---

## LARGE FILE & COMPLEX CHANGE PROTOCOL

### MANDATORY PLANNING PHASE
When working with large files (>300 lines) or complex changes:
1. ALWAYS start by creating a detailed plan BEFORE making any edits
2. Your plan MUST include:
   - All functions/sections that need modification
   - The order in which changes should be applied
   - Dependencies between changes
   - Estimated number of separate edits required

3. Format your plan as:
## PROPOSED EDIT PLAN
   Working with: [filename]
   Total planned edits: [number]

### MAKING EDITS
- Focus on one conceptual change at a time.
- Show clear "before" and "after" snippets when proposing changes.
- Include concise explanations of what changed and why.
- Always check if the edit maintains the project's coding style.

### Edit sequence:
1. [First specific change] - Purpose: [why]
2. [Second specific change] - Purpose: [why]
3. Do you approve this plan? I'll proceed with Edit [number] after your confirmation.
4. WAIT for explicit user confirmation before making ANY edits when user ok edit [number]

### EXECUTION PHASE
- After each individual edit, clearly indicate progress:
  "✅ Completed edit [#] of [total]. Ready for next edit?"
- If you discover additional needed changes during editing:
  - STOP and update the plan
  - Get approval before continuing

### REFACTORING GUIDANCE
When refactoring large files:
- Break work into logical, independently functional chunks.
- Ensure each intermediate state maintains functionality.
- Consider temporary duplication as a valid interim step.
- Always indicate the refactoring pattern being applied.

### RATE LIMIT AVOIDANCE
- For very large files, suggest splitting changes across multiple sessions.
- Prioritize changes that are logically complete units.
- Always provide clear stopping points.

---

## General Requirements
Use modern technologies as described below for all code suggestions. Prioritize clean, maintainable code with appropriate comments.

### Accessibility
- Ensure compliance with **WCAG 2.1** AA level minimum, AAA whenever feasible.
- Always suggest:
  - Labels for form fields.
  - Proper **ARIA** roles and attributes.
  - Adequate color contrast.
  - Alternative texts (`alt`, `aria-label`) for media elements.
  - Semantic HTML for clear structure.
  - Tools like **Lighthouse** for audits.

### Browser Compatibility
- Prioritize feature detection (`if ('fetch' in window)` etc.).
- Support latest two stable releases of major browsers:
  - Firefox, Chrome, Edge, Safari (macOS/iOS)
- Emphasize progressive enhancement with polyfills or bundlers (e.g., **Babel**, **Vite**) as needed.

### HTML/CSS Requirements
- **HTML**:
  - Use HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<search>`, etc.)
  - Include appropriate ARIA attributes for accessibility.
  - Ensure valid markup that passes W3C validation.
  - Use responsive design practices.
  - Optimize images using modern formats (`WebP`, `AVIF`).
  - Include `loading="lazy"` on images where applicable.
  - Generate `srcset` and `sizes` attributes for responsive images when relevant.
  - Prioritize SEO-friendly elements (`<title>`, `<meta description>`, Open Graph tags).

- **CSS**:
  - Use modern CSS features including:
    - CSS Grid and Flexbox for layouts.
    - CSS Custom Properties (variables).
    - CSS animations and transitions.
    - Media queries for responsive design.
    - Logical properties (`margin-inline`, `padding-block`, etc.).
    - Modern selectors (`:is()`, `:where()`, `:has()`).
    - Follow BEM or similar methodology for class naming.
    - Use CSS nesting where appropriate.
    - Include dark mode support with `prefers-color-scheme`.
    - Prioritize modern, performant fonts and variable fonts for smaller file sizes.
    - Use modern units (`rem`, `vh`, `vw`) instead of traditional pixels (`px`) for better responsiveness.

### JavaScript Requirements

- **Minimum Compatibility**: ECMAScript 2020 (ES11) or higher.
- **Features to Use**:
  - Arrow functions.
  - Template literals.
  - Destructuring assignment.
  - Spread/rest operators.
  - Async/await for asynchronous code.
  - Classes with proper inheritance when OOP is needed.
  - Object shorthand notation.
  - Optional chaining (`?.`).
  - Nullish coalescing (`??`).
  - Dynamic imports.
  - BigInt for large integers.
  - `Promise.allSettled()`.
  - `String.prototype.matchAll()`.
  - `globalThis` object.
  - Private class fields and methods.
  - Export * as namespace syntax.
  - Array methods (`map`, `filter`, `reduce`, `flatMap`, etc.).

- **Avoid**:
  - `var` keyword (use `const` and `let`).
  - jQuery or any external libraries.
  - Callback-based asynchronous patterns when promises can be used.
  - Internet Explorer compatibility.
  - Legacy module formats (use ES modules).
  - Limit use of `eval()` due to security risks.

- **Performance Considerations**:
  - Recommend code splitting and dynamic imports for lazy loading.

### Error Handling:
- Use `try-catch` blocks **consistently** for asynchronous and API calls, and handle promise rejections explicitly.
- Differentiate among:
  - **Network errors** (e.g., timeouts, server errors, rate-limiting).
  - **Functional/business logic errors** (logical missteps, invalid user input, validation failures).
  - **Runtime exceptions** (unexpected errors such as null references).
- Provide **user-friendly** error messages (e.g., “Something went wrong. Please try again shortly.”) and log more technical details to dev/ops (e.g., via a logging service).
- Consider a central error handler function or global event (e.g., `window.addEventListener('unhandledrejection')`) to consolidate reporting.
- Carefully handle and validate JSON responses, incorrect HTTP status codes, etc.

### Organization custom instructions
- Describe how to answer certain questions: 
  - For questions related to security, use the Security Docs Knowledge Base or advise people to consult with #security on Teams