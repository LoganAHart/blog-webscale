const Page = require('./helpers/page');

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When user is logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a[href="/blogs/new"]');
  });

  test('user can navigate to blog creation form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And submitting valid form inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('.entry-confirmation');
      const submitBtn = await page.getContentsOf('button.save-blog');
      expect(text).toEqual('Please confirm your entries');
      expect(submitBtn).toMatch(/Save Blog/ig);
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.save-blog');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-content .card-title');
      const content = await page.getContentsOf('.card-content p');
      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('And submitting invalid form inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form title shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .error');
      expect(titleError).toEqual('You must provide a value');
    });

    test('the form content shows an error message', async () => {
      const contentError = await page.getContentsOf('.content .error');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('When user is not logged in', async () => {
  test('User cannot create blog posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'My Title',
          content: 'My Content'
        })
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('User cannot GET a list of posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });
});
