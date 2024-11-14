import { Calculator } from "npm:@langchain/community/tools/calculator";

const calculator = new Calculator();
const KEY = Deno.env.get("KEY");

Deno.serve(async (req: Request) => {
  // 处理 CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // 处理计算请求
  if (req.method === "POST" && new URL(req.url).pathname === "/calculate") {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization header is required");
      }

      const token = authHeader.replace("Bearer ", "");
      if (token !== KEY) {
        throw new Error("Invalid token");
      }

      const { expression } = await req.json();
      if (!expression) {
        throw new Error("Expression is required");
      }

      // 使用 Langchain Calculator 进行计算
      const result = await calculator.call(expression);

      return new Response(
        JSON.stringify({ result: Number(result) }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  return new Response("Not Found", { status: 404 });
});
