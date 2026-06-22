import { isAllowedOrigin } from './cors';

describe('CORS origin policy', () => {
  it.each([
    undefined,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://check-go-app.vercel.app',
    'https://check-go-app-git-main-ykllozs-projects.vercel.app',
    'https://check-go-o31yfkmfs-ykllozs-projects.vercel.app',
  ])('allows the CheckGo frontend origin %s', (origin) => {
    expect(isAllowedOrigin(origin)).toBe(true);
  });

  it('rejects unrelated Vercel projects', () => {
    expect(isAllowedOrigin('https://unrelated-project.vercel.app')).toBe(false);
  });
});
