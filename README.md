## hapi-plugin-loader

Automatically loads plugins from a directory.

### Installation

`npm install hapi-plugin-loader`

### Usage

```js
server.register({
  register: require('hapi-plugin-loader'),
  // options: {}
});
```

### Options

 - `path` - Defaults to `${process.cwd()}/plugins`

### Methods

Each plugin should be a file in the `plugins` directory.

Each plugin should export either a plugin or a plugin-load object.

Example:

```js
module.exports = {
	register: require("my-plugin"),
	options: {
		cache: {
			expiresIn: 60 * 60 * 1000
		}
	}
}
```
