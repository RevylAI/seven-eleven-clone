import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? '')
          .trim()
          .toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new Error('Enter a valid email address.');
        const name = String(params.name ?? '').trim();
        if (params.flow === 'signUp' && (name.length < 2 || name.length > 60))
          throw new Error('Name must be 2–60 characters.');
        return { email, name: name || email.split('@')[0] };
      },
      validatePasswordRequirements(password) {
        if (password.length < 12 || password.length > 128)
          throw new Error('Use a password with 12–128 characters.');
      },
    }),
  ],
});
