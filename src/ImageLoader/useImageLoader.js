import { useState, useCallback } from "react";

function useImageLoader() {
  const [state, setState] = useState({});

  const fetchImage = useCallback(() => {
    const abortController = new AbortController();
    let cancelled = false;
    AbortSignal.timeout(2000).addEventListener("abort", () => abortController.abort());
    const cancel = () => {
      cancelled = true;
      abortController.abort();
    };

    setState({ loading: true, cancel });
    fetch("https://httpbin.org/image", {
      headers: {
        accept: "image/webp",
      },
      signal: abortController.signal,
    })
      .then(assertResponseIsSuccessful)
      .then((response) => response.blob())
      .then(createDataURL)
      .then((dataUrl) => setState({ imageSrc: dataUrl }))
      .catch((error) => {
        cancelled ? setState({}) : setState({ error });
      });
  }, []);

  return {
    fetchImage,
    cancel: state.cancel || (() => {}),
    loading: state.loading || false,
    imageSrc: state.imageSrc || null,
    error: state.error || null,
  };
}

function assertResponseIsSuccessful(response) {
  if (response.status !== 200) {
    throw new Error(`Unexpected statusCode ${response.statusCode}`);
  } else {
    return response;
  }
}

function createDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export { useImageLoader };
