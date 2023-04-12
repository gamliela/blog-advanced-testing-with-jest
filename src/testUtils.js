async function advanceTimersByTimeAsync(time) {
  await flushMicrotasks();
  jest.advanceTimersByTime(time);
  await flushMicrotasks();
}

async function flushMicrotasks() {
  await new Promise((resolve) => jest.requireActual("timers").setImmediate(resolve));
}

export { advanceTimersByTimeAsync };
