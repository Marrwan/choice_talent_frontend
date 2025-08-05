import { z } from "zod"

// Base validations
const emailSchema = z.string().email("Please enter a valid email address")

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")

// Registration form schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
})

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

// Reset password form schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

// Change password form schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
})

// Type exports
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema> 