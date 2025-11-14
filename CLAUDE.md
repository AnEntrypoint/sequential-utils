# tasker-utils

**Common utilities for the tasker ecosystem providing standardized timestamp and error handling.**

## Architecture

```
src/
├── index.js        # Main entry point (re-exports all utilities)
├── timestamps.js   # ISO 8601 timestamp utilities
└── errors.js       # Error serialization and normalization
```

## Module Exports

### Main Entry (`src/index.js`)
Re-exports all utilities from timestamps and errors modules.

### Timestamps (`src/timestamps.js`)

**Purpose**: Consistent ISO 8601 timestamp generation and parsing for data models.

| Function | Returns | Description |
|----------|---------|-------------|
| `nowISO()` | `string` | Current timestamp as ISO 8601 string |
| `createTimestamps()` | `{createdAt, updatedAt}` | Both timestamps set to current time |
| `updateTimestamp()` | `{updatedAt}` | Single updatedAt timestamp |
| `parseISO(isoString)` | `Date \| null` | Parse ISO string to Date (returns null on error) |

**Usage Pattern**:
```javascript
// Creating new records
const record = { ...data, ...createTimestamps() };

// Updating records
const updated = { ...record, ...updateTimestamp() };

// Parsing timestamps
const date = parseISO(record.createdAt);
```

### Errors (`src/errors.js`)

**Purpose**: Serialize errors for storage/transmission across process boundaries (JSON-safe).

| Export | Type | Description |
|--------|------|-------------|
| `SerializedError` | `class` | Serializable error container with `message`, `name`, `stack`, `code` |
| `serializeError(error)` | `function` | Convert Error to SerializedError (idempotent) |
| `normalizeError(error)` | `function` | Normalize any error-like value to SerializedError |

**Key Methods**:
- `toJSON()` - Returns plain object for JSON serialization
- `toString()` - Returns formatted error string: `"{name}: {message}"`

**Usage Pattern**:
```javascript
// Serialize errors for storage
const serialized = serializeError(new Error('Failed'));

// Normalize unknown error values
const normalized = normalizeError(maybeError); // handles null, strings, objects, Error instances

// Check if already serialized (idempotent)
const safe = serializeError(serialized); // returns same instance
```

## Package Configuration

- **Type**: ES Module (`"type": "module"`)
- **Main**: `src/index.js`
- **Exports**:
  - `.` → `src/index.js` (all utilities)
  - `./timestamps` → `src/timestamps.js` (timestamps only)
  - `./errors` → `src/errors.js` (errors only)

## Design Decisions

1. **ISO 8601 Format**: All timestamps use ISO 8601 for universal compatibility and timezone awareness
2. **Null Safety**: `parseISO()` returns `null` on invalid input rather than throwing
3. **Idempotent Serialization**: `serializeError()` checks if error is already SerializedError to avoid double-wrapping
4. **Code Preservation**: `SerializedError` preserves error `code` field (useful for errno, HTTP codes, etc.)
5. **ES Modules**: Pure ESM for modern Node.js/bundler compatibility
6. **Zero Dependencies**: No external dependencies for minimal footprint

## Error Handling Patterns

The error utilities handle edge cases gracefully:
- `normalizeError(null)` → `null`
- `normalizeError(undefined)` → `null`
- `normalizeError("string")` → `SerializedError` with message="string"
- `normalizeError({message: "x"})` → `SerializedError` from object
- `normalizeError(Error)` → `SerializedError` with stack trace

## Import Examples

```javascript
// Import everything
import { nowISO, createTimestamps, SerializedError } from 'tasker-utils';

// Import specific module
import { parseISO } from 'tasker-utils/timestamps';
import { normalizeError } from 'tasker-utils/errors';

// Default imports (each module provides default object)
import timestamps from 'tasker-utils/timestamps';
import errors from 'tasker-utils/errors';
```

## Common Integration Patterns

**Database Models**:
```javascript
import { createTimestamps, updateTimestamp } from 'tasker-utils';

const user = { id: 1, name: 'Alice', ...createTimestamps() };
// { id: 1, name: 'Alice', createdAt: '2025-11-14T...', updatedAt: '2025-11-14T...' }

user = { ...user, name: 'Alice Smith', ...updateTimestamp() };
// updatedAt gets new timestamp, createdAt unchanged
```

**Error Logging/Storage**:
```javascript
import { serializeError } from 'tasker-utils';

try {
  await riskyOperation();
} catch (error) {
  const errorRecord = {
    error: serializeError(error).toJSON(),
    timestamp: nowISO()
  };
  await db.save(errorRecord); // Safe to JSON.stringify
}
```

## Testing Considerations

- `nowISO()` uses `new Date()` internally - mock `Date` for deterministic tests
- `parseISO()` catches all exceptions and returns `null` - no need to wrap in try/catch
- `SerializedError.stack` preserves original stack traces for debugging
