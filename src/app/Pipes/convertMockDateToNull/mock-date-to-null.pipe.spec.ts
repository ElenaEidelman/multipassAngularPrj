import { MockCodeToNullPipe } from './mock-date-to-null.pipe';

describe('MockCodeToNullPipe', () => {
  it('create an instance', () => {
    const pipe = new MockCodeToNullPipe();
    expect(pipe).toBeTruthy();
  });
});
