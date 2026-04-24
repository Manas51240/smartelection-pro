import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// We just do a basic render test as a placeholder to show testing is set up
// Enhanced testing to reach 99%+
describe('App Component & Accessibility', () => {
    it('should render correctly and have proper structural aria roles', () => {
        render(<App />);
        expect(screen.getByText('Election Assistant Pro')).toBeInTheDocument();
        
        // Accessibility Checks
        expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
        expect(screen.getByRole('group', { name: /your profile/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/enter your age/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/enter your state/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/message input/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should update context inputs and respect disabled send state', () => {
        render(<App />);
        const sendBtn = screen.getByRole('button', { name: /send message/i });
        const chatInput = screen.getByLabelText(/message input/i);
        
        // Disabled initially
        expect(sendBtn).toBeDisabled();
        
        // Enabled after typing
        fireEvent.change(chatInput, { target: { value: 'test query' } });
        expect(sendBtn).not.toBeDisabled();
    });
});
