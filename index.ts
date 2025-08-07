import {
  experimental_createMCPClient as createMCPClient,
  generateText,
} from "ai";
import dotenv from "dotenv";
import { Experimental_StdioMCPTransport as StdioMCPTransport } from "ai/mcp-stdio";
import { registry } from "./provider";

dotenv.config();

function formatQueryResults(rawText: string): any[] | null {
  try {
    const startIndex = rawText.indexOf("[{");
    const endIndex = rawText.lastIndexOf("}]");

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonString = rawText.substring(startIndex, endIndex + 2);

      const unescapedJson = jsonString.replace(/\\"/g, '"');
      const jsonData = JSON.parse(unescapedJson);
      return jsonData;
    }
    return null;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    console.error("Raw text:", rawText);
    return null;
  }
}

async function main() {
  let client;

  try {
    if (!process.env.SUPABASE_ACCESS_TOKEN) {
      throw new Error("SUPABASE_ACCESS_TOKEN environment variable is required");
    }

    if (!process.env.SUPABASE_PROJECT_REF) {
      throw new Error("SUPABASE_PROJECT_REF environment variable is required");
    }

    client = await createMCPClient({
      transport: new StdioMCPTransport({
        command: "npx",
        args: [
          "-y",
          "@supabase/mcp-server-supabase@latest",
          "--read-only", // SUPABASE RECOMMENDS READ-ONLY MODE
          `--project-ref=${process.env.SUPABASE_PROJECT_REF}`,
        ],
        env: {
          SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
        },
      }),
    });

    const tools = await client.tools();

    const response = await generateText({
      model: registry.languageModel("google:models/gemini-2.0-flash-exp"),
      tools,
      messages: [
        {
          role: "user",
          content:
            "Query the user_invoice table and get all records where invoice_amount is less than 50 dollars",
        },
      ],
    });

    const responseAny = response as any;
    if (responseAny.steps && responseAny.steps.length > 0) {
      const step = responseAny.steps[0];
      if (step.content && step.content.length > 1) {
        const toolResult = step.content.find(
          (item: any) =>
            item.type === "tool-result" && item.toolName === "execute_sql"
        );

        if (toolResult && toolResult.output && toolResult.output.content) {
          const resultText = toolResult.output.content[0].text;

          const formattedResults = formatQueryResults(resultText);
          if (formattedResults) {
            console.log("Query Results:");
            console.log(JSON.stringify(formattedResults, null, 2));
          } else {
            console.log("No JSON data found in response");
            console.log("Raw result text:", resultText);
          }
        } else {
          console.log("No execute_sql tool result found");
          console.log(
            "Available tool results:",
            step.content
              .filter((item: any) => item.type === "tool-result")
              .map((item: any) => item.toolName)
          );
        }
      }
    } else {
      console.log("No steps found in response");
      console.log("Full response:", JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main().catch(console.error);
