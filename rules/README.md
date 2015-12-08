# rules

Each `best` rule is implemented as `function name(config, cb) {}` where `config` is a copy of the `.bestrc` configuration (or the configuration invoked against best), e.g.

```json
{
  "url": "http://example.net/",
}
```

This error-first style callback must be invoked either with an `error`, or an `object` with a `pass` boolean, and an optional `errors` array of strings. The `error` is reserved for passing _exceptional_ errors, like a failure to connect to a server, not a rule-failure.

For example:

```js
module.exports = function always_fails(config, cb) {
  return cb(null, { pass: false, errors: ['This rule always fails'] });
}
```

&nbsp;

The rules which are supplied are as follows:

### cache

This test determines if the site utilizes some sort of cache-breaking URL mechanism to prevent browsers from using out-dated front-end assets between releases. (See [Invalidating and updating cached responses](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching#invalidating-and-updating-cached-responses) for more info).

A typical way to include a CSS file does not allow browsers to understand when the file has changed:

```html
<link rel="stylesheet" type="text/css" href="/css/main.css">
```

This test checks JavaScript and CSS file references for either a alphanumeric code or some sort of version specified as a query string parameter. For example, both of these assets utilize a cache-breaking mechanism:

```html
<link rel="stylesheet" type="text/css" href="/css/main-93ab91.css">
<script src="/js/main.js?v=1.1.0" />
```

If less than half of all locally-defined (not external-domain) assets, this rule fails.

### favicon

Sites should use [favicons](https://en.wikipedia.org/wiki/Favicon#How_to_use). Sites may specify a favicon through a `<link>` tag:


```html
<link rel="icon" href="/img/icon.png" />
```

If not specified we attempt to fetch the `favicon.ico` file at the site's root.

If we are not able to fetch a favicon, this rule fails.

### gzip

Sites should use compression. This rule tests if all JavaScript and CSS assets are transfered with `gzip` compression. See [Text Compression With GZIP](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/optimize-encoding-and-transfer#text-compression-with-gzip) for more info.

### https

Sites should use https for all traffic, (especially with the advent of [Let's Encrypt](https://letsencrypt.org/)). This rule attempts to fetch the given URL (even if specified as `http://...`), with HTTPS.

If the site has an invalid certificate, this rule fails.

### resources

Where possible, sites should concatenate and minify JavaScript and CSS files. See [Optimizing content efficiency
](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/) and [Eliminating unnecessary downloads
](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/eliminate-downloads?hl=en) for more info.

If the site has more than 10 separate JavaScript and CSS resources, this rule will fail.

### media_queries

This rule looks to see if the site utilizes media queries to style aspects of the document. First, CSS files specified in `<link>` tags are processed, then, it is run through an analyzer to detect the use of non-print media queries. If the site uses more than 60 media queries (approximately the number supplied by Bootstrap, this rule succeeds. (This rule definition needs refinement).

### meta

This rule searches for the presence of standard `meta` tags, such as `description`, `keywords`, and a few of [Facebook's Open Graph tags](https://developers.facebook.com/docs/sharing/best-practices#tags). If any of these tags are missing, the fule fails.
