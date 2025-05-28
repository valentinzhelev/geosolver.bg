import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FirstTask from '../FirstTask';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the useTypewriter hook
jest.mock('../../../hooks/useTypewriter', () => ({
  __esModule: true,
  default: (text) => ({
    displayText: text,
    isTyping: false
  })
}));

// Wrapper component to provide router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('FirstTask Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the component with initial state', () => {
    renderWithRouter(<FirstTask />);
    
    // Check if all input fields are present
    expect(screen.getByLabelText(/Y1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/X1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/α/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/S/i)).toBeInTheDocument();
    
    // Check if buttons are present
    expect(screen.getByText(/Изчисли/i)).toBeInTheDocument();
    expect(screen.getByText(/Изчисти/i)).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    renderWithRouter(<FirstTask />);
    
    const y1Input = screen.getByLabelText(/Y1/i);
    const x1Input = screen.getByLabelText(/X1/i);
    const alphaInput = screen.getByLabelText(/α/i);
    const sInput = screen.getByLabelText(/S/i);

    fireEvent.change(y1Input, { target: { value: '100' } });
    fireEvent.change(x1Input, { target: { value: '200' } });
    fireEvent.change(alphaInput, { target: { value: '50' } });
    fireEvent.change(sInput, { target: { value: '150' } });

    expect(y1Input.value).toBe('100');
    expect(x1Input.value).toBe('200');
    expect(alphaInput.value).toBe('50');
    expect(sInput.value).toBe('150');
  });

  test('calculates results correctly', async () => {
    renderWithRouter(<FirstTask />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Y1/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/X1/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/α/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/S/i), { target: { value: '150' } });

    // Click calculate button
    fireEvent.click(screen.getByText(/Изчисли/i));

    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Y2 =/i)).toBeInTheDocument();
      expect(screen.getByText(/X2 =/i)).toBeInTheDocument();
    });
  });

  test('shows error message for invalid input', () => {
    renderWithRouter(<FirstTask />);
    
    // Fill in the form with invalid data
    fireEvent.change(screen.getByLabelText(/Y1/i), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByLabelText(/X1/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/α/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/S/i), { target: { value: '150' } });

    // Click calculate button
    fireEvent.click(screen.getByText(/Изчисли/i));

    // Check for error message
    expect(screen.getByText(/Моля, попълнете всички полета коректно/i)).toBeInTheDocument();
  });

  test('resets form when clear button is clicked', () => {
    renderWithRouter(<FirstTask />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Y1/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/X1/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/α/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/S/i), { target: { value: '150' } });

    // Click clear button
    fireEvent.click(screen.getByText(/Изчисти/i));

    // Check if all fields are cleared
    expect(screen.getByLabelText(/Y1/i).value).toBe('');
    expect(screen.getByLabelText(/X1/i).value).toBe('');
    expect(screen.getByLabelText(/α/i).value).toBe('');
    expect(screen.getByLabelText(/S/i).value).toBe('');
  });

  test('saves calculation to history', async () => {
    renderWithRouter(<FirstTask />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Y1/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/X1/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/α/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/S/i), { target: { value: '150' } });

    // Click calculate button
    fireEvent.click(screen.getByText(/Изчисли/i));

    // Check if history was saved
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'firstTaskHistory',
        expect.any(String)
      );
    });
  });

  test('handles download of results', async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = jest.fn();
    const mockRevokeObjectURL = jest.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement
    const mockClick = jest.fn();
    document.createElement = jest.fn(() => ({
      click: mockClick,
      setAttribute: jest.fn()
    }));

    renderWithRouter(<FirstTask />);
    
    // Fill in the form and calculate
    fireEvent.change(screen.getByLabelText(/Y1/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/X1/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/α/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/S/i), { target: { value: '150' } });
    fireEvent.click(screen.getByText(/Изчисли/i));

    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText(/Y2 =/i)).toBeInTheDocument();
    });

    // Find and click download button
    const downloadButton = screen.getByText(/Свали/i);
    fireEvent.click(downloadButton);

    // Verify download functionality
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });
}); 