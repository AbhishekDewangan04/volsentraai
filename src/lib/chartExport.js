/** Shared chart utilities: CSV + PNG export, no third-party branding. */

function triggerDownload(href, filename) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

export function downloadCSV(rows, columns, name = "chart") {
    const header = columns.map((c) => c.label).join(",");
    const body = rows
        .map((r) => columns.map((c) => `"${String(c.value(r) ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${name}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadPNG(node, name = "chart") {
    if (!node) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(node, {
        backgroundColor: getComputedStyle(document.body).backgroundColor || "#05060f",
        scale: 2,
        logging: false,
    });
    triggerDownload(canvas.toDataURL("image/png"), `${name}.png`);
}