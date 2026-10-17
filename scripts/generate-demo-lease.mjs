// One-off: writes the committed fixture apps/api/demo-assets/demo-lease.pdf. Run: node scripts/generate-demo-lease.mjs
// All names and figures are invented and match apps/web/src/features/demo/demo-data.ts.
// Section numbers are referenced by apps/api/demo-assets/KEY_contract_flags.md, keep them in sync.
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const output = path.resolve(import.meta.dirname, '../apps/api/demo-assets/demo-lease.pdf');

const sections = [
  ['1. Parties', [
    '1.1 Landlord: Nordhaven Rentals Oy (demo), business ID 0000000-0, represented by Aino Testinen, aino.testinen@example.com, +358 40 000 0000.',
    '1.2 Tenant: Mikael Esimerkki, date of birth 01.01.1990 (demo person).',
    '1.3 This agreement is governed by Finnish law. In this agreement "the landlord" and "the tenant" include their lawful successors.',
  ]],
  ['2. Property', [
    '2.1 The landlord lets to the tenant the apartment at Testikatu 1 A 1, 00000 Testila (rental number DEMO-0001), a two-room apartment with kitchen of 42 m² on the third floor, built in 1962.',
    '2.2 The tenant also has the right to use the shared sauna, the laundry room and the bicycle storage of the building according to the house rules.',
  ]],
  ['3. Term', [
    '3.1 The lease starts on 1 December 2026 and is fixed for 12 months.',
    '3.2 Unless either party gives written notice at least three (3) months before the end of the fixed term, the lease renews automatically for a further fixed term of 12 months on the same terms.',
  ]],
  ['4. Rent', [
    '4.1 The rent is 890 euros per month. It is paid in advance by the 3rd day of each month to the landlord\'s bank account stated on the invoice. The rent is considered paid when it reaches the account.',
    '4.2 The landlord may increase the rent by giving the tenant thirty (30) days\' written notice. The landlord decides the amount of the increase.',
    '4.3 Late payment accrues interest according to the Finnish Interest Act.',
  ]],
  ['5. Security deposit', [
    '5.1 The tenant pays a security deposit of 1 780 euros (two months\' rent) to the landlord\'s account before receiving the keys.',
    '5.2 The deposit is returned within a reasonable time after the tenant has moved out, less any deductions the landlord considers justified. The deposit does not accrue interest for the tenant.',
  ]],
  ['6. Utilities', [
    '6.1 District heating and water are included in the rent.',
    '6.2 The tenant arranges and pays for their own electricity and internet contracts and keeps them in force during the lease.',
  ]],
  ['7. Home insurance', [
    'The tenant shall take out and keep in force a home insurance policy with adequate cover for the whole lease period and show it to the landlord on request.',
  ]],
  ['8. Use of the property', [
    '8.1 The apartment is for residential use by the tenant only. Subletting or transferring the lease requires the landlord\'s written consent.',
    '8.2 Quiet hours in the building are 22:00 to 07:00. Smoking is not allowed in the apartment or on the balcony. Pets require the landlord\'s prior written consent.',
    '8.3 On moving out the tenant pays a flat cleaning fee of 150 euros, which the landlord may deduct from the deposit.',
  ]],
  ['9. Condition and maintenance', [
    '9.1 The tenant accepts the apartment in its present condition ("as is"). The parties agree that no move-in inspection or condition report is needed, and the tenant waives the right to request one.',
    '9.2 The tenant is responsible for all damage and wear to the apartment and its fixtures arising during the lease, regardless of cause, and shall pay for repairs the landlord considers necessary.',
    '9.3 The tenant shall report any defects or faults to the landlord promptly. The landlord is responsible for repairs to the building structure, heating, plumbing and shared systems.',
    '9.4 The tenant shall keep the apartment in good order, ventilate it regularly and take reasonable care to prevent damage from water, fire and frost.',
  ]],
  ['10. Entry by the landlord', [
    'The landlord may enter the apartment to inspect it, carry out repairs or show it to prospective tenants. The landlord gives the tenant at least 24 hours\' notice where possible, and may enter without notice when the landlord considers it necessary.',
  ]],
  ['11. Termination', [
    '11.1 During the fixed term the tenant may terminate the lease early by giving three (3) months\' written notice and paying an early termination fee equal to two months\' rent.',
    '11.2 The landlord may terminate the lease only on the grounds permitted by the Finnish Act on Residential Leases.',
    '11.3 On termination the tenant returns all keys, leaves the apartment empty, and gives the landlord a forwarding address for the deposit.',
  ]],
  ['12. Other terms', [
    '12.1 Notices under this agreement are given in writing, by email or post, to the addresses above.',
    '12.2 Changes to this agreement are valid only if made in writing and signed by both parties. Disputes are first settled by negotiation and otherwise by the district court of the location of the property.',
  ]],
];

const doc = new PDFDocument({ size: 'A4', margin: 64, info: { Title: 'Residential Lease Agreement (demo)' } });
doc.pipe(createWriteStream(output));

doc.font('Helvetica-Bold').fontSize(20).text('Residential Lease Agreement');
doc.font('Helvetica').fontSize(9).fillColor('#555555').text('Nordhaven Rentals Oy (demo) · Sample document, all names and figures are invented').fillColor('#000000').moveDown(1.2);

for (const [heading, paragraphs] of sections) {
  doc.font('Helvetica-Bold').fontSize(12).text(heading).moveDown(0.3);
  doc.font('Helvetica').fontSize(10.5);
  for (const paragraph of paragraphs) doc.text(paragraph, { align: 'left', lineGap: 3 }).moveDown(0.5);
  doc.moveDown(0.7);
}

// Keep the heading, text and both signature lines together on one page.
if (doc.y > 600) doc.addPage();
doc.font('Helvetica-Bold').fontSize(12).text('13. Signatures').moveDown(0.3);
doc.font('Helvetica').fontSize(10.5).text('Signed in two copies, one for each party. Testila, ____ / ____ 2026.').moveDown(2.5);
const y = doc.y;
doc.text('______________________________', 64, y).text('Landlord: Aino Testinen', 64, y + 16);
doc.text('______________________________', 320, y).text('Tenant: Mikael Esimerkki', 320, y + 16);

doc.end();
