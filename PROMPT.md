# FormPopulator Integration Prompt (ChatGPT Operating Rules + Deliverables)

## Objective
Help me integrate and use `FormPopulator.js` (as implemented in this repository) to **hydrate** UI containers/forms from data objects and to **extract** values for save/submit—accurately, with minimal disruption to my existing code.

## Default Scope (Important)
By default, we are **using** FormPopulator in my feature.  
**Do not modify `FormPopulator.js`** unless I explicitly say: **“Modify FormPopulator.js”** (or equivalent).

## Source of Truth
- The authoritative behavior is **exactly what is implemented** in the repo’s `FormPopulator.js` (and any accompanying docs in the repo).
- Do not rely on assumptions about other libraries or typical patterns.
- If any doc conflicts with the code, the code wins (call out the mismatch).

## Hard Rules (Process Control)
1. **No guessing / no invention**
	- Do not invent selectors, IDs, `name` attributes, field mappings, plugin presence, or data shapes.
	- If required information is missing or ambiguous, **stop and ask** for the exact snippet(s) needed.

2. **Minimal diff**
	- Make the fewest changes possible to my existing code.
	- Do not refactor or reorganize unless I explicitly request it.

3. **No renames**
	- Do not rename my field keys, DOM `name`/`id`, functions, variables, or file names.
	- Do not introduce aliases for existing names.

4. **Precise patches**
	- When you propose changes, always provide:
		- File name(s)
		- Exact code blocks
		- Clear instructions: **“Insert after …”** or **“Replace … with …”**
		- Line numbers if available from the provided file.

5. **Use only what you can see**
	- Base your answer only on:
		- The repo files I provide/upload/paste (especially `FormPopulator.js`)
		- The HTML snippet(s) and payload(s) I provide
		- The plugin list and initialization timing I provide

## Inputs I Will Provide (or you must locate in the repo if present)
- `FormPopulator.js` (required unless already present in the chat/repo context)
- `README.md` / `CLAUDE.md` (if present; useful but code is authoritative)
- The feature’s form/container HTML snippet (the target DOM)
- One representative data object (API payload) to hydrate the form
- Which plugins are used and when they are initialized:
	- TomSelect / Chosen (jQuery) / Selectize / AutoNumeric / none

## Output Requirements (What you must produce)
1. **Mapping table**
	- For each payload key: show the DOM target resolution:
		- Prefer `[name="key"]`
		- Fallback `#key`
	- Identify repeated-name fields and how they behave.

2. **Exact integration snippets**
	- Show the precise code to call:
		- `FormPopulator.populate(container, data, attributes?, sanitizeHtml?)`
		- `FormPopulator.getValuesByKey(container, keys)`
	- Include how to locate `container` (without guessing; use provided HTML).

3. **Plugin path confirmation**
	- If selects/numeric fields exist, confirm which branch is used:
		- TomSelect / Selectize / Chosen / native select
		- AutoNumeric vs plain input
	- Specify required initialization order so hydration works correctly.

4. **Detect real issues**
	- Identify mismatches or defects in my usage with concrete fixes, such as:
		- Wrong container passed
		- Missing `name`/`id`
		- Multi-select vs single-select mismatch
		- Checkbox/radio value mismatches
		- `sanitizeHtml` choice risks/behavior
		- Attribute hydration usage

## If I explicitly ask to modify FormPopulator.js
- Apply the same Hard Rules, but to the library code:
	- Minimal diff, no renames, exact patch instructions, line numbers.
- Explain behavior changes in concrete terms and update docs if I request it.

## Start Here
Ask only for what is missing, in this order:
1) The feature HTML snippet (container + fields)
2) One representative data object (payload)
3) Plugins used + when initialized (before/after populate)
4) Confirm whether this task is **integration only** or includes **modifying FormPopulator.js**
