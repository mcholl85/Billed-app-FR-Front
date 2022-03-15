/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import mockStore from '../__mocks__/store';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then it should render a New Bill Form', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const form = screen.getByTestId('form-new-bill');
      expect(form).toBeTruthy();
    });
    test('Then mail icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        }),
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.classList.contains('active-icon')).toBeTruthy();
    });
  });
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      window.onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        }),
      );
      document.body.innerHTML = NewBillUI();
    });
    test('Then I choose a file with a correct extension', async () => {
      const newBill = new NewBill({
        document,
        onNavigate: window.onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const createSpy = jest.spyOn(newBill.store.bills(), 'create');
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
      const fileInput = screen.getByTestId('file');
      const file = new File(['proof'], 'proof.png', { type: 'image/png' });
      const event = {
        target: {
          files: [file],
        },
      };

      fileInput.addEventListener('change', handleChange);
      fireEvent.change(fileInput, event);

      expect(handleChange).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(fileInput.files[0]).toStrictEqual(file);
      expect(fileInput.files[0].name).toBe('proof.png');
    });
    test('Then I choose a file with a wrong extension and get an alert', async () => {
      const newBill = new NewBill({
        document,
        onNavigate: window.onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
      const fileInput = screen.getByTestId('file');
      const file = new File(['proof'], 'proof.pdf', {
        type: 'application/pdf',
      });
      const event = {
        target: {
          files: [file],
        },
      };

      fileInput.addEventListener('change', handleChange);
      fireEvent.change(fileInput, event);

      expect(handleChange).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
      expect(fileInput.files[0]).toStrictEqual(file);
      expect(fileInput.files[0].name).toBe('proof.pdf');
    });

    test('Then I submit a new bill and return to the bill page', () => {
      const newBill = new NewBill({
        document,
        onNavigate: window.onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const form = screen.getByTestId('form-new-bill');

      screen.getByTestId('expense-type').value = 'Transports';
      screen.getByTestId('expense-name').value = 'Vol';
      screen.getByTestId('datepicker').value = '30-03-2022';
      screen.getByTestId('amount').value = 399;
      screen.getByTestId('vat').value = 20;
      screen.getByTestId('pct').value = 40;
      screen.getByTestId('commentary').value = 'Test';

      const handleSubmitForm = jest.fn((e) => newBill.handleSubmit(e));
      const updateSpy = jest.spyOn(newBill, 'updateBill');

      form.addEventListener('submit', handleSubmitForm);

      fireEvent.submit(form);

      expect(handleSubmitForm).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    });
  });
});

// test d'intégration POST
describe('Given I am a user connected as Employee', () => {
  describe('When I submit a new bill', () => {
    test('send bill from mock API POST', async () => {
      const updateSpy = jest.spyOn(mockStore.bills(), 'update');
      const post = await mockStore.bills().update();

      expect(updateSpy).toHaveBeenCalled();
      expect(post.id).toEqual('47qAXb6fIm2zOKkLzMro');
    });
  });
});
