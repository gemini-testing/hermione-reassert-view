# hermione-reassert-view

Plugin for [hermione](https://github.com/gemini-testing/hermione), which makes less strict comparison of images via resemblejs if there is a diff after `assertView`.
More info about hermione plugins in [hermione](https://github.com/gemini-testing/hermione#plugins).

## Installation

```bash
$ npm install hermione-reassert-view
```

## Configuration

In hermione config:

```js
module.exports = {
    // ...

    plugins: {
        'hermione-reassert-view': {
            enabled: true, // by default
            browsers: ['edge'],
            maxDiffSize: { // max allowable diff size in pixels before ignoring antialiasing
                width: 10, // 15 by default
                height: 10 // 15 by default
            },
            dry: true // debug mode: do not fix assert view results. `false` by default
        }
    },

    // ...
};
```

## Debugging
```bash
$ DEBUG=hermione-reassert-view hermione_reassert_view_dry=true hermione
```
