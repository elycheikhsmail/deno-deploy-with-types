
import { FetchEvent, Headers } from "./deploy_types.ts";
interface IDict {
  [index: string]: string;
}

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  if (request.method == "GET") {
    const html = `<html>
    <form action="/" method="POST">
    <label>task</lable>
    <input type="text" name="task" id="1">
    <input type="submit" value="send">
    </form>
      </html>`;
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=UTF-8",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  } 
  if (!request.headers.has("content-type")) {
    return new Response(
      JSON.stringify({ error: "please provide 'content-type' header" }),
      {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  const contentType: Headers = request.headers.get("content-type");
  const responseInit = {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };

  // Handle JSON data.
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return new Response(JSON.stringify({ json }, null, 2), responseInit);
  }

  // Handle form data.
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData: FormData = await request.formData();
    // console.log("form handle");
    // console.log(formData);
    const formDataJSON:IDict = {}
    for (const [key, value] of formData.entries()) {
      formDataJSON[key] = String(value) ; 
    }
    return new Response(
      JSON.stringify({ form: formDataJSON}, null, 2),
      responseInit,
    );
  }

  // Handle plain text.
  if (contentType.includes("text/plain")) {
    const text = await request.text();
    return new Response(JSON.stringify({ text }, null, 2), responseInit);
  }

  // Reaching here implies that we don't support the provided content-type
  // of the request so we reflect that back to the client.
  return new Response(null, {
    status: 415,
    statusText: "Unsupported Media Type",
  });
}
