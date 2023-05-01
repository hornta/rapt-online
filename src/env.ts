import { z } from "zod";

const envSchema = z.object({ SVIX_SIGNING_KEY: z.string() });

export const env = envSchema.parse(process.env);
