import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForwardIntersection from '../ForwardIntersection';
import { MemoryRouter } from 'react-router-dom';

// MOCK за react-router-dom, за да не хвърля грешка при Link/useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

// Мокваме localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('ForwardIntersection', () => {
  // Изчистваме всички мокове преди всеки тест
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Тест за правилно рендериране на компонента
  test('renders ForwardIntersection component', () => {
    render(
      <MemoryRouter>
        <ForwardIntersection />
      </MemoryRouter>
    );
    
    // Проверяваме дали основните елементи са рендерирани
    expect(screen.getByText('Задача 1: Напредна пресечка')).toBeInTheDocument();
    expect(screen.getByText('Въведете координатите на точките A и B, както и ъглите β₁ и β₂')).toBeInTheDocument();
    
    // Проверяваме дали всички input полета са рендерирани
    expect(screen.getByPlaceholderText('Въведете Yₐ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Въведете Xₐ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Въведете Yᵦ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Въведете Xᵦ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Въведете β₁')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Въведете β₂')).toBeInTheDocument();
  });

  // Тест за валидация на входните данни
  test('validates input data correctly', async () => {
    render(
      <MemoryRouter>
        <ForwardIntersection />
      </MemoryRouter>
    );
    
    // Въвеждаме невалидни данни
    await userEvent.type(screen.getByPlaceholderText('Въведете Yₐ'), 'abc');
    await userEvent.type(screen.getByPlaceholderText('Въведете Xₐ'), 'def');
    
    // Натискаме бутона за изчисление
    fireEvent.click(screen.getByText('Изчисли'));
    
    // Проверяваме дали се показва съобщение за грешка
    expect(screen.getByText('Моля, въведете валидни числови стойности за всички полета')).toBeInTheDocument();
  });

  // Тест за запазване в история
  test('saves calculation to history', async () => {
    render(
      <MemoryRouter>
        <ForwardIntersection />
      </MemoryRouter>
    );
    
    // Въвеждаме валидни данни
    await userEvent.type(screen.getByPlaceholderText('Въведете Yₐ'), '100');
    await userEvent.type(screen.getByPlaceholderText('Въведете Xₐ'), '200');
    await userEvent.type(screen.getByPlaceholderText('Въведете Yᵦ'), '300');
    await userEvent.type(screen.getByPlaceholderText('Въведете Xᵦ'), '400');
    await userEvent.type(screen.getByPlaceholderText('Въведете β₁'), '45');
    await userEvent.type(screen.getByPlaceholderText('Въведете β₂'), '60');
    
    // Натискаме бутона за изчисление
    fireEvent.click(screen.getByText('Изчисли'));
    
    // Проверяваме дали се запазва в localStorage
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // Проверяваме дали се показва в таблицата
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });
}); 