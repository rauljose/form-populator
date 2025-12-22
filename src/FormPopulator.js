// noinspection JSUnusedGlobalSymbols,EqualityComparisonWithCoercionJS

/**
 * FormPopulator.js Set/get values by name or id inside an html container
 *
 * @version 1.2.1
 * @description Stateless utility for populating and extracting values from HTML elements based on name (primary) or id (fallback).
 *
 * Supports TomSelect, Selectize, and Chosen.
 * check it is
 */

const FormPopulator = {

    /**
     *  Writes data values or innerHtml into matching elements, by name then by id, inside container, optionally setting attributes
     *
     * @param {HTMLElement} container
     * @param {object} data
     * @param {object} attributes
     * @param {boolean} sanitizeHtml sets content with true: textContent, false: innerHTML
     *
     * @throws {Error} If container is not a valid DOM element
     * @throws {Error} If data is null or not an object
     */
    populate(container, data = {}, attributes = {}, sanitizeHtml = true) {
        if(!container || !container.nodeType) {
            throw new Error('Container must be a valid DOM element');
        }

        if(typeof data !== 'object' || data === null) {
            throw new Error('Data must be a non-null object');
        }

        for(let key in data) {
            if(data.hasOwnProperty(key)) {
                try {
                    const elements = this._findElementsByNameOrId(container, key);
                    if(elements.length === 0) {
                        console.log(`FormPopulator: No elements found for key '${key}' (tried name and id)`);
                        continue;
                    }

                    const value = data[key];
                    const hasAttributes = attributes.hasOwnProperty(key);

                    if(elements.length > 1 || (elements[0] && (elements[0].type === 'radio' || elements[0].type === 'checkbox'))) {
                        const isRadio = elements[0].type === 'radio';
                        const isCheckbox = elements[0].type === 'checkbox';

                        if(isRadio) {
                            const valueToCheck = String(value);
                            elements.forEach(el => {
                                el.checked = el.value == valueToCheck;
                                if(hasAttributes) this._setElementAttributes(el, attributes[key]);
                            });
                        } else if(isCheckbox) {
                            // Clean, fast, real: treat single value as [value], array as-is
                            // null/undefined → [null]/[undefined] → no match → clears all checkboxes (correct!)
                            // empty array → clears all
                            // No String() coercion, no interference — trust the developer
                            // Uses loose == for comparison (intentional: matches real form behavior, e.g. 1 == "1")
                            const valuesToCheck = Array.isArray(value) ? value : [value];

                            elements.forEach(el => {
                                el.checked = valuesToCheck.includes(el.value);
                                if(hasAttributes) this._setElementAttributes(el, attributes[key]);
                            });
                        }
                    } else {
                        const element = elements[0];
                        this._populateElement(element, value, sanitizeHtml);
                        if(hasAttributes) {
                            this._setElementAttributes(element, attributes[key]);
                        }
                    }
                } catch(error) {
                    console.error(`FormPopulator: Error populating '${key}':`, error);
                }
            }
        }
    },

    /**
     * Reads values from elements matching keys, by name then by id, inside container
     *
     * @param {HTMLElement} container
     * @param {array} keys
     * @returns {{}} keyed by key in keys with the value or content, an array if muliple name
     *
     * @throws {Error} If container is not a valid DOM element
     * @throws {Error} If data is null or not an object
     */
    getValuesByKey(container, keys = []) {

        if(!container || !container.nodeType) {
            throw new Error('Container must be a valid DOM element');
        }
        if(!Array.isArray(keys)) {
            throw new Error('Keys must be an array');
        }

        const values = {};

        for(const key of keys) {
            if(typeof key !== 'string') {
                console.warn(`FormPopulator: Invalid key type '${typeof key}', skipping`, key);
                continue;
            }

            try {
                const elements = this._findElementsByNameOrId(container, key);
                if(elements.length === 0) {
                    continue;
                }

                let value;

                // Special case: radio buttons — only one can be checked
                if(elements[0].type === 'radio') {
                    const checked = elements.find(el => el.checked);
                    values[key] = checked ? checked.value : "";
                }
                // Special case: checkboxes (single or group)
                else if(elements[0].type === 'checkbox') {
                    const checkedEls = elements.filter(el => el.checked);
                    const checkedValues = checkedEls.map(el => el.value);

                    if(checkedValues.length === 1) {
                        // Single checkbox checked → return string, not array
                        values[key] = checkedValues[0];
                    } else if(checkedValues.length > 1) {
                        // Multiple checked → return array
                        values[key] = checkedValues;
                    }
                }
                // All other cases: single value OR multiple inputs with same name
                else {
                    if(elements.length === 1) {
                        values[key] = this._extractElementValue(elements[0]);
                    } else {
                        // Multiple inputs with same name (e.g. multiple tel, email, text)
                        values[key] = elements.map(el => this._extractElementValue(el));
                    }
                }
            } catch(error) {
                console.error(`FormPopulator: Error extracting value for '${key}':`, error);
            }
        }

        return values;
    },

    /**
     * Returns array of elements matching name first, falls back to id.
     *
     * @param {HTMLElement} container
     * @param {string} key name or id to find
     * @returns {unknown[]|*[]}
     * @private
     */
    _findElementsByNameOrId(container, key) {
        let elements = container.querySelectorAll(`[name="${CSS.escape(key)}"]`);
        if(elements.length > 0) {
            return Array.from(elements);
        }
        const byId = container.querySelector(`#${CSS.escape(key)}`);
        return byId ? [byId] : [];
    },

    /**
     * Routes value to correct setter based on tag (input, select, textarea, media, content).
     *
     * @param element
     * @param value
     * @param {boolean} sanitizeHtml sets content with true: textContent, false: innerHTML
     * @private
     */
    _populateElement(element, value, sanitizeHtml = true) {
        if(value === null || value === undefined) {
            value = "";
        }

        const tagName = element.tagName.toLowerCase();
        switch(tagName) {
            case 'input':
                if(element.type === 'checkbox' || element.type === 'radio') {
                    break;
                }
                if(element.type === 'file') {
                    break;
                }
                // AutoNumeric support — detect instance and use API
                if (typeof AutoNumeric !== 'undefined') {
                    const an = AutoNumeric.getAutoNumericElement(element);
                    if (an) {
                        // AutoNumeric expects number, string, or null
                        // It handles formatting, validation, and clearing internally
                        if (value === null || value === undefined) {
                            an.set(""); // proper clear
                        } else {
                            an.set(value); // let AutoNumeric parse and format
                        }
                        break;
                    }
                }
                element.value = value;
                break;
            case 'textarea':
                element.value = String(value);
                break;
            case 'select':
                this._populateSelect(element, value);
                break;
            case 'img':
            case 'video':
            case 'audio':
            case 'iframe':
                element.src = String(value);
                break;
            case 'a':
                element.href = String(value);
                break;
            case 'ul':
            case 'ol':
                this._populateList(element, value);
                break;
            default:
                if(sanitizeHtml) {
                    element.textContent = String(value);
                } else {
                    element.innerHTML = String(value);
                }
        }
    },

    /**
     * Clears then sets select value, detecting TomSelect/Selectize/Chosen automatically.
     *
     * @param element
     * @param value
     * @private
     */
    _populateSelect(element, value) {
        // Always clear first — consistent across all implementations
        this._clearSelect(element);

        // Handle null/undefined/empty → fully cleared, done
        if(value == null || (Array.isArray(value) && value.length === 0) || value === '') {
            return;
        }

        // TomSelect support
        if(element.tomselect) {
            const values = Array.isArray(value) ? value : [value];
            element.tomselect.setValue(values, true); // silent
            element.tomselect.sync();
            return;
        }

        // Selectize support
        if(element.selectize) {
            const values = Array.isArray(value) ? value : [value];
            element.selectize.setValue(values, true); // silent
            return;
        }

        // Chosen support — only if jQuery exists
        if(typeof window.jQuery !== 'undefined') {
            const $ = window.jQuery;
            const $el = $(element);
            if($el.data('chosen')) {
                const val = Array.isArray(value) ? value : [value];
                $el.val(val).trigger('chosen:updated');
                return;
            }
        }

        // Native <select>
        if(Array.isArray(value)) {
            // Multiple select: select all matching options
            for(const option of element.options) {
                const optValue = option.value; // keep as-is (string)
                option.selected = value.some(v => v == optValue); // loose == for real-world match
            }
        } else {
            // Single select: find exact match (loose ==)
            for(const option of element.options) {
                if(value == option.value) { // no String() coercion!
                    option.selected = true;
                    return;
                }
            }
            // If no match found → stays cleared (intentional: better than jumping to first option)
            // Optional: console.warn(`FormPopulator: No matching option for value '${value}' in select '${element.name || element.id}'`);
        }
    },

    /**
     * Deselects all options, using library API if enhanced select detected: omSelect, Selectize & Chosen
     *
     * @param element
     * @private
     */
    _clearSelect(element) {
        // TomSelect
        if(element.tomselect) {
            element.tomselect.clear(true); // silent
            element.tomselect.sync();
            return;
        }

        // Selectize
        if(element.selectize) {
            element.selectize.clear(true); // silent
            return;
        }

        // Chosen
        if(typeof window.jQuery !== 'undefined') {
            const $ = window.jQuery;
            const $el = $(element);
            if($el.data('chosen')) {
                $el.val(null).trigger('chosen:updated');
                return;
            }
        }

        // Native
        element.selectedIndex = -1;
    },

    /**
     * Renders array as <li> items, supporting nested arrays for sublists.
     *
     * @param element
     * @param value
     * @private
     */
    _populateList(element, value) {
        if(!Array.isArray(value)) {
            element.innerHTML = this._escapeHtml(String(value));
            return;
        }

        const tagName = element.tagName.toLowerCase();
        element.innerHTML = value.map(item => {
            if(Array.isArray(item)) {
                const subItems = this._buildNestedListHtml(item, tagName);
                return `<li><${tagName}>${subItems}</${tagName}></li>`;
            } else {
                return `<li>${this._escapeHtml(String(item))}</li>`;
            }
        }).join('');
    },

    /**
     * Recursively builds HTML string for nested list structures.
     *
     * @param array
     * @param tagName
     * @returns {*}
     * @private
     */
    _buildNestedListHtml(array, tagName) {
        return array.map(item => {
            if(Array.isArray(item)) {
                const subItems = this._buildNestedListHtml(item, tagName);
                return `<li><${tagName}>${subItems}</${tagName}></li>`;
            } else {
                return `<li>${this._escapeHtml(String(item))}</li>`;
            }
        }).join('');
    },

    /**
     * Routes to correct getter based on tag and returns the value.
     *
     * @param element
     * @returns {string|*|string|string[]}
     * @private
     */
    _extractElementValue(element) {
        const tagName = element.tagName.toLowerCase();
        switch(tagName) {
            case 'input':
                return this._extractInputValue(element);
            case 'textarea':
                return element.value;
            case 'select':
                return this._extractSelectValue(element);
            case 'img':
            case 'video':
            case 'audio':
            case 'iframe':
                return element.src || "";
            case 'a':
                return element.href || "";
            default:
                return element.textContent || element.innerHTML;
        }
    },

    /**
     * Returns input value, handling checkbox/radio checked state and AutoNumeric.
     *
     * @param element
     * @returns {string|*|string}
     * @private
     */
    _extractInputValue(element) {
        const type = element.type.toLowerCase();
        switch(type) {
            case 'checkbox':
            case 'radio':
                return element.checked ? element.value : "";
            default:
                // AutoNumeric: return clean numeric string (or "" if empty)
                if (typeof AutoNumeric !== 'undefined') {
                    const an = AutoNumeric.getAutoNumericElement(element);
                    if (an) {
                        const raw = an.getNumericString();
                        return raw === null ? "" : raw;
                    }
                }
                return element.value || "";
        }
    },

    /**
     * Returns selected value(s)—string for single, array for multiple.
     *
     * @param element
     * @returns {*|string[]}
     * @private
     */
    _extractSelectValue(element) {
        if(element.multiple) {
            return Array.from(element.selectedOptions).map(option => option.value);
        } else {
            return element.value;
        }
    },

    /**
     * Sets/removes attributes on element, handles data-* via dataset.
     *
     * @param element
     * @param attributes
     * @private
     */
    _setElementAttributes(element, attributes) {
        for(let attrName in attributes) {
            if(attributes.hasOwnProperty(attrName)) {
                const attrValue = attributes[attrName];
                if(attrName.toLowerCase().startsWith("data-")) {
                    element.dataset[this._toDatasetKey(attrName)] = attrValue;
                }
                if(attrValue === null || attrValue === undefined) {
                    element.removeAttribute(attrName);
                } else {
                    element.setAttribute(attrName, String(attrValue));
                }
            }
        }
    },

    /**
     * Converts data-foo-bar to camelCase fooBar for dataset access.
     *
     * @param {string} dataName
     * @returns {string}
     * @private
     */
    _toDatasetKey(dataName) {
        let key = dataName.toLowerCase();
        if(key.startsWith("data-")) {
            key = key.slice(5);
        }
        key = key.replace(/-([a-z0-9])/g, (_, chr) => chr.toUpperCase());
        return key.replace(/[^a-zA-Z0-9_$]/g, "");
    },

    /**
     * Returns all attributes as object
     *
     * @param element
     * @returns {{}}
     * @private
     */
    _getElementAttributes(element) {
        const attrs = {};
        for(const attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    },

    /**
     * Escapes HTML
     *
     * @param {string} text
     * @returns {string}
     * @private
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for modules
if(typeof module !== 'undefined' && module.exports) {
    module.exports = FormPopulator;
}
