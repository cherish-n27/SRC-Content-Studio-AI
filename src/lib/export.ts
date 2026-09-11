import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import type { DocumentOutput, EmailOutput, AnnouncementOutput } from '@/types';

export async function downloadWord(
  title: string,
  content: DocumentOutput | EmailOutput | AnnouncementOutput,
  filename: string
) {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  if ('subject' in content) {
    children.push(new Paragraph({ children: [new TextRun({ text: `Subject: ${content.subject}`, bold: true })], spacing: { after: 200 } }));
    const bodyParas = content.body.split('\n');
    bodyParas.forEach((line) => {
      children.push(new Paragraph({ children: [new TextRun(line)] }));
    });
  } else if ('headline' in content) {
    children.push(new Paragraph({ children: [new TextRun({ text: content.headline, bold: true })], spacing: { after: 200 } }));
    content.body.split('\n').forEach((line) => {
      children.push(new Paragraph({ children: [new TextRun(line)] }));
    });
  } else if ('sections' in content) {
    for (const section of content.sections) {
      children.push(
        new Paragraph({
          text: section.heading,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
      section.items.forEach((item) => {
        children.push(
          new Paragraph({
            children: [new TextRun(item)],
            spacing: { after: 60 },
          })
        );
      });
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

export async function downloadPNG(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

export async function downloadPDF(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => { img.onload = resolve; });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [img.width, img.height],
  });
  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
  pdf.save(`${filename}.pdf`);
}

export async function downloadZip(files: { name: string; dataUrl: string }[], zipName: string) {
  const zip = new JSZip();
  for (const file of files) {
    const base64 = file.dataUrl.split(',')[1];
    zip.file(file.name, base64, { base64: true });
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${zipName}.zip`);
}

export function buildMailto(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildGmailLink(subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildOutlookLink(subject: string, body: string): string {
  return `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildWhatsAppLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildTwitterLink(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
