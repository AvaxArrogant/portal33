import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

async function getPdfFields() {
  const templatePath = path.join(process.cwd(), "policies", "Policy Certificate POL-xxxx.pdf");
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  fields.forEach((field) => {
    console.log(`Field name: ${field.getName()}`);
  });
}

getPdfFields();