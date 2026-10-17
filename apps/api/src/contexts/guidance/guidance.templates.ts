import { linkedItemKeys, type ChecklistItem, type InsuranceExplainer, type Provider, type ProviderDiscount, type Tip } from '@movemate/contracts';

export const prepareChecklist: ChecklistItem[] = [
  {
    key: 'sign-lease',
    category: 'Before you move',
    title: 'Read and sign the lease',
    description: 'Check the deposit, notice period and who is responsible for repairs.',
  },
  {
    key: 'pay-deposit',
    category: 'Before you move',
    title: 'Pay the deposit and keep the receipt',
    description: 'Save proof of payment and the landlord’s account details.',
  },
  {
    key: 'book-movers',
    category: 'Before you move',
    title: 'Book movers or a van',
    description: 'Popular dates fill up weeks ahead, especially at the end of the month.',
  },
  {
    key: 'update-address',
    category: 'Admin',
    title: 'Update your address',
    description: 'Tell the population register, your bank, employer and post.',
  },
  {
    key: 'collect-keys',
    category: 'Moving day',
    title: 'Collect the keys and note how many you get',
  },
  {
    key: 'read-meters',
    category: 'Moving day',
    title: 'Read the electricity and water meters',
    description: 'Take a photo of each meter on the day you arrive.',
  },
  {
    key: linkedItemKeys.electricity,
    category: 'Settle in',
    title: 'Arrange electricity from your move-in date',
    linkedCategory: 'electricity',
  },
  {
    key: linkedItemKeys.internet,
    category: 'Settle in',
    title: 'Order an internet connection',
    description: 'Installation can take a couple of weeks.',
    linkedCategory: 'internet',
  },
  {
    key: linkedItemKeys.home_insurance,
    category: 'Settle in',
    title: 'Get home insurance',
    description: 'The landlord’s insurance does not cover your belongings.',
    linkedCategory: 'home_insurance',
  },
];

export const prepareTips: Tip[] = [
  {
    key: 'tip-declutter',
    title: 'Declutter before packing',
    body: 'Sell or donate what you do not need. Fewer boxes means a cheaper move.',
  },
  {
    key: 'tip-label-boxes',
    title: 'Label boxes by room',
    body: 'Write the destination room on every box so movers can place them straight away.',
  },
  {
    key: 'tip-essentials-box',
    title: 'Pack an essentials box',
    body: 'Keep chargers, toiletries, a kettle and bed linen where you can reach them first.',
  },
  {
    key: 'tip-photos-first',
    title: 'Photograph before you unpack',
    body: 'Take your move-in photos before boxes arrive, so the rooms are easy to see.',
  },
];

export const insuranceExplainer: InsuranceExplainer = {
  title: 'Why home insurance matters when you move in',
  body: 'The landlord’s insurance covers the building, not your belongings. Home insurance covers your things against fire, water damage and theft, and usually covers damage you cause to the apartment. Arrange it before your first night, so you are covered from day one.',
};

export const IF_DISCOUNT: ProviderDiscount = { percent: 10, durationMonths: 12, code: 'MOVEMATE10' };

// The highlighted provider's url is filled in by the service from env.
export const providerTemplates: Omit<Provider, 'url' | 'discount'>[] = [
  { key: 'electricity-a', category: 'electricity', name: 'Electricity Provider A', highlighted: false },
  { key: 'electricity-b', category: 'electricity', name: 'Electricity Provider B', highlighted: false },
  { key: 'electricity-c', category: 'electricity', name: 'Electricity Provider C', highlighted: false },
  { key: 'internet-a', category: 'internet', name: 'Internet Provider A', highlighted: false },
  { key: 'internet-b', category: 'internet', name: 'Internet Provider B', highlighted: false },
  { key: 'internet-c', category: 'internet', name: 'Internet Provider C', highlighted: false },
  { key: 'insurance-if', category: 'home_insurance', name: 'If', highlighted: true },
  { key: 'insurance-b', category: 'home_insurance', name: 'Insurance Company B', highlighted: false },
  { key: 'insurance-c', category: 'home_insurance', name: 'Insurance Company C', highlighted: false },
];
