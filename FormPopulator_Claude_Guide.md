# FormPopulator - Claude Assistant Guide

## What is FormPopulator?

FormPopulator is a vanilla JavaScript utility for populating and extracting values from HTML forms and DOM elements. It maps object keys to element `name` or `id` attributes, handling all form types and enhanced select libraries automatically.

## When to Use FormPopulator

**USE when:**
- Populating 3+ form fields from an API response or data object
- Forms have mixed element types (inputs, selects, checkboxes, radios)
- Using TomSelect, Selectize, Chosen, or AutoNumeric libraries
- Need to populate AND extract values (bidirectional)
- Populating lists (ul/ol) from arrays
- Setting attributes alongside values
- Working with checkbox/radio groups

**DO NOT USE when:**
- Setting 1-2 simple input values (direct assignment is clearer)
- No form elements involved (just DOM manipulation)
- Need complex conditional logic per field
- Working with file inputs (FormPopulator skips them by design)

## Quick Reference

```javascript
// Populate form from data
FormPopulator.populate(container, data, attributes?, sanitizeHtml?);

// Extract values back
FormPopulator.getValuesByKey(container, ['key1', 'key2', ...]);
```

## API Details

### populate(container, data, attributes?, sanitizeHtml?)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `container` | HTMLElement | required | Parent element (form, div, etc.) |
| `data` | Object | required | `{ elementName: value, ... }` |
| `attributes` | Object | `{}` | `{ elementName: { attr: value }, ... }` |
| `sanitizeHtml` | boolean | `true` | `true` = textContent (safe), `false` = innerHTML |

### getValuesByKey(container, keys)

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | HTMLElement | Parent element |
| `keys` | string[] | Array of names/ids to extract |

**Returns:** Object with extracted values. Unchecked checkboxes omitted.

## Element Handling Cheat Sheet

| Element | Populate | Extract |
|---------|----------|---------|
| `input[type=text,email,tel,etc]` | Sets `.value` | Returns `.value` |
| `input[type=checkbox]` (single) | Pass value to check | Returns value if checked, omits if not |
| `input[type=checkbox]` (group) | Pass array of values | Returns array (or single string if one checked) |
| `input[type=radio]` | Pass value to select | Returns checked value or `""` |
| `select` (single) | Pass value | Returns `.value` |
| `select[multiple]` | Pass array | Returns array |
| `textarea` | Sets `.value` | Returns `.value` |
| `ul/ol` | Pass array (supports nesting) | N/A |
| `img/video/audio/iframe` | Sets `.src` | Returns `.src` |
| `a` | Sets `.href` | Returns `.href` |
| `div/span/p/h1-h6` | Sets `.textContent` (or `.innerHTML` if sanitizeHtml=false) | Returns `.textContent` |

## Enhanced Library Support

FormPopulator auto-detects and handles:

- **TomSelect**: Uses `.setValue()`, `.clear()`, `.sync()`
- **Selectize**: Uses `.setValue()`, `.clear()`
- **Chosen**: Uses jQuery `.val().trigger('chosen:updated')`
- **AutoNumeric**: Uses `.set()` for population, `.getNumericString()` for extraction

No configuration needed—just ensure libraries are initialized before calling FormPopulator.

## Code Patterns

### Pattern: Populate form from API response

```javascript
fetch('/api/user/123')
  .then(res => res.json())
  .then(user => {
    FormPopulator.populate(document.getElementById('userForm'), {
      name: user.name,
      email: user.email,
      role: user.role_id,
      notifications: user.notify ? 'yes' : null,
      permissions: user.permissions // array for checkbox group
    });
  });
```

### Pattern: Extract form for API submission

```javascript
const form = document.getElementById('userForm');
const data = FormPopulator.getValuesByKey(form, [
  'name', 'email', 'role', 'notifications', 'permissions'
]);

fetch('/api/user/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Pattern: Clear form / reset specific fields

```javascript
// Clear all specified fields
FormPopulator.populate(form, {
  name: '',
  email: '',
  role: null,           // clears select
  notifications: null,  // unchecks checkbox
  permissions: []       // clears checkbox group
});
```

### Pattern: Populate with attributes

```javascript
FormPopulator.populate(form, 
  { userId: '12345' },
  { 
    userId: { 
      'data-original': '12345',
      'readonly': 'readonly'
    }
  }
);
```

### Pattern: Display content in non-form elements

```javascript
FormPopulator.populate(document.getElementById('profile'), {
  userName: 'John Doe',           // <span id="userName">
  userBio: '<p>Developer</p>',    // <div id="userBio"> (escaped)
  profilePic: '/img/john.jpg',    // <img id="profilePic">
  skills: ['PHP', 'JS', 'MySQL']  // <ul id="skills">
});
```

### Pattern: Raw HTML (careful with XSS)

```javascript
// Only use with trusted/sanitized content
FormPopulator.populate(container, 
  { richContent: '<strong>Bold</strong> text' }, 
  {}, 
  false  // sanitizeHtml = false
);
```

## Important Behaviors

1. **Lookup priority**: `name` attribute checked first, then `id`
2. **Loose equality**: `1` matches `"1"` (checkbox value="1" checked by passing integer 1)
3. **Null/undefined**: Clears inputs, unchecks checkboxes, deselects options
4. **Missing elements**: Logged to console, does not throw
5. **File inputs**: Skipped (browser security prevents setting)
6. **Select clearing**: Always clears before setting (no leftover selections)

## When Direct Assignment is Better

```javascript
// For 1-2 elements, direct is cleaner:
document.getElementById('title').value = data.title;
document.getElementById('status').checked = data.isActive;

// Use FormPopulator when there are many fields or mixed types
```

## Error Handling

```javascript
try {
  FormPopulator.populate(container, data);
} catch (e) {
  // Throws if container is not a DOM element
  // Throws if data is null or not an object
  console.error('Population failed:', e.message);
}
```

## Integration Notes

- Works with any container (form, div, section, etc.)
- Does not submit forms—handles data binding only
- Combine with form validation libraries as needed
- For dynamic forms, call after elements are in DOM
