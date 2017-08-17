import { HasFunctionAccessPipe } from './has-function-access.pipe';

describe('HasFunctionAccessPipe', () => {
  it('create an instance', () => {
    const pipe = new HasFunctionAccessPipe();
    expect(pipe).toBeTruthy();
  });
});
