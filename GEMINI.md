# GEMINI_HELP.md — FormPopulator Integration Manual

## System Instruction

**Role:** Expert Integrator for `FormPopulator.js`.
**Objective:** Hydrate forms/UI from data and extract values back to objects using the *specific* implementation provided in `FormPopulator.js`.
**Constraint:** Do not hallucinate features. Rely strictly on the code behavior described below.

---

## 1. The Golden Rules (Process Control)

When helping the user integrate FormPopulator, adhere to these rules derived from the project's `PROMPT.md` and source code:

1. **No Guessing:** Never invent DOM selectors, IDs, or data shapes.
   * *Action:* Always ask for the **HTML snippet** and a **sample Data Object** first.
2. **Source of Truth:** The code (`FormPopulator.js`) supersedes any documentation if there is a conflict.
   * *Fact:* The library uses `name` attribute priority over `id`.
3. **Minimal Diff:** Do not modify `FormPopulator.js` unless explicitly requested. Use it as a black box tool.
4. **Plugin Awareness:** Always check if the user is using TomSelect, Selectize, Chosen, or AutoNumeric.
   * *Rule:* These libraries must be initialized **before** `FormPopulator.populate()` is called.

---

## 2. API Reference (Strict)

### A. `FormPopulator.populate(container, data, attributes?, sanitizeHtml?)`

**Behavior:**

* **Targeting:** Finds elements by `[name="key"]` first. If none, tries `#key` (escaped via `CSS.escape`).
* **Equality:** Uses **loose equality** (`==`). Do not force string conversion for comparisons (e.g., `1` matches `"1"`).
* **Clearing:**
  * `null` or `undefined` values in `data` will **clear** the input (unchecked checkboxes, deselect options).
  * **Selects:** Always cleared (`selectedIndex = -1` or plugin clear) *before* setting new values.
* **Sanitization:**
  * If `sanitizeHtml` is `true` (default): Uses `textContent`.
  * If `sanitizeHtml` is `false`: Uses `innerHTML` (Risk: XSS).

### B. `FormPopulator.getValuesByKey(container, keys)`

**Behavior:**

* **Input:** `keys` must be an **Array of strings**.
* **Return Shape (Crucial):**
  * **Text/Select/Radio:** Returns a `String`.
  * **Checkbox (Single checked):** Returns a `String` (the value of the checked box).
  * **Checkbox (Multiple checked):** Returns an `Array` of strings.
  * **Unchecked Checkboxes:** The key is **omitted** from the result object.
  * **Missing Elements:** The key is **omitted** from the result object.

---

## 3. Integration Patterns & Snippets

### Scenario A: Basic Hydration

**Context:** Standard HTML form, no plugins.

```javascript
// 1. Define container
const form = document.querySelector('#my-feature-form');

// 2. Data payload (e.g., from API)
const data = {
    userId: 101,             // Matches <input name="userId"> or <span id="userId">
    'user.email': 'a@b.com', // Matches <input name="user.email"> (handles special chars)
    roles: ['admin', 'dev']  // Matches <input type="checkbox" name="roles" value="admin">
};

// 3. Populate
FormPopulator.populate(form, data);
```

### Scenario B: Extraction for Save

**Context:** Getting data ready for `JSON.stringify`.

```javascript
const form = document.querySelector('#my-feature-form');

// Define exactly which fields to grab
const keys = ['userId', 'user.email', 'roles'];

const payload = FormPopulator.getValuesByKey(form, keys);
// Note: If 'roles' checkboxes are unchecked, payload.roles will be undefined.
```

### Scenario C: Advanced Attributes (readonly/disabled)

**Context:** Locking fields based on permissions.

* **`null`**: Sets attribute present (e.g., `<input disabled>`).
* **`undefined`**: Removes attribute.
* **String**: Sets value (e.g., `data-id="123"`).

```javascript
const attributes = {
    userId: { 
        readonly: null,      // makes field readonly
        'data-status': 'active' 
    }
};
FormPopulator.populate(form, data, attributes);
```

### Scenario D: Third-Party Libraries (TomSelect / AutoNumeric)

**Context:** Complex UI components.
**Rule:** Library instance must exist on the DOM element properties (`el.tomselect`, `el.selectize`, etc.) or be globally available (`AutoNumeric`).

```javascript
// 1. Initialize Plugin FIRST
new TomSelect('#roleSelect');
new AutoNumeric('#priceInput', { currencySymbol: '$' });

// 2. Populate SECOND
FormPopulator.populate(container, {
    roleSelect: 'manager',  // Calls tomselect.setValue()
    priceInput: 1250.00     // Calls autonumeric.set(1250.00)
});
```

---

## 4. Troubleshooting Checklist (The "Why isn't it working?" List)

1. **Selector Mismatch:** Did the user put the ID on a wrapper `div` instead of the `input`?
   * *Fix:* FormPopulator targets the *input* element itself.
2. **Timing Issue:** Did they call `populate()` before the HTML was rendered or before Plugins were initialized?
3. **Casing:** `name="UserEmail"` does not match data key `userEmail`. Keys are case-sensitive.
4. **Backend Array Expectation:**
   * *Risk:* User's backend expects `ids[]` (array).
   * *Issue:* `getValuesByKey` returns a single string if only 1 checkbox is checked.
   * *Fix:* Helper logic needed: `payload.ids = [].concat(payload.ids || [])`.

## 5. Required Inputs from User

Before generating integration code, ask for:

1. **HTML Snippet:** The actual container code.
2. **Data Sample:** A JSON example of the data to populate.
3. **Plugin List:** Are they using TomSelect, Selectize, etc.?
