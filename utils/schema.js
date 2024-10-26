import { serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const mockInterview = pgTable("mock_interview", {
  id: serial("id").primaryKey(),
  jobPosition: text("jobPosition").notNull(),
  jobDescription: text("jobDescription").notNull(),
  jobExperience: text("jobExperience").notNull(),
  created_by: text("created_by").notNull(),
  mockId: varchar("mockId", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const UserAnswer = pgTable("user_answer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId", { length: 255 }).notNull(),
  userAnswer: text("userAnswer"),
  questionId: uuid("questionId").default(uuidv4()).unique(),
  question: varchar("question", { length: 255 }).notNull(),
  correctAnswer: text("correctAnswer"),
  feedback: text("feedback"),
  rating: varchar("rating", { length: 255 }),
  userMail: text("userMail").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
