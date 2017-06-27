This project demonstrates one way to add Selenium e2e tests to a `create-react-app` generated app. It uses Jest as the test runner, embraces modern JavaScript features (including async/await, modules, fat-arrow functions, templated strings, etc.) and attempts to ensure that modern editors are able to provide useful auto-complete suggestions when authoring tests.

# Contents

* [Running Specs](#running-specs)
* [Writing Specs](#writing-specs)
* [Writing Page Objects](#writing-page-objects)
* [Adding to an Existing Project](#adding-to-an-existing-project)

# Disclaimer

This project isn't for everyone. In fact, if you're trying to add your first tests to a `create-react-app`, I'd go as far as to say it's almost definitely not for you. Instead I'd recommend reading over the [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) first for a testing approach that's easier to work with and much faster to run!

However, sometimes I've found Jest's jsdom testing isn't enough and I've needed to run tests in real browsers e.g. when taking performance measurements, testing a full stack, smoke testing the live system, testing functionality in a specific browser, etc.. For those cases, this project presents one possible solution that does not require you to `eject` yet still embraces modern JavaScript features and tooling. Specifically it allows you to share a consistent code style across your `e2e` code and your `src` code by running the same babel transforms and using the same test runner.

# Running Specs

Let's jump straight in to running the example specs, open a new terminal and run the following (you can substitute `npm` for `yarn` if you prefer) -

```bash
$ yarn install
$ yarn run e2e-update
$ yarn run e2e-start
```

Under the covers, the project uses `webdriver-manager` to manage the Selenium server. The first script uses it to download the latest Selenium package and drivers for your browsers. The second starts up a new local Selenium server which you'll need to leave running otherwise the tests won't have a Selenium server to connect to.

We need something to test, so let's open a new terminal and serve up the app -

```bash
$ yarn start
```

This will build the app and open it in a browser as normal. Remember not to close the terminal or you'll see errors about not being able to load page.

Finally let's fire up another new terminal and kick off Jest to run the tests for us -

```bash
$ yarn run e2e
```

You should hopefully see the in progress state of the tests in the terminal and Chrome should open and close a few times as the tests run.

## Automatically running the tests

As well as running the tests once, you can also start Jest in watch mode to automatically run your tests whenever they change by running -

```bash
$ yarn run e2e -- --watch
```

## Running the tests sequentially

You can also pass any other arguments through to Jest in this fashion. For example, by default Jest will attempt to run many test files in parallel to speed things up but if you didn't want that to happen you can force them to run sequentially with -

```bash
$ yarn run e2e -- --runInBand
```

## Using environment specific values

Values can be injected in to the tests by specifying them as globals when running Jest -

```bash
$ yarn run e2e -- --globals "{\"baseUrl\": \"https://example.com\"}
```

You can configure the default values for these globals and other Jest settings in `e2e/jestConfig.json`.

# Writing Specs

The spec files can be found in `e2e/specs`, let's look at `index.js` as an example of how to write a simple spec -

```js
import { driver } from '../helpers';
import { load } from '../pageObjects/index';

describe('index', () => {
  it('should show the right title', async () => {
    await load();
    expect(await driver.getTitle()).toBe('React App');
  });
});
```

Let's run through what's going on line by line -

```js
import { driver } from '../helpers';
```

Here we're using the new ES2016 module syntax to import a function from the `helpers.js` file. The old syntax for this would have looked something like `var driver = require('../helpers').driver`. Not only is the new syntax easier on the fingers and a bit nicer to look at, it also allows editors to be more confident about what you're importing and offer features like smarter auto-complete.

In this project the `helpers.js` file exposes a few basic utilities. The most important is `driver` (an instance of `WebDriver` from the `selenium-webdriver` package) which has all the Selenium methods you'd expect (`findElement`, `get`, etc.). N.B. you don't need to explicitly call `driver.quit()`, this is automatically invoked from an `afterAll` handler in `helpers.js`.

```js
import { load } from '../pageObjects/index';
```

Again here we're using the new module syntax to import the `load` method from `index.js` in the `pageObject` folder.

```js
describe('index', () => {
```

Jest uses a customised implementation of Jasmine. If you've not used Jasmine before it's enough to know that the global `describe` method is used to logically group tests together under a common label (in this case `'index'`). Within each group, the `afterAll`/`beforeAll`/`afterEach`/`beforeEach` global methods can be used to define functions which only apply to the group's tests.

The symbol heavy part of the line `() => {` and the matching `}` a few lines later is the new ES2015 syntax for declaring functions. The old syntax for this would have looked something like `function () {` and `}`.

In this particular case there are no arguments and no return value, so the syntax isn't that much more succinct. However, throw in an argument and the new syntax `a => { }` starts looking a little bit nicer than the old one `function (a) { }`. Additionally throw in a return value `a => { return a; }` and we can eliminate all of the brackets: `a => a`.

Be aware though, that the parentheses are back when you have multiple arguments e.g. `(a, b) => { }`.

```js
it('should show the right title', async () => {
```

Again if you're familiar with Jasmine you'll probably recognise the `it` method. If not, it's job is to associate a label with the specification of the behaviour you're intending to test.

The new ES2017 feature in this line is `async`. Used before a function, it marks the function as running asynchronously. This is useful when a function needs to wait for some external input e.g. from the file system, network or in this case from the browser.

When calling an `async` function, instead of receiving the return value directly, you receive a promise which will `resolve` to the return value. That is just a wordy way of saying that, using the syntax we just learnt, `async a => a` is equivalent to `a => Promise.resolve(a)`. Whilst it's certainly less typing, to see the true value of `async` functions, you'll need to keep reading.

```js
await load();
```

Here we're calling the `load` page object method we previously imported. However, we're making use of `await` to make the function wait until the promise returned by `load` is resolved before continuing. Before we dig into the details let's look at the more complex example on the next line.

```js
expect(await driver.getTitle()).toBe('React App');
```

The `expect` and `toBe` methods are provided by `jasmine` and assert the equality of their respective arguments. The string `'React App'` is *to be expected* (pun intended) but the use of `await driver.getTitle()` might be more unexpected.

Previously, this would have required a far more complex implementation `driver.getTitle().then(title => expect(title).toBe('React App'))`. Even using the new fat arrow syntax it's a lot less readable and that's before any chaining of promises!

```js
  });
});
```

If you've ever been confused in the past about when to use `then`, when you can let `selenium-webdriver`'s promise manager do it's magic or why your `console.log` calls are happening at weird times, you'll be glad to know the behaviour is now much simpler. Any time you invoke an asynchronous method (most calls to the `selenium-webdriver` API and any page object methods which use them), first check to see that the function is marked `async` and then prefix the call with `await`. No more magic.

# Writing Page Objects

The page object files can be found in `e2e/pageObjects`, let's look at `index.js` as an example of how to write a simple spec -

```js
import { until } from 'selenium-webdriver';
import { driver, defaultTimeout } from '../helpers';

const rootSelector = { id: 'root' };

export const root = () => driver.findElement(rootSelector);

export const load = async () => {
  await driver.get(`${__baseUrl__}/`);
  await driver.wait(until.elementLocated(root), defaultTimeout);
};
```

Again let's take things line by line however, as we introduced imports in the last section, let's use the imports here as an excuse to introduce some useful variations on the import syntax -

```js
import { until } from 'selenium-webdriver';
```

Sometimes you'll need to import two different things from two different modules that share the same name. In such a situation you have two options: alias the import or import the module's exports as an object.

If in the line above we wanted to import until with a custom name e.g. `untilSW`, we might previously have used something like `var untilSW = require('selenium-webdriver').until` With the new syntax we can alias the import using `import { until: untilSW } from 'selenium-webdriver'`.

If it looks a little odd, it's actually borrowed from another feature called object destructuring. A fancy way of describing that if we have an variable `a` with the value `{ b: 1, c: 2 }`, the following are equivalent `const B = a.b, C = a.c` and `const { b: B, c: C } = a`. It can take a bit of getting used to, it looked backwards to me when I first saw it, but once you're used to it it be used to produce more expressive code.

N.B. Whilst this particular feature is borrowed from object destructuring, it is not *using* object destructuring i.e. not every feature from one will work with the other.

```js
import { driver, defaultTimeout } from '../helpers';
```

Let's use this line to demonstrate importing a module's exports as an object: `import * as helpers from '../helpers'`. This is very similar, although as I'll explain subtly different, to the old syntax of `var helpers = require('../helpers')`. It allows us to avoid potential naming conflicts by accessing the exports at `helpers.driver` and `helpers.defaultTimeout` respectively.

The subtle difference that we skipped over relates to the concept of `default` exports. A module can choose to export one thing as its `default` as well as any number of named exports which is the syntax we've introduced so far.

Exporting defaults is easy. As an example, let's convert `export const foo = 'bar'` to be a default export instead: `export default 'bar'`. It's equally easy to import the default `import foo from 'module'` and you can also mix default and named exports using `import someDefaultExport, { someNamedExport } from 'module'`.

That's enough module syntax, on to the real code!

```js
const rootSelector = { css: '#root' };
```

First up, we declare a css-based element selector using the `selenium-webdriver` object shorthand. You may be more familiar with declaring variables using `var` rather than `let` or `const` which were introduced in ES2015. Whilst similar to `var` they are subtly different, they both prevent unexpected errors by restricting their definition to the enclosing block (`{}`) e.g. `if (true) { let b = 0; } b = 1 /* throws an error */`.

The difference between `let` and `const` is more stark. A variable declared using `let` can be assigned to many times e.g. `let a = 1; a = 2;`. Whereas a variable declared using `const` can only be assigned to when declaring it e.g. `const a = 1; a = 2 /* throws an error */`. I would personally always recommend using `const` unless you explicitly need to reassign the variable. This makes it easier for the next person (probably yourself!) to read and reason about the functionality of your code.

```js
export const root = () => driver.findElement(rootSelector);
```

This line exports a `root` function which makes use of the `driver.findElement` asynchronous function together with the css-based element selector declared above to return a promise that resolves to an element reference. Previously exports in Node.js used either `exports.root = ` or `module.exports.root = ` but again the new syntax is clearer and makes it easier for tools to know what your intention is.

You might be wondering why when I introduced `async`/`await` in the last section and I suggested you should use it for all asynchronous function calls but I haven't here. The reason is that I could use it here but it would produce the same result i.e. `async () => await driver.findElement(rootSelector)` is equivalent to `() => driver.findElement(rootSelector)`. The verbose version creates a promise and waits for the `driver.findElement` promise to resolve, it then uses the resolved value to resolve the promise it created. All in all, more typing and more work for the JavaScript engine for no real benefit.

```js
export const load = async () => {
```

Here we define another exported function `load` but this time we're back to using await as we need to wait for one asynchronous function to complete and then wait for another to complete.

```js
await driver.get(`${__baseUrl__}/`);
```

The first asynchronous function `driver.get` tells Selenium to loads a URL in the browser. The URL includes a global defined by Jest, see [using environment specific values](#using-environment-specific-values) for where this value comes from.

The specification of the URL ``${__baseUrl__}/`` is using an ES2015 feature called template strings. Previously you might have written this as a concatenation of two strings `__baseUrl + '/'`. In this case there's very little difference in key strokes or clarity but with strings featuring more variables the new syntax is much nicer e.g. ``Date: ${a}-${b}-${c}``.

```js
await driver.wait(until.elementLocated(root), defaultTimeout);
```

The second asynchronous function `driver.wait` tells Selenium to wait until an element is found in the browser's DOM. It makes use of a utility `until` from `selenium-webdriver` which checks returns a boolean indicating the presence of an element and `defaultTimeout` which is provider by `helpers` to allow timeouts to be scaled for debugging.

```js
};
```

Embracing both `async`/`await` and modules really helps simplify page objects and improve their legibility. It is a much more productive and far less frustrating experience when having written tests or any code, the next person who comes along with no knowledge of the project, can easily understand and work with the code without assistance.

And as we all know, that next person is probably you in a months time!

# Adding to an Existing Project

To convert an existing `create-react-app` generated project to use these features -

* Copy the `e2e` folder into the root of the project
```bash
$ cp -r react-app-webdriver/e2e <react-app>
```
* Install the additional dev dependencies -
```bash
$ yarn add --dev @types/jest jest selenium-webdriver webdriver-manager
```
* Add the following to the `scripts` section in the project's `package.json` -
```js
{
  // ...
  "scripts: {
    // ...
    "e2e": "jest -c e2e/jestConfig.json",
    "e2e-update": "webdriver-manager update --out_dir ../../e2e/selenium",
    "e2e-start": "webdriver-manager start --out_dir ../../e2e/selenium"
  }
}
```