/** RFC-4180-style parser for teacher roster imports, including quoted commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ""; let quoted = false; let closed = false;
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const pushField = () => { row.push(field.trim()); field = ""; closed = false; };
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"') { if (source[i+1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } }
      else field += c;
    } else if (c === '"') { if (field || closed) throw new Error("Dấu ngoặc kép CSV không hợp lệ."); quoted = true; }
    else if (c === ",") pushField();
    else if (c === "\n") { pushField(); if (row.some(Boolean)) rows.push(row); row = []; }
    else { if (closed && c.trim()) throw new Error("Dữ liệu sau dấu ngoặc kép không hợp lệ."); if (!closed) field += c; }
  }
  if (quoted) throw new Error("Thiếu dấu ngoặc kép đóng trong CSV.");
  pushField(); if (row.some(Boolean)) rows.push(row);
  return rows;
}
