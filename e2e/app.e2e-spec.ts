import { FunctionManagerPage } from './app.po';

describe('function-manager App', () => {
  let page: FunctionManagerPage;

  beforeEach(() => {
    page = new FunctionManagerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
