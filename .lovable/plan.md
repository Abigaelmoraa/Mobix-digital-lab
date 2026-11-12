# MØBIX Sign-In and Studio Dashboard

## Outcome
Provide email/password accounts and a protected studio area for creating, editing, and publishing MØBIX services and courses.

## Work
- Enable email/password sign-in while retaining email confirmation and current signup protections.
- Add sign-up/sign-in screens, save full name and phone to the account profile, and provide session-aware sign-out.
- Add a protected studio route; require an authenticated account with an existing admin or super-admin role before showing content-management tools.
- Use existing row policies for service/course reads and writes; add forms for creating/editing records and changing publication status.
- Refresh the public listings after changes and add unique page metadata for the new screens.

## Security and scope
- Never grant elevated roles during public sign-up or from browser-controlled data. Studio publishing remains unavailable until the intended owner account has an admin role.
- Keep existing profile and role tables; no schema change is planned.
- Google/social login, password recovery, and changes to account confirmation settings are outside this request.

## Technical details
- Use the existing Cloud Auth client and generated auth middleware, with the authenticated route layout and RLS-protected client operations.
- Validate form input and rely on existing admin-only row policies as the authorization boundary.
