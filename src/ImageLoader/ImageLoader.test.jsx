import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import { ImageLoader } from "./ImageLoader";
import { mockWebpImage, mockRemoteImageServer } from "../mocks/mockRemoteImageServer";

const getLoadButton = () => screen.getByRole("button", { name: "Load image" });
const getCancelButton = () => screen.getByRole("button", { name: "Cancel" });
const findImage = () => screen.findByAltText("random stuff from httpbin.org");
const queryImage = () => screen.queryByAltText("random stuff from httpbin.org");
const queryError = () => screen.queryByTestId("error");
const findError = () => screen.findByTestId("error");

jest.useFakeTimers();

describe("ImageLoader", () => {
  it('has two buttons, "Load image" and "Cancel". By default, the "Cancel" button is disabled', () => {
    render(<ImageLoader />);

    expect(getLoadButton()).toBeInTheDocument();

    const cancelButton = getCancelButton();
    expect(cancelButton).toBeDisabled();
    expect(queryError()).toBeNull();
  });

  test('When clicking "Load image", it loads an image from a `https://httpbin.org/image` and displays it', async () => {
    const mockedImage = mockWebpImage();
    mockRemoteImageServer({ webpImage: mockedImage });

    render(<ImageLoader />);
    fireEvent.click(getLoadButton());

    const image = await findImage();
    expect(image.src).toContain(mockedImage.toString("base64"));
    expect(queryError()).toBeNull();
  });

  it('disables the "Load image" button when a request is in progress and enables the "Cancel" button', async () => {
    mockRemoteImageServer();

    render(<ImageLoader />);
    const loadButton = getLoadButton();
    const cancelButton = getCancelButton();
    fireEvent.click(loadButton);

    expect(loadButton).toBeDisabled();
    expect(cancelButton).toBeEnabled();

    await waitFor(() => {
      expect(loadButton).toBeEnabled();
    });
    expect(cancelButton).toBeDisabled();
    expect(queryError()).toBeNull();
  });

  it("displays an error message if there is an error", async () => {
    mockRemoteImageServer({ error: true });

    render(<ImageLoader />);
    fireEvent.click(getLoadButton());

    const error = await findError();
    expect(error).toHaveTextContent("An error has occurred.");
    expect(queryImage()).toBeNull();
  });

  it("displays an error message if a response hasn't been received after 2 seconds", async () => {
    mockRemoteImageServer({ responseTime: 2500 });

    render(<ImageLoader />);
    fireEvent.click(getLoadButton());
    jest.advanceTimersByTime(2200);

    const error = await findError();
    expect(error).toHaveTextContent("Timeout error.");
    expect(queryImage()).toBeNull();
  });
});
