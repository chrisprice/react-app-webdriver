import { driver } from './helpers';

// Tear down chrome Driver when tests
// are concluded.

afterAll((done) => {
  driver.quit().then(() => done());
});

// set defaults

process.env.USE_PROMISE_MANAGER = false;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60e3;
