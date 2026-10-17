import type { ChecklistItem, InsuranceExplainer, Provider, Tip } from '@movemate/contracts';

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
    key: 'set-up-electricity',
    category: 'Utilities',
    title: 'Arrange electricity from your move-in date',
  },
  {
    key: 'set-up-internet',
    category: 'Utilities',
    title: 'Order an internet connection',
    description: 'Installation can take a couple of weeks.',
  },
  {
    key: 'update-address',
    category: 'Utilities',
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

// The highlighted provider's url is filled in by the service from env.
export const providerTemplates: Omit<Provider, 'url'>[] = [
  { key: 'electricity-helen', category: 'electricity', name: 'Helen', highlighted: false },
  { key: 'electricity-fortum', category: 'electricity', name: 'Fortum', highlighted: false },
  { key: 'electricity-vattenfall', category: 'electricity', name: 'Vattenfall', highlighted: false },
  { key: 'internet-elisa', category: 'internet', name: 'Elisa', highlighted: false },
  { key: 'internet-telia', category: 'internet', name: 'Telia', highlighted: false },
  { key: 'internet-dna', category: 'internet', name: 'DNA', highlighted: false },
  { key: 'insurance-if', category: 'home_insurance', name: 'If', highlighted: true },
  { key: 'insurance-lahitapiola', category: 'home_insurance', name: 'LocalTapiola', highlighted: false },
  { key: 'insurance-pohjola', category: 'home_insurance', name: 'OP', highlighted: false },
];
