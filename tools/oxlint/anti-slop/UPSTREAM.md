# Vendored anti-slop plugin

Source: https://github.com/dmmulroy/anti-slop
Commit: `e8c4880471b23ab7f216fba7b27d173a6ef07d4c`
Copied with the upstream `skills/install-anti-slop/scripts/install.mjs` installer.
License: MIT; see `LICENSE`.

The generic plugin is registered in the repository's `.oxlintrc.json`. The Effect plugin is bundled but not enabled because this application has no direct Effect dependency.

## Local compatibility change

`shared/dictionary-types.ts` uses `unsafeMembers[0] ?? null` in the nonempty intersection branch so the vendored plugin also typechecks with the website's `noUncheckedIndexedAccess` setting. The existing nonempty guard means this preserves runtime behavior and rule severity.

Keep `oxlint` and `@oxlint/plugins` pinned to the same version. Review upstream changes before replacing the vendored source.
