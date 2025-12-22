# FormPopulator

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](package.json)

**Lightweight vanilla JS utility for populating and extracting values from HTML forms and DOM elements. It uses object keys to match elements by name or id attributes, handling all form types and optionally the enhanced select libraries (tomSelect, Selectizer, Chosen) or autoNumeric.org automatically.

## Features

- **One-call population** — Pass a container and data object, done
- **Bidirectional** — `populate()` to fill, `getValuesByKey()` to extract
- **All form elements** — text, email, tel, number, date, checkbox, radio, select, textarea, file (readonly)
- **Enhanced selects** — Optional: TomSelect, Selectize, Chosen auto-detected and handled
- **AutoNumeric** — Optional: Formatted currency/number inputs populated and extracted correctly
- **DOM elements** — span, div, p, h1-h6, ul, ol (including nested lists), img, video, audio, iframe, a
- **Attributes** — Set any attribute (including data-*) alongside values
- **XSS-safe** — HTML sanitized by default (textContent), opt-in for innerHTML
- **Lookup priority** — Finds elements by `name` first, falls back to `id`
- **Loose equality** — Matches `1` to `"1"` (real form behavior)
- **Zero dependencies** — Pure vanilla JavaScript, works everywhere

## Installation

### Manual

Download `dist/form-populator.min.js` and include it:

```html
<script src="path/to/form-populator.min.js"></script>
```

## Quick Start

```html
<form id="userForm">
  <input name="firstName" type="text">
  <input name="email" type="email">
  <input name="newsletter" type="checkbox" value="yes">
  <select name="role">
    <option value="">Select...</option>
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </select>
</form>

<script>
const form = document.getElementById('userForm');

// Populate from API response
FormPopulator.populate(form, {
  firstName: 'John',
  email: 'john@example.com',
  newsletter: 'yes',
  role: 'admin'
});

// Extract values back
const values = FormPopulator.getValuesByKey(form, ['firstName', 'email', 'newsletter', 'role']);
// → { firstName: 'John', email: 'john@example.com', newsletter: 'yes', role: 'admin' }
</script>
```

## API Reference

### `FormPopulator.populate(container, data, attributes?, sanitizeHtml?)`

Populates elements inside `container` with values from `data`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `container` | `HTMLElement` | — | Parent element containing target elements |
| `data` | `Object` | — | Key-value pairs where key matches element `name` or `id` |
| `attributes` | `Object` | `{}` | Optional attributes to set per key |
| `sanitizeHtml` | `boolean` | `true` | Use `textContent` (safe) or `innerHTML` (raw) |

### `FormPopulator.getValuesByKey(container, keys)`

Extracts values from elements inside `container`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `HTMLElement` | Parent element containing target elements |
| `keys` | `string[]` | Array of element names/ids to extract |

**Returns:** `Object` with key-value pairs. Unchecked checkboxes and missing elements are omitted.

## Usage Examples

### Checkboxes

```javascript
// Single checkbox — pass the value to check it
FormPopulator.populate(container, { acceptTerms: 'yes' });

// Checkbox group — pass array of values
FormPopulator.populate(container, { 
  interests: ['sports', 'music', 'tech']
});

// Clear all checkboxes — pass null, undefined, or empty array
FormPopulator.populate(container, { interests: null });
```

### Radio Buttons

```javascript
// Select by value
FormPopulator.populate(container, { paymentMethod: 'credit_card' });

// Numeric values work (loose equality)
FormPopulator.populate(container, { rating: 5 }); // matches value="5"
```

### Select Elements

```javascript
// Single select
FormPopulator.populate(container, { country: 'mx' });

// Multiple select — pass array
FormPopulator.populate(container, { 
  languages: ['en', 'es', 'fr']
});

// Clear select — pass null or empty string
FormPopulator.populate(container, { country: null });
```

### TomSelect / Selectize / Chosen

No extra configuration needed — FormPopulator auto-detects initialized instances:

```javascript
// Works the same as native selects
FormPopulator.populate(container, { 
  tags: ['javascript', 'php', 'mysql']
});
```

### AutoNumeric Inputs

Formatted currency/number inputs are handled automatically:

```javascript
// Set value (AutoNumeric formats it)
FormPopulator.populate(container, { price: 1234.56 });
// Input displays: $1,234.56

// Extract returns raw numeric string
const values = FormPopulator.getValuesByKey(container, ['price']);
// → { price: '1234.56' }
```

### Lists (ul/ol)

```javascript
// Simple list
FormPopulator.populate(container, { 
  ingredients: ['Flour', 'Sugar', 'Eggs']
});

// Nested list
FormPopulator.populate(container, { 
  menu: ['Appetizers', ['Salad', 'Soup'], 'Main Course']
});
```

### Media Elements

```javascript
FormPopulator.populate(container, {
  profileImage: '/images/user.jpg',      // <img> → sets src
  introVideo: '/videos/intro.mp4',       // <video> → sets src
  documentLink: '/docs/manual.pdf'       // <a> → sets href
});
```

### Setting Attributes

```javascript
FormPopulator.populate(container, 
  { userId: '12345' },
  { 
    userId: { 
      'data-validated': 'true',
      'class': 'highlight',
      'disabled': null  // null removes attribute
    }
  }
);
```

### Raw HTML (opt-in)

```javascript
// Default: sanitized (safe)
FormPopulator.populate(container, { message: '<b>Bold</b>' });
// → displays literal "<b>Bold</b>"

// Opt-in: raw HTML
FormPopulator.populate(container, { message: '<b>Bold</b>' }, {}, false);
// → displays Bold
```

## Extraction Examples

```javascript
// Single values
const { email } = FormPopulator.getValuesByKey(form, ['email']);

// Multiple checkbox group returns array
const { permissions } = FormPopulator.getValuesByKey(form, ['permissions']);
// → ['read', 'write'] if multiple checked
// → 'read' if single checked
// → (key omitted if none checked)

// Radio returns checked value or empty string
const { status } = FormPopulator.getValuesByKey(form, ['status']);
// → 'active' or ''

// Multiple select returns array
const { categories } = FormPopulator.getValuesByKey(form, ['categories']);
// → ['cat1', 'cat2']
```

## Element Lookup Priority

FormPopulator finds elements by **name** first, then falls back to **id**:

```html
<!-- Found by name -->
<input name="email" id="emailField">

<!-- Found by id (no name match) -->
<div id="statusMessage">...</div>
```

When both exist with same key, **name wins**:

```html
<div id="userType">Display div</div>
<input type="radio" name="userType" value="admin">
<input type="radio" name="userType" value="user">

<!-- populate({ userType: 'admin' }) → selects radio, ignores div -->
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Uses `CSS.escape()` for safe selectors.

## Module Usage

```javascript
// ES Modules
import FormPopulator from 'form-populator';

// CommonJS
const FormPopulator = require('form-populator');
```

## License

MIT © Raúl José Santos
