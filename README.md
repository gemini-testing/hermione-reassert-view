# hermione-reassert-view

Plugin for [hermione](https://github.com/gemini-testing/hermione), which makes less strict comparison of images via resemblejs if there is a diff after `assertView`.
More info about hermione plugins in [hermione](https://github.com/gemini-testing/hermione#plugins).

## Installation

```bash
$ npm install hermione-reassert-view --registry=http://npm.yandex-team.ru
```

## Configuration

In hermione config:

```js
module.exports = {
    // ...

    plugins: {
        'hermione-reassert-view': {
            enabled: true, // by default
            browsers: ['edge']
        }
    },

    // ...
};
```
