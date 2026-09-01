/*
 * lib/format — the portal's one date formatter.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 * The first version of `formatDate` sent EVERY value through Intl with the
 * client's time zone. That is right for an instant and WRONG for a bare
 * `YYYY-MM-DD`: `new Date('2025-05-25')` parses as UTC midnight, so a client in
 * Los Angeles saw an event dated the 24th. It looked correct in Asia/Kolkata,
 * which is where it would have been tested — the kind of bug that ships.
 *
 * The five zones below are the regression. Do not remove them.
 *
 * ── HOW TO RUN ──────────────────────────────────────────────────────────────
 *   npx tsx src/lib/format.test.mts
 */
import { formatDate } from './format';
let pass=0,fail=0;
const ok=(l:string,c:boolean,e='')=>{c?(pass++,console.log('  PASS  '+l)):(fail++,console.log('  FAIL  '+l+'  '+e))};

// The bug this guards: a bare YYYY-MM-DD must not be shifted by a time zone.
for (const zone of ['America/Los_Angeles','America/New_York','UTC','Asia/Kolkata','Pacific/Auckland']) {
  const out = formatDate('2025-05-25', { date_format: 'DD/MM/YYYY', time_zone: zone });
  ok(`date-only 2025-05-25 stays the 25th in ${zone}`, out === '25/05/2025', out);
}
ok('MM/DD/YYYY', formatDate('2025-05-25',{date_format:'MM/DD/YYYY',time_zone:'UTC'})==='05/25/2025');
ok('YYYY-MM-DD', formatDate('2025-05-25',{date_format:'YYYY-MM-DD',time_zone:'UTC'})==='2025-05-25');
ok('DD MMM YYYY', formatDate('2025-05-25',{date_format:'DD MMM YYYY',time_zone:'UTC'})==='25 May 2025');
ok('MMM DD, YYYY', formatDate('2025-05-25',{date_format:'MMM DD, YYYY',time_zone:'UTC'})==='May 25, 2025');

// A real instant DOES follow the zone — that is the whole point of the setting.
const inst='2025-05-25T20:30:00Z';
ok('instant in Kolkata rolls to the 26th', formatDate(inst,{date_format:'DD/MM/YYYY',time_zone:'Asia/Kolkata'})==='26/05/2025', formatDate(inst,{date_format:'DD/MM/YYYY',time_zone:'Asia/Kolkata'}));
ok('same instant stays the 25th in New York', formatDate(inst,{date_format:'DD/MM/YYYY',time_zone:'America/New_York'})==='25/05/2025', formatDate(inst,{date_format:'DD/MM/YYYY',time_zone:'America/New_York'}));
ok('withTime appends a time', /,\s\d{2}:\d{2}\s?(am|pm)/i.test(formatDate(inst,{date_format:'DD/MM/YYYY',time_zone:'UTC'},true)), formatDate(inst,{date_format:'DD/MM/YYYY',time_zone:'UTC'},true));

// Nothing must throw the page down.
ok('null -> em dash', formatDate(null)==='—');
ok('empty -> em dash', formatDate('')==='—');
ok('garbage -> em dash', formatDate('not a date')==='—');
ok('an unknown time zone falls back instead of throwing', formatDate(inst,{date_format:'DD/MM/YYYY',time_zone:'Mars/Olympus'}).length>0);

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
