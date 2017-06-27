import { intro, header } from '../pageObjects/app';
import { load } from '../pageObjects/index';

describe('app', () => {
  beforeEach(async () => {
    await load();
  });

  it('should show the right intro', async () => {
    expect(await intro().getText()).toBe(
      'To get started, edit src/App.js and save to reload.'
    );
  });

  it('should show the right header', async () => {
    expect(await header().getText()).toBe('Welcome to React');
  });
});
