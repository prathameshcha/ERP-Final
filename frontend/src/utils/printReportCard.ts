/**
 * Utility to print a React component as a dedicated print window.
 * Uses renderToString to create isolated HTML for print.
 */

export function printReportCard(printAreaId?: string) {
  const printArea = (printAreaId && document.getElementById(printAreaId)) || 
                    document.getElementById('printable-report-card') || 
                    document.getElementById('report-card-print-area') ||
                    document.getElementById('admin-report-card-print-area') ||
                    document.getElementById('student-report-card-print-area');
  if (!printArea) {
    alert('Report card preview not found. Please open the preview first.');
    return;
  }

  // Collect all styles and links from the parent window for 100% fidelity
  const stylesAndLinks = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
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
      <title>Official Progress Report Card</title>
      <script src="https://cdn.tailwindcss.com"></script>
      ${stylesAndLinks}
      <style>
        /* High-clarity print rules */
        *, *::before, *::after {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          text-rendering: optimizeLegibility !important;
        }
        @page {
          size: 16.5in 8.5in;
          margin: 0;
        }
        @media print {
          html, body {
            width: 16.5in !important;
            height: 8.5in !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .secondary-report-card-page {
            width: 16.5in !important;
            max-width: 16.5in !important;
            height: 8.5in !important;
            max-height: 8.5in !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 4.5mm 5mm !important;
            overflow: hidden !important;
          }
          .page-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          svg {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: block !important;
          }
        }



        /* Utility classes from Tailwind (manually copied for print window) */
        .flex { display: flex; }
        .grid { display: grid; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-1\\.5 > * + * { margin-top: 0.375rem; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
        .space-x-6 > * + * { margin-left: 1.5rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-x-1\\.5 > * + * { margin-left: 0.375rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-1 { gap: 0.25rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .items-baseline { align-items: baseline; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .justify-around { justify-content: space-around; }
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
        .italic { font-style: italic; }
        .tracking-wide { letter-spacing: 0.025em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .leading-none { line-height: 1; }
        .leading-tight { line-height: 1.15; }
        .leading-snug { line-height: 1.375; }
        .leading-relaxed { line-height: 1.625; }
        .shrink-0 { flex-shrink: 0; }
        .flex-1 { flex: 1 1 0%; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-4 { height: 1rem; }
        .h-8 { height: 2rem; }
        .h-10 { height: 2.5rem; }
        .h-28 { height: 7rem; }
        .w-10 { width: 2.5rem; }
        .w-12 { width: 3rem; }
        .w-16 { width: 4rem; }
        .w-20 { width: 5rem; }
        .w-24 { width: 6rem; }
        .w-32 { width: 8rem; }
        .p-0\\.5 { padding: 0.125rem; }
        .p-1 { padding: 0.25rem; }
        .p-1\\.5 { padding: 0.375rem; }
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .pl-1 { padding-left: 0.25rem; }
        .pl-2 { padding-left: 0.5rem; }
        .pb-0\\.5 { padding-bottom: 0.125rem; }
        .pb-1 { padding-bottom: 0.25rem; }
        .pt-0\\.5 { padding-top: 0.125rem; }
        .pt-1 { padding-top: 0.25rem; }
        .pt-2 { padding-top: 0.5rem; }
        .mb-0\\.5 { margin-bottom: 0.125rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .my-0\\.5 { margin-top: 0.125rem; margin-bottom: 0.125rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mt-4 { margin-top: 1rem; }
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
        .border-dotted { border-style: dotted !important; }
        .border-dashed { border-style: dashed !important; }
        .border-collapse { border-collapse: collapse; }
        
        /* Grid definitions */
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .col-span-1 { grid-column: span 1 / span 1; }
        .col-span-2 { grid-column: span 2 / span 2; }
        .col-span-3 { grid-column: span 3 / span 3; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .col-span-5 { grid-column: span 5 / span 5; }
        .col-span-6 { grid-column: span 6 / span 6; }
        .col-span-7 { grid-column: span 7 / span 7; }
        .col-span-8 { grid-column: span 8 / span 8; }
        .col-span-10 { grid-column: span 10 / span 10; }
        .col-span-12 { grid-column: span 12 / span 12; }
        .w-1\\/5 { width: 20%; }
        .w-1\\/2 { width: 50%; }

        /* Font size definitions */
        .text-\\[7px\\] { font-size: 7px; }
        .text-\\[7\\.5px\\] { font-size: 7.5px; }
        .text-\\[8px\\] { font-size: 8px; }
        .text-\\[8\\.5px\\] { font-size: 8.5px; }
        .text-\\[9px\\] { font-size: 9px; }
        .text-\\[9\\.5px\\] { font-size: 9.5px; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[10\\.5px\\] { font-size: 10.5px; }
        .text-\\[11px\\] { font-size: 11px; }
        .text-\\[12px\\] { font-size: 12px; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-base { font-size: 1rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }

        /* Colors */
        .text-white { color: #fff; }
        .bg-white { background-color: #fff; }
        .text-slate-900 { color: #0f172a; }
        .text-slate-800 { color: #1e293b; }
        .text-slate-700 { color: #334155; }
        .text-slate-600 { color: #475569; }
        .text-slate-500 { color: #64748b; }
        .text-slate-400 { color: #94a3b8; }
        .text-slate-200 { color: #e2e8f0; }
        .text-red-950 { color: #450a0a; }
        .text-red-900 { color: #7f1d1d; }
        .text-red-700 { color: #b91c1c; }
        .text-pink-700 { color: #be185d; }
        .text-pink-800 { color: #9d174d; }
        .text-pink-900 { color: #831843; }
        .text-teal-700 { color: #0f766e; }
        .text-teal-900 { color: #134e4a; }
        .text-amber-400 { color: #fbbf24; }
        .text-amber-300 { color: #fcd34d; }
        .text-amber-200 { color: #fde68a; }
        .text-indigo-950 { color: #1e1b4b; }
        .text-indigo-900 { color: #312e81; }
        .text-emerald-700 { color: #047857; }
        .text-emerald-800 { color: #065f46; }

        .bg-slate-50 { background-color: #f8fafc; }
        .bg-slate-100 { background-color: #f1f5f9; }
        .bg-slate-200 { background-color: #e2e8f0; }
        .bg-red-950 { background-color: #450a0a; }
        .bg-red-900 { background-color: #7f1d1d; }
        .bg-red-700 { background-color: #b91c1c; }
        .bg-red-50 { background-color: #fef2f2; }
        .bg-pink-900 { background-color: #831843; }
        .bg-teal-900 { background-color: #134e4a; }
        .bg-pink-50 { background-color: #fdf2f8; }
        .bg-teal-50 { background-color: #f0fdfa; }
        .bg-indigo-950 { background-color: #1e1b4b; }
        .bg-indigo-900 { background-color: #312e81; }
        .bg-indigo-50 { background-color: #eef2ff; }
        .bg-amber-50 { background-color: #fffbeb; }
        .bg-\\[\\#003366\\] { background-color: #003366; }
        .bg-\\[\\#005580\\] { background-color: #005580; }

        .border-slate-800 { border-color: #1e293b; }
        .border-slate-700 { border-color: #334155; }
        .border-slate-600 { border-color: #475569; }
        .border-slate-500 { border-color: #64748b; }
        .border-slate-400 { border-color: #94a3b8; }
        .border-slate-300 { border-color: #cbd5e1; }
        .border-slate-200 { border-color: #e2e8f0; }
        .border-emerald-800 { border-color: #065f46; }
        .border-amber-400 { border-color: #fbbf24; }
        .border-amber-300 { border-color: #fcd34d; }

        .object-cover { object-fit: cover; }
        .min-h-\\[34px\\] { min-height: 34px; }
        .page-break-after { page-break-after: always; break-after: page; }

        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 2px 3px; }

        @page {
          size: 16.5in 8.5in;
          margin: 0;
        }
        @media print {
          body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break-after { page-break-after: always; break-after: page; }
        }
      </style>
    </head>
    <body>
      ${printArea.innerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }, 1000);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

