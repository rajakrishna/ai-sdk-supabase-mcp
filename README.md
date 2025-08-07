# AI SDK MCP with Supabase

A simple demo showing how to use the AI SDK with Supabase MCP (Model Context Protocol) to query your database using natural language.

## Setup

1. Copy the `.env.example` file to `.env` and fill in your values

2. Install dependencies:

```bash
npm install
```

3. Run the app:

```bash
npm run dev
```

## How it works

- Connects to Supabase using MCP server
- Uses Google's Gemini 2.0 Flash model to process queries
- Executes SQL queries through natural language
- Formats and displays results

## Example

The app queries the `user_invoice` table for records where `invoice_amount` is less than 50 dollars. You can modify the prompt in `index.ts` to ask different questions.

## Provider System

The project includes a provider system (`provider.ts`) that supports multiple AI models:

- **Google**: Gemini models
- **OpenAI**: GPT models
- **Anthropic**: Claude models

You can switch between providers by modifying the model selection in `index.ts`.

## Dependencies

- `ai`: AI SDK for model interactions
- `@ai-sdk/google`: Google AI model integration
- `@ai-sdk/openai`: OpenAI model integration
- `@ai-sdk/anthropic`: Anthropic model integration
- `dotenv`: Environment variables
- `tsx`: TypeScript execution
