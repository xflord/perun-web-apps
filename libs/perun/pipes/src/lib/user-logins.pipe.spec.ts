import { UserLoginsPipe } from './user-logins.pipe';

describe('UserLoginsPipe', () => {
  it('create an instance', () => {
    const pipe = new UserLoginsPipe();
    expect(pipe).toBeTruthy();
  });
});
