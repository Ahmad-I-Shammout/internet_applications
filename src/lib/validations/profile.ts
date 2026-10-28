import { z } from "zod";

// ─── Individual Field Schemas ────────────────────────────────────────────────
// Each schema validates ONLY when the field has a value.
// They are combined with .optional() in the object schema so that
// empty / untouched fields are completely ignored.

export const usernameSchema = z
    .string()
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
    .max(50, "اسم المستخدم يجب ألا يتجاوز 50 حرفاً")
    .regex(/^[a-zA-Z0-9_\u0600-\u06FF]+$/, "اسم المستخدم يجب أن يحتوي على أحرف عربية أو إنجليزية أو أرقام أو (_) فقط");

export const firstNameSchema = z
    .string()
    .min(2, "الاسم الأول يجب أن يكون حرفين على الأقل")
    .max(50, "الاسم الأول يجب ألا يتجاوز 50 حرفاً")
    .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, "الاسم الأول يجب أن يحتوي على أحرف عربية أو إنجليزية فقط");

export const lastNameSchema = z
    .string()
    .min(2, "اسم العائلة يجب أن يكون حرفين على الأقل")
    .max(50, "اسم العائلة يجب ألا يتجاوز 50 حرفاً")
    .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, "اسم العائلة يجب أن يحتوي على أحرف عربية أو إنجليزية فقط");

export const emailSchema = z
    .string()
    .email("البريد الإلكتروني غير صالح");

export const passwordSchema = z
    .string()
    .min(8, "يجب أن تحتوي كلمة المرور على حروف كبيرة وصغيرة ورقم ورمز (8 خانات كحد أدنى)")
    .max(100, "كلمة المرور طويلة جداً")
    .refine((val) => {
        const hasMixedCase = /[a-z]/.test(val) && /[A-Z]/.test(val);
        const hasNumbers = /[0-9]/.test(val);
        const hasSymbols = /[^a-zA-Z0-9]/.test(val);
        return hasMixedCase && hasNumbers && hasSymbols;
    }, "يجب أن تحتوي كلمة المرور على حروف كبيرة وصغيرة ورقم ورمز (8 خانات كحد أدنى)");

export const oldPasswordSchema = z
    .string()
    .min(1, "هذا الحقل مطلوب");

export const storeNameSchema = z
    .string()
    .min(2, "اسم المتجر يجب أن يكون حرفين على الأقل")
    .max(100, "اسم المتجر يجب ألا يتجاوز 100 حرف")
    .regex(/^[\u0600-\u06FFa-zA-Z0-9\s]+$/, "اسم المتجر يجب أن يحتوي على أحرف أو أرقام فقط");

export const addressSchema = z
    .string()
    .min(5, "العنوان يجب أن يكون 5 أحرف على الأقل")
    .max(255, "العنوان يجب ألا يتجاوز 255 حرفاً");

export const imageSchema = z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "حجم الصورة يجب ألا يتجاوز 5 ميجابايت")
    .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "الصورة يجب أن تكون بصيغة JPG أو PNG أو WebP"
    )
    .optional();

// ─── Full Update-Profile Schema ───────────────────────────────────────────────
// Every field is optional — only filled fields are validated and sent.

export const updateProfileSchema = z
    .object({
        username:              usernameSchema.optional(),
        first_name:            firstNameSchema.optional(),
        last_name:             lastNameSchema.optional(),
        email:                 emailSchema.optional(),
        password:              passwordSchema.optional(),
        password_confirmation: z.string().optional(),
        old_password:          z.string().optional(),
        store_name:            storeNameSchema.optional(),
        address:               addressSchema.optional(),
        image:                 imageSchema.optional(),
        remove_image:          z.enum(["true", "false"]).optional(),
    })
    .superRefine((data, ctx) => {
        // Cross-field rules only apply when the user actually typed a new password
        if (data.password && data.password.length > 0) {
            if (data.password_confirmation !== data.password) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة",
                    path: ["password_confirmation"],
                });
            }
            if (!data.old_password || data.old_password.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "هذا الحقل مطلوب",
                    path: ["old_password"],
                });
            }
        }
    });

// ─── Inferred TypeScript Types ────────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Helper: strip empty strings → parse → return only filled fields ──────────
// Empty fields become `undefined` before Zod even runs, so they are:
//   • never validated
//   • never included in result.data
//   • never sent to the API

export function parseUpdateProfileForm(formData: FormData) {
    /** Convert an empty / whitespace-only string to undefined */
    const opt = (key: string): string | undefined => {
        const val = (formData.get(key) as string | null) ?? "";
        return val.trim() === "" ? undefined : val.trim();
    };

    const raw = {
        username:              opt("username"),
        first_name:            opt("first_name"),
        last_name:             opt("last_name"),
        email:                 opt("email"),
        password:              opt("password"),
        password_confirmation: opt("password_confirmation"),
        old_password:          opt("old_password"),
        // store_name:            opt("store_name"),
        // address:               opt("address"),
        image:                 formData.get("image") instanceof File && (formData.get("image") as File).size > 0 ? formData.get("image") : undefined,
        remove_image:          opt("remove_image"),
    };

    return updateProfileSchema.safeParse(raw);
}
