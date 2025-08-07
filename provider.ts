import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createProviderRegistry, type LanguageModel } from "ai";

export type ProviderType = "google" | "openai" | "anthropic";

export interface ProviderConfig {
  name: string;
  model: LanguageModel;
}

export const registry = createProviderRegistry({
  google,
  openai,
  anthropic,
});

export function getProvider(
  providerType: ProviderType,
  modelId: string
): LanguageModel {
  return registry.languageModel(`${providerType}:${modelId}`);
}

export function getAvailableProviders(): ProviderType[] {
  return ["google", "openai", "anthropic"];
}
