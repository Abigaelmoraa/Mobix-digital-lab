# MØBIX Digital Lab Platform

## Outcome
Build the supplied brief into a branded, working MØBIX website and customer, learning, and administration platform. Deliver it in usable increments, starting with the public website and real enquiry capture, then expand into protected business and learning workflows.

## Milestones
1. **Public website:** Create a polished, mobile-friendly MØBIX site with Home, About, Services, Courses, Portfolio, Pricing, and Contact pages; shared navigation; supplied business facts and contact links; editable service/course/portfolio content; and validated enquiries and quote requests saved to Lovable Cloud. Never publish missing business details or represent sample work as completed client work.
2. **Accounts and customer operations:** Add email/password, Google, and Lovable sign-in; profiles; secure role separation; student/customer registration; protected dashboards; customer enquiries, quotations, project tracking, invoices, and support. Establish a secure first-administrator provisioning path without public/default credentials.
3. **Learning platform:** Add course administration, lessons and materials, enrolments, progress, quizzes, assignments, instructor access limited to assigned courses, and certificate issue/verification/revocation. Keep course prices editable in KES and never imply accreditation.
4. **Payments and installability:** Add server-verified Daraja STK Push with duplicate-callback protection and sandbox/live configuration only after merchant credentials are supplied; add installable PWA support and offline access to selected public content, with preview-safe service-worker behavior. Document Android packaging as separate from an APK.

## Technical approach
- Keep the existing TanStack Start and Tailwind v4 foundation; use distinct public routes and the existing semantic design-token system.
- Use Lovable Cloud for persistent data and authentication. Use authenticated server functions for protected operations, database row policies for ownership/roles, and public server routes only for external callbacks. Do not put secrets in browser code.
- Store profile details in a profiles table. Keep roles in a separate protected user_roles table; never let users grant themselves elevated roles.
- Use migrations with explicit grants and row-level security. Keep payment and messaging states truthful: do not confirm a payment before provider verification or claim automated WhatsApp delivery.
- Add route-specific metadata and verify the public site, validation, access boundaries, mobile layout, and build output.

## Boundaries and pending details
Use only the provided Nairobi location, phone/WhatsApp number, KES currency, and brand identity. Do not invent email, street address, prices, social profiles, clients, awards, accreditation, registration data, or M-Pesa merchant details. Provide editable settings for missing information and leave credential-dependent payment actions unavailable until configured.
