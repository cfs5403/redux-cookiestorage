redux-cookiestorage
==================

The same library by [Elger Lambert](https://github.com/elgerlambert/redux-localstorage), but for cookie instead of localStorage.

Store enhancer that syncs (a subset) of your Redux store state to [cookie](https://github.com/reactivestack/cookies/tree/master/packages/universal-cookie).

## Installation
```js
npm install --save redux-cookiestorage
```

## Usage
```js
import {compose, createStore} from 'redux';
import persistState from 'redux-cookiestorage'

const enhancer = compose(
  /* [middlewares] */,
  persistState(/*paths, config*/),
)

const store = createStore(/*reducer, [initialState]*/, enhancer)
```

### persistState(paths, config)
#### paths
```js
type paths = Void | String | Array<String>
```

Example
```js
import {compose, createStore} from 'redux';
import persistState from 'redux-cookiestorage'

const enhancer = compose(
  /* [middlewares] */,
  persistState('auth' /*, config*/), //this only will persist auth state into cookie. Config is optional but required to control the cookie expiration.
)

const store = createStore(/*reducer, [initialState]*/, enhancer)
```

If left `Void`, persistState will sync Redux's complete store state with cookie. Alternatively you may specify which part(s) of your state should be persisted.

**Note:** Currently no support for nested paths. Only "top-level" paths are supported, i.e. state[path]. If your needs are more complex and you require more control over
which parts of your store's state should be persisted you can define your own strategy through [config.slicer](#configslicer)

#### config
```js
import {compose, createStore} from 'redux';
import persistState from 'redux-cookiestorage'

const enhancer = compose(
  /* [middlewares] */,
  persistState(/*paths*/, {
    key: /*key*/,
    slicer: /*slicer*/,
    cookieOptions: /*cookieOptions*/,
    merge: /*merge*/
  }),
)

const store = createStore(/*reducer, [initialState]*/, enhancer)
```

##### config.key
```js
type config.key = String
```
The cookie key used to store state. The default value is `redux`.

##### config.slicer
```js
type config.slicer = (paths: Any) => (state: Collection) => subset: Collection
```
Config.slicer allows you to define your own function which will be used to determine which parts should be synced with cookie. It should look something like this:
```js
function myCustomSlicer (paths) {
  return (state) => {
    let subset = {}
    /*Custom logic goes here*/
    return subset
  }
}
```
It is called with the paths argument supplied to persistState. It should return a function that will be called with the store's state, which should return a subset that matches the original shape/structure of the store - it's this subset that'll be persisted.

If, for example, you want to dynamically persist parts of your store state based on a user's preference, defining your own `slicer` allows you to do that. Simply add something along the following lines to your customSlicer function:

```js
paths.forEach((path) => {
  if (state[path].persistToCookieStorage)
    subset[path] = state[path]
}
```

##### config.cookieOptions
```js
type config.cookieOptions = Object
```
- options (object): Support all the cookie options from RFC 6265
  - path (string): cookie path, use `/` as the path if you want your cookie to be accessible on all pages
  - expires (Date): absolute expiration date for the cookie
  - maxAge (number): relative max age of the cookie from when the client receives it in second
  - domain (string): domain for the cookie (sub.domain.com or .allsubdomains.com)
  - secure (boolean): Is only accessible through HTTPS?
  - httpOnly (boolean): Is only the server can access the cookie?

Example
```js
import {compose, createStore} from 'redux';
import persistState from 'redux-cookiestorage'

const enhancer = compose(
  /* [middlewares] */,
  persistState(/*paths*/, {
    cookieOptions: {
            path: '/',
            maxAge: (7*24*60*60) //7 days expired
        }
  }),
)

const store = createStore(/*reducer, [initialState]*/, enhancer)
	
```

##### config.merge
```js
type config.merge = (initialState: Collection, persistedState: Collection) => finalInitialState: Collection
```
During initialization any persisted state is merged with the initialState passed in as an argument to `createStore`.
The default strategy `extends` the initialState with the persistedState. Override this function if that doesn't work for you. **Note:** this is only required if you want to merge values within an immutable collection. If your values are immutable, but the object that holds them is not, the default strategy should work just fine.
