// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// Add polyfill for AbortSignal.timeout.
// https://github.com/jsdom/jsdom/issues/3516
if (!AbortSignal.timeout) {
  AbortSignal.timeout = (ms) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException("TimeoutError")), ms);
    return controller.signal;
  };
}

// As recommended by MSW docs.
// https://mswjs.io/docs/getting-started/integrate/node#using-create-react-app
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
