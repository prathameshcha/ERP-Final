/**
 * Utility to print a React component as a dedicated print window.
 * Uses renderToString to create isolated HTML for print.
 */

export function printReportCard(printAreaId?: string) {
  const printArea = (printAreaId && document.getElementById(printAreaId)) || 
                    document.getElementById('printable-report-card') || 
                    document.getElementById('report-card-print-area');
  if (!printArea) {
    alert('Report card preview not found. Please open the preview first.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Could not open print window. Please allow popups for this site.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Progress Report Card — Bharat Ratna Mother Teresa English School</title>
      <style>
        /* Tailwind-compatible print styles */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 12px; color: #1e293b; background: white; }
        @page { margin: 8mm; size: A4; }
        @media print {
          body { margin: 0; }
        }

        /* Utility classes from Tailwind (manually copied for print window) */
        .flex { display: flex; }
        .grid { display: grid; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .space-y-1\\.5 > * + * { margin-top: 0.375rem; }
        .space-x-6 > * + * { margin-left: 1.5rem; }
        .space-x-1\\.5 > * + * { margin-left: 0.375rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-sans { font-family: 'Segoe UI', system-ui, sans-serif; }
        .font-serif { font-family: Georgia, serif; }
        .font-mono { font-family: 'Courier New', monospace; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-black { font-weight: 900; }
        .font-extrabold { font-weight: 800; }
        .uppercase { text-transform: uppercase; }
        .underline { text-decoration: underline; }
        .tracking-wide { letter-spacing: 0.025em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .leading-tight { line-height: 1.25; }
        .leading-relaxed { line-height: 1.625; }
        .shrink-0 { flex-shrink: 0; }
        .flex-1 { flex: 1 1 0%; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .w-full { width: 100%; }
        .h-4 { height: 1rem; }
        .p-1 { padding: 0.25rem; }
        .p-1\\.5 { padding: 0.375rem; }
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
        .pl-2 { padding-left: 0.5rem; }
        .pl-4 { padding-left: 1rem; }
        .pt-1 { padding-top: 0.25rem; }
        .pt-2 { padding-top: 0.5rem; }
        .pt-6 { padding-top: 1.5rem; }
        .pt-8 { padding-top: 2rem; }
        .pb-1 { padding-bottom: 0.25rem; }
        .pb-4 { padding-bottom: 1rem; }
        .pr-4 { padding-right: 1rem; }
        .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mt-0\\.5 { margin-top: 0.125rem; }
        .w-16 { width: 4rem; }
        .w-20 { width: 5rem; }
        .w-32 { width: 8rem; }
        .h-16 { height: 4rem; }
        .h-24 { height: 6rem; }
        .h-12 { height: 3rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .rounded { border-radius: 0.25rem; }
        .rounded-sm { border-radius: 0.125rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-full { border-radius: 9999px; }
        .border { border-width: 1px; border-style: solid; }
        .border-2 { border-width: 2px; border-style: solid; }
        .border-4 { border-width: 4px; border-style: solid; }
        .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
        .border-b-2 { border-bottom-width: 2px; border-bottom-style: solid; }
        .border-t { border-top-width: 1px; border-top-style: solid; }
        .border-r { border-right-width: 1px; border-right-style: solid; }
        .border-collapse { border-collapse: collapse; }
        .border-dashed { border-style: dashed !important; }
        .divide-y > * + * { border-top-width: 1px; border-top-style: solid; }
        .divide-x > * + * { border-left-width: 1px; border-left-style: solid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .w-1\\/2 { width: 50%; }
        .w-12 { width: 3rem; }
        .min-w-\\[50px\\] { min-width: 50px; }
        /* Colors */
        .text-white { color: #fff; }
        .bg-white { background-color: #fff; }
        .text-slate-900 { color: #0f172a; }
        .text-slate-800 { color: #1e293b; }
        .text-slate-700 { color: #334155; }
        .text-slate-600 { color: #475569; }
        .text-slate-500 { color: #64748b; }
        .text-slate-400 { color: #94a3b8; }
        .text-slate-300 { color: #cbd5e1; }
        .text-red-950 { color: #450a0a; }
        .text-red-900 { color: #7f1d1d; }
        .text-amber-400 { color: #fbbf24; }
        .text-amber-200 { color: #fde68a; }
        .text-indigo-950 { color: #1e1b4b; }
        .text-indigo-900 { color: #312e81; }
        .text-emerald-700 { color: #047857; }
        .text-emerald-800 { color: #065f46; }
        .text-indigo-800 { color: #3730a3; }
        .bg-red-950 { background-color: #450a0a; }
        .bg-red-900 { background-color: #7f1d1d; }
        .bg-red-100 { background-color: #fee2e2; }
        .bg-red-50 { background-color: #fef2f2; }
        .bg-indigo-950 { background-color: #1e1b4b; }
        .bg-indigo-900 { background-color: #312e81; }
        .bg-indigo-100 { background-color: #e0e7ff; }
        .bg-indigo-50 { background-color: #eef2ff; }
        .bg-amber-50 { background-color: #fffbeb; }
        .border-red-900 { border-color: #7f1d1d; }
        .border-red-900\\/30 { border-color: rgba(127,29,29,0.3); }
        .border-red-900\\/40 { border-color: rgba(127,29,29,0.4); }
        .border-indigo-900 { border-color: #312e81; }
        .border-indigo-900\\/30 { border-color: rgba(49,46,129,0.3); }
        .border-indigo-900\\/40 { border-color: rgba(49,46,129,0.4); }
        .border-indigo-900\\/60 { border-color: rgba(49,46,129,0.6); }
        .border-amber-400 { border-color: #fbbf24; }
        .border-slate-400 { border-color: #94a3b8; }
        .border-slate-300 { border-color: #cbd5e1; }
        .border-slate-200 { border-color: #e2e8f0; }
        .border-dashed { border-style: dashed; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 4px 6px; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[11px\\] { font-size: 11px; }
        .text-\\[9px\\] { font-size: 9px; }
        .cursor-pointer { cursor: pointer; }
        .opacity-50 { opacity: 0.5; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        /* Fraction widths */
        .\\[210mm\\] { width: 210mm; }
      </style>
    </head>
    <body>
      ${printArea.innerHTML}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1500);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}
