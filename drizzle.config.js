import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  dbCredentials: {
    url: "postgresql://mock-minds_owner:QsU6fMZgbot2@ep-withered-smoke-a5a8sbzc.us-east-2.aws.neon.tech/mock-minds?sslmode=require",
  },
});
