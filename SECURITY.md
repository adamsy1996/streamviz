# Security Policy

Generated visualizations are untrusted content. The package uses a sandboxed iframe and runtime sanitization, but hosts should keep their own trust boundary intact.

## Supported Versions

Security fixes target the latest released version.

## Reporting a Vulnerability

Please report vulnerabilities privately through the repository security advisory flow when available. If this package is mirrored or vendored, report the issue to the maintainer of that distribution.

Useful details include:

- Minimal malicious widget source.
- Browser and runtime version.
- Whether the payload was streaming or final.
- The expected and observed sandbox behavior.

## Host Guidance

- Keep iframe sandboxing enabled.
- Do not expose privileged host APIs to generated widgets.
- Review any changes to CSP, resource allowlists, script execution, or message passing carefully.
