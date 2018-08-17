const Page = require('./helpers/page');

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a[href="/blogs/new"]');
  });

  test('user can navigate to blog creation form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And submitting empty form inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('the form title shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      expect(titleError).toEqual('You must provide a value');
    });
    test('the form content shows an error message', async () => {
      const contentError = await page.getContentsOf('.content .red-text');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});
