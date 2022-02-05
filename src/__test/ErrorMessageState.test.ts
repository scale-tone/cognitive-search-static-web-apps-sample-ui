import { ErrorMessageState } from '../states/ErrorMessageState';

test('does its job', async () => {

    const errMsg = 'Oops...';

    const state = new ErrorMessageState();

    (state as any).ShowError(errMsg);

    expect(state.errorMessage).toBe(errMsg);

    state.HideError();

    expect(state.errorMessage).toBe('');
});
  