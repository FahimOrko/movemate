import { z } from 'zod';

export const providerCategories = ['electricity', 'internet', 'home_insurance'] as const;
export const providerCategorySchema = z.enum(providerCategories);
export type ProviderCategory = z.infer<typeof providerCategorySchema>;

/** The checklist item that mirrors each provider category. Single source for the link. */
export const linkedItemKeys: Record<ProviderCategory, string> = {
  electricity: 'set-up-electricity',
  internet: 'set-up-internet',
  home_insurance: 'get-home-insurance',
};

export const checklistItemSchema = z.object({
  key: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string().optional(),
  linkedCategory: providerCategorySchema.optional(),
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

export const guidanceProgressSchema = checklistItemSchema.extend({
  status: checklistStatusSchema,
  /** Linked items stay locked until the move reaches Settle in. */
  locked: z.boolean(),
  /** Name of the provider chosen in Settle in, for linked items. */
  providerName: z.string().nullable(),
});
export type GuidanceProgress = z.infer<typeof guidanceProgressSchema>;

/** Prepare ignores linked items: they are completed in Settle in, not before. */
export function countOpenPrepare(entries: Pick<GuidanceProgress, 'status' | 'linkedCategory'>[]): number {
  return entries.filter((entry) => !entry.linkedCategory && !isHandled(entry.status)).length;
}

export const setProgressSchema = z.object({ status: checklistStatusSchema });
export type SetProgress = z.infer<typeof setProgressSchema>;

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
