# Extended Commands for the `consul` CLI

## Summary

This tool provides some extra features to the `consul` command line tool. Install it globally with `npm install consul-tool` and run it with `consul2`.

This tool exposes the functionality of the [`consul`](https://www.npmjs.com/package/consul) library as a command line tool.

## Commands

### Key/Value

- `export` to export a tree of key/values as JSON.
- `json-export` same as `export`
- `import` to import a tree of key/values from JSON/JSON5.
- `import-json` same as `import`

### Status

- `leader` show the current raft leader
- `peers` show the current raft peers
