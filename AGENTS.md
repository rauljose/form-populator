## FormPopulator Assistant Guidance (High-Signal)

**When to apply FormPopulator guidance**
Use these rules ONLY when the user asks to populate/fill/hydrate or extract/serialize form data, or to debug FormPopulator usage. Do not apply strict rules to unrelated parts of the codebase.

**When to use**
- Populating 3+ fields from a data object
- Mixed element types (inputs, selects, checkboxes, radios)
- Using TomSelect/Selectize/Chosen/AutoNumeric
- Need both populate() and getValues() in workflow

**When NOT to use**
- Setting 1–2 simple values (direct assignment is clearer)
- No form elements involved
- Complex per-field conditional logic is required

**Core rules**
- Selector priority: `[name="key"]` before `#key` (name wins).
- Equality: use loose `==` semantics; do not coerce types manually.
- Default sanitizeHtml is true (textContent); only use raw HTML if explicitly requested.
- `null` / `undefined` clears fields.
- File inputs are intentionally skipped.
- Enhanced selects must be initialized before populate().

**populate()**
```js
FormPopulator.populate(container, dataObj, attributesObj?, sanitizeHtml?);
```

**getValues()**
```js
const payload = FormPopulator.getValues(container, ['field1', 'field2']);
```

**Return types**
- Single checkbox: string if checked, key omitted if not checked.
- Checkbox group: array if many, string if one.
- Radio: string or "" if none checked.

**Sanity checklist**
1) Container should be the parent element (not the input itself).
2) Data keys must match HTML `name` attributes.
3) Plugins (TomSelect/Selectize/Chosen/AutoNumeric) must be initialized first.
