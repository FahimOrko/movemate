export const REPORT_DISCLAIMER =
  'This report documents what the tenant recorded and confirmed. It is not a legal or insurance determination.';

export const WATCH_LIST_DAYS = 30;

export const watchListTemplates = [
  { title: 'Heating', detail: 'Check that every radiator warms up and the thermostat responds.' },
  { title: 'Leaks', detail: 'Look under sinks and around the shower and toilet for drips or damp patches.' },
  { title: 'Ventilation and mold', detail: 'Check windows, corners and bathroom walls for condensation or mold.' },
  { title: 'Windows and doors', detail: 'Check that they open, close and lock, and that seals are intact.' },
  { title: 'Appliances', detail: 'Run the oven, stove, fridge and any washing machine once to confirm they work.' },
] as const;
