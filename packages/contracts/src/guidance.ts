import { z } from 'zod';

export const checklistItemSchema = z.object({
  key: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string().optional(),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const tipSchema = z.object({
  key: z.string(),
  title: z.string(),
  body: z.string(),
});
export type Tip = z.infer<typeof tipSchema>;

export const prepareGuidanceSchema = z.object({
  checklist: z.array(checklistItemSchema),
  tips: z.array(tipSchema),
});
export type PrepareGuidance = z.infer<typeof prepareGuidanceSchema>;

export const checklistStatuses = ['pending', 'done', 'no', 'na'] as const;
export const checklistStatusSchema = z.enum(checklistStatuses);
export type ChecklistStatus = z.infer<typeof checklistStatusSchema>;

export function isHandled(status: ChecklistStatus): boolean {
  return status === 'done' || status === 'na';
}

export const guidanceProgressSchema = checklistItemSchema.extend({ status: checklistStatusSchema });
export type GuidanceProgress = z.infer<typeof guidanceProgressSchema>;

export const setProgressSchema = z.object({ status: checklistStatusSchema });
export type SetProgress = z.infer<typeof setProgressSchema>;

export const providerCategories = ['electricity', 'internet', 'home_insurance'] as const;
export const providerCategorySchema = z.enum(providerCategories);
export type ProviderCategory = z.infer<typeof providerCategorySchema>;

export const providerDiscountSchema = z.object({
  percent: z.number(),
  durationMonths: z.number(),
  code: z.string(),
});
export type ProviderDiscount = z.infer<typeof providerDiscountSchema>;

export const providerSchema = z.object({
  key: z.string(),
  category: providerCategorySchema,
  name: z.string(),
  highlighted: z.boolean(),
  url: z.string().nullable(),
  discount: providerDiscountSchema.nullable(),
});
export type Provider = z.infer<typeof providerSchema>;

export const insuranceExplainerSchema = z.object({
  title: z.string(),
  body: z.string(),
});
export type InsuranceExplainer = z.infer<typeof insuranceExplainerSchema>;

export const settleInGuidanceSchema = z.object({
  explainer: insuranceExplainerSchema,
  providers: z.array(providerSchema),
});
export type SettleInGuidance = z.infer<typeof settleInGuidanceSchema>;

export const providerSelectionSchema = z.object({
  electricity: z.string().nullable(),
  internet: z.string().nullable(),
  home_insurance: z.string().nullable(),
});
export type ProviderSelection = z.infer<typeof providerSelectionSchema>;

export const setProviderSelectionSchema = z.object({ providerKey: z.string().min(1).max(100).nullable() });
export type SetProviderSelection = z.infer<typeof setProviderSelectionSchema>;
