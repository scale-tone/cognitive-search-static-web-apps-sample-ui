import axios from 'axios';
import { LoginState } from '../states/LoginState';

test('initializes auth', async () => {

    // arrange

    (axios as any).get = (url: string) => {

        expect(url).toBe('/.auth/me');      

        return Promise.resolve({
            data: {
                clientPrincipal: {
                    userDetails: 'tino'
                }
            }
        });
    }

    // act

    const state = new LoginState();

    await new Promise(resolve => setTimeout(resolve, 10));

    // assert

    expect(state.userName).toBe('tino');
});
  