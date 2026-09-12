import { z } from "zod";

export const childSchema = z.object({
  name: z.string().trim().min(1, "Enter your child's name").max(60),
  age: z.coerce.number().int().min(4, "Age must be 4 or older").max(14, "Age must be 14 or younger"),
  grade: z.string().trim().max(40).optional().or(z.literal("")),
  homeLanguage: z.string().trim().min(2, "Choose a home language"),
  avatarId: z.string().trim().min(1),
  subjectIds: z.array(z.string().min(1)).min(1, "Choose at least one subject"),
});

export type ChildInput = z.infer<typeof childSchema>;
