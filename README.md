# best

run arbitrarily defined best practice tests

### usage

```javascript
var config = { 'url': 'http://example.net/' };

best(config, function(err, rules) {
  console.log('failing rules', rules.fail);
  console.log('passing rules', rules.pass);
});
```

### cli

First, define a [`.bestrc`](./.bestrc) file in the directory you wish to use, then run `$ best`. If any rules fail, `best` returns a non-zero exit code. This is helpful if you wish to include it as part of a build process.

Alternatively, specify config via command-line parameters, such as `$ best --url http://example.net`:

`best` also has a simple JSON reporter, if you wish to capture the output

`$ best -o`

### configuration

`best` ships with [predefined rules](./rules/README.md), which you may ignore by adding to your config a `rules` object, with the name of the rule marked as ignore, similar to `.eslintrc` configuration:

```javascript
{
  "url": "http://example.net/",
  "rules": {
    "cache": [0]
  }
}
```

You can additionally specify [your own rules](./rules/README.md) by attaching them to the "rules" object.


### debug

`best` uses [`debug`](https://www.npmjs.com/package/debug) heavily to show what's going on under the hood.

```
$ DEBUG="best:*" best
```
