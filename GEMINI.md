# GEMINI_INTEGRATION.md — FormPopulator Technical Reference

## 1. FormPopulator Recognition Trigger
**When to activate this knowledge:**
Apply these patterns **only** when the user asks to:
1.  "Hydrate," "populate," or "fill" a form/container from a JSON object.
2.  "Extract," "get values," or "serialize" a form/container into a JSON object.
3.  Debug issues related to `FormPopulator.js`.

**Scope:**
Do NOT apply "Minimal Diff" or strict formatting rules to the user's broader codebase (e.g., authentication, routing, styling). Apply strictness **only** to the specific lines of code calling `FormPopulator`.

---

## 2. FormPopulator Technical Implementation Specs

### Core Logic (Source of Truth) for FormPopulator
* **Selector Priority:** `[name="key"]` > `#key`.
* **Equality:** Loose equality (`==`). Do not cast strings/numbers manually before population.
* **Security:** Default `sanitizeHtml: true` (textContent). Use `false` (innerHTML) only if user explicitly requests "Raw HTML".

### A. Hydration Pattern (`populate`)
**Goal:** Fill UI from Data.

1.  **Preparation:** Ensure optional plugins (TomSelect/Selectize/Chosen/AutoNumeric) are initialized *before* this call.
2.  **Syntax:**
    ```javascript
    FormPopulator.populate(
      document.getElementById('target-container'), // Container
      payloadObject,                               // Data
      attributeMap,                                // Optional: { key: { disabled: null } }
      true                                         // Optional: sanitize (default: true)
    );
    ```
3.  **Behavior Note:** `null`/`undefined` in data clears the field.

### B. Extraction Pattern (`getValues`) FormPopulator
**Goal:** Create Payload from UI.

1.  **Syntax:**
    ```javascript
    const payload = FormPopulator.getValues(
      document.getElementById('target-container'),
      ['field1', 'field2', 'checkboxGroup'] // Must be an Array of strings
    );
    ```
2.  **Return Data Types (Crucial):**
    * **Single Checkbox:** Returns `String` (value). 
    * **Multiple Checkboxes:** Returns `Array` of strings.
    * **Empty/Unchecked:** Key is **omitted** from object.

---

## 3.FormPopulator Integration Checklist (Mental Sandbox)

Before generating code, verify:

1.  **Container Scope:** Does the selector target the *parent* wrapper (good) or the input itself (bad)? `FormPopulator` needs the container.
2.  **Plugin Timing:** Are we calling `populate()` inside a `DOMContentLoaded` event or after the modal opens?
3.  **Data Keys:** Do the JSON keys match the HTML `name` attributes? (Case-sensitive).

---

## 4. FormPopulator Troubleshooting & Edge Cases

* **Conflict:** If `id="status"` and `name="status"` exist on different elements, `name` wins.
* **Backend Arrays:** If `getValues` returns a single string for a checkbox group (because only one was checked), but the backend expects `ids[]`, generate a fixer line:
    ```javascript
    // Fix single-value checkbox edge case for backend
    if (payload.ids && !Array.isArray(payload.ids)) payload.ids = [payload.ids];
    ```
* **AutoNumeric:** `FormPopulator` automatically detects `AutoNumeric` objects attached to DOM elements. No extra config needed.

---
