import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('redirects guests to sign in', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });
});
