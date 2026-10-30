const stamp = () => new Date().toISOString().slice(0, 10);

function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportCSV(rows, columns, name = "volsentra") {
    const head = columns.map((c) => c.label).join(",");
    const body = rows
        .map((r) => columns.map((c) => `"${String(c.value(r) ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    download(`${name}-${stamp()}.csv`, `${head}\n${body}`, "text/csv;charset=utf-8;");
}

export function exportJSON(rows, name = "volsentra") {
    download(`${name}-${stamp()}.json`, JSON.stringify(rows, null, 2), "application/json");
}

export async function exportPDF(title, lines, name = "volsentra") {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("courier", "normal");
    doc.setFontSize(16);
    doc.text(title, 40, 54);
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(`Volsentra AI · generated ${new Date().toISOString().slice(0, 19).replace("T", " ")}`, 40, 72);
    doc.setTextColor(20);
    doc.setFontSize(10);
    let y = 100;
    lines.forEach((line) => {
        if (y > 780) {
            doc.addPage();
            y = 60;
        }
        doc.text(String(line).slice(0, 110), 40, y);
        y += 16;
    });
    doc.save(`${name}-${stamp()}.pdf`);
}