import { AngularWorldwindPage } from './app.po';

describe('angular-worldwind App', function() {
  let page: AngularWorldwindPage;

  beforeEach(() => {
    page = new AngularWorldwindPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
