import { compose, context, rest } from "msw";
import { server } from "./server";

// Returns hardcoded blank webp image.
function mockWebpImage() {
  return Buffer.from(
    "UklGRj4AAABXRUJQVlA4IDIAAAAQBACdASpEAEYAPpFIoUylpCMiIUgAsBIJaQAACfGjRo0aNGjRo0Z+AAD++E0AAAAAAA==",
    "base64"
  );
}

function mockRemoteImageServer({ webpImage = mockWebpImage(), error = false, responseTime = 0 } = {}) {
  server.use(
    rest.get("https://httpbin.org/image", async (req, res, ctx) => {
      if (webpImage && req.headers.get("accept") === "image/webp" && !error) {
        if (responseTime) {
          await sleep(responseTime);
        }
        return res(
          compose(
            context.set("Content-Length", webpImage.byteLength.toString()),
            context.set("Content-Type", "image/webp"),
            context.body(webpImage)
          )
        );
      } else {
        return res(ctx.status(400));
      }
    })
  );
}

function sleep(timeout) {
  return new Promise((resolve) => setTimeout(() => resolve(), timeout));
}

export { mockWebpImage, mockRemoteImageServer };
