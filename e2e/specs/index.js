import { driver } from '../helpers';
import { load } from '../pageObjects/index';

describe('index', () => {
  it('should show the right title', async () => {
    await load();
    expect(await driver.getTitle()).toBe('React App');
  });
});
