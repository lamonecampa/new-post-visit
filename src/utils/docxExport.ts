/**
 * Utility to export the exact Post-Visit Template to DOCX format in the browser.
 * Highly aligned with the user-provided structure and screenshots.
 * @license Apache-2.0
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ImageRun,
} from 'docx';
import { VisitDetails, ChecklistItem, AppendixItem } from '../types';

// Helper to convert base64 image data to Uint8Array for browser-safe use in docx
function base64ToUint8Array(base64: string): Uint8Array {
  const base64Content = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = window.atob(base64Content);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function exportToDocx(
  details: VisitDetails,
  checklist: ChecklistItem[],
  appendixList: AppendixItem[],
  signingMode: 'physical' | 'digital',
  engineerName: string,
  customerName: string,
  overallSatisfaction: number,
  engineerSigned: boolean,
  customerSigned: boolean,
  engineerSignImg?: string,
  customerSignImg?: string,
  issueDetails?: string,
  resolution?: string,
  requestDescription?: string,
  statusUpdate?: string,
  statusUpdateBullet?: string,
  finalUpdate?: string,
  finalUpdateStatus?: string
): Promise<void> {

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "666666",
  };

  const thickBorder = {
    style: BorderStyle.SINGLE,
    size: 12,
    color: "5B21B6", // Dark purple
  };

  // Helper to construct cells with borders and font formatting
  const createBorderedCell = (
    text: string,
    bold: boolean = false,
    widthPct: number = 20,
    bgColor?: string,
    align: any = AlignmentType.LEFT,
    textColor: string = "000000",
    fontSize: number = 18
  ) => {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: bgColor ? { fill: bgColor } : undefined,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      borders: {
        top: thinBorder,
        bottom: thinBorder,
        left: thinBorder,
        right: thinBorder,
      },
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({
              text,
              bold,
              size: fontSize,
              font: "Arial",
              color: textColor,
            }),
          ],
        }),
      ],
    });
  };

  // Page 1: Purple header banner cell
  const headerBannerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { fill: "EADCF2" }, // Light violet exactly like screenshot Page 1
        margins: { top: 160, bottom: 160 },
        borders: {
          top: thinBorder,
          bottom: thinBorder,
          left: thinBorder,
          right: thinBorder,
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Post-Visit Template",
                bold: true,
                size: 28,
                color: "5B21B6", // Deep purple
                font: "Arial",
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const headerBannerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerBannerRow],
  });

  // Table row headers representing metadata
  const metadataHeaderRow = new TableRow({
    children: [
      createBorderedCell("Customer Name", true, 22, "F3F4F6", AlignmentType.LEFT, "374151", 18),
      createBorderedCell("Partner Ticket Number", true, 16, "F3F4F6", AlignmentType.LEFT, "374151", 18),
      createBorderedCell("Customer Ticket Number", true, 18, "F3F4F6", AlignmentType.LEFT, "374151", 18),
      createBorderedCell("Date of Visit", true, 16, "F3F4F6", AlignmentType.LEFT, "374151", 18),
      createBorderedCell("Start Time", true, 14, "F3F4F6", AlignmentType.LEFT, "374151", 18),
      createBorderedCell("End Time", true, 14, "F3F4F6", AlignmentType.LEFT, "374151", 18),
    ],
  });

  // Metadata Data values row
  const metadataValueRow = new TableRow({
    children: [
      createBorderedCell(details.customerName || "-", false, 22, undefined, AlignmentType.LEFT, "000000", 18),
      createBorderedCell(details.partnerTicketNumber || "-", false, 16, undefined, AlignmentType.LEFT, "1E3A8A", 18),
      createBorderedCell(details.customerTicketNumber || "-", false, 18, undefined, AlignmentType.LEFT, "000000", 18),
      createBorderedCell(details.dateOfVisit ? new Date(details.dateOfVisit).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' }) : "-", false, 16, undefined, AlignmentType.LEFT, "000000", 18),
      createBorderedCell(details.startTime || "-", false, 14, undefined, AlignmentType.LEFT, "000000", 18),
      createBorderedCell(details.endTime || "-", false, 14, undefined, AlignmentType.LEFT, "000000", 18),
    ],
  });

  // A tiny blank spacing row exactly like the screenshots (table cells with empty values)
  const emptySpacingRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnSpan: 6,
        margins: { top: 60, bottom: 60 },
        borders: {
          top: thinBorder,
          bottom: thinBorder,
          left: thinBorder,
          right: thinBorder,
        },
        children: [new Paragraph({ children: [] })],
      }),
    ],
  });

  // Questionnaire header row in purple shades
  const questionnaireHeaderRow = new TableRow({
    children: [
      createBorderedCell("Questionnaire", true, 50, "F5F3FF", AlignmentType.LEFT, "5B21B6", 20),
      createBorderedCell("Yes/No/NA", true, 18, "F5F3FF", AlignmentType.CENTER, "5B21B6", 20),
      createBorderedCell("If No specify details", true, 32, "F5F3FF", AlignmentType.LEFT, "5B21B6", 20),
    ],
  });

  // Map checklists to physical Questionnaire rows
  const questionnaireRows = checklist.map((item) => {
    return new TableRow({
      children: [
        createBorderedCell(item.task, false, 50, undefined, AlignmentType.LEFT, "000000", 18),
        createBorderedCell(item.value, true, 18, item.value === 'Yes' ? "EFF6FF" : item.value === 'No' ? "FEF2F2" : "F9FAFB", AlignmentType.CENTER, item.value === 'Yes' ? "1E40AF" : item.value === 'No' ? "991B1B" : "4B5563", 18),
        createBorderedCell(item.specifyDetails || (item.value === 'No' ? 'Required details' : ''), false, 32, undefined, AlignmentType.LEFT, "4B5563", 18),
      ],
    });
  });

  // Table integrating metadata & checklist
  const documentMainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      metadataHeaderRow,
      metadataValueRow,
      emptySpacingRow,
      questionnaireHeaderRow,
      ...questionnaireRows,
    ],
  });

  // Page 2: Validation panel
  const validationHeaderRow = new TableRow({
    children: [
      createBorderedCell("E0ngineer Name", true, 25, "F3F4F6", AlignmentType.LEFT, "000000", 18),
      createBorderedCell("Engineer Signature", true, 20, "F3F4F6", AlignmentType.CENTER, "000000", 18),
      createBorderedCell("Customer Name", true, 25, "F3F4F6", AlignmentType.LEFT, "000000", 18),
      createBorderedCell("Customer Signature", true, 20, "F3F4F6", AlignmentType.CENTER, "000000", 18),
      createBorderedCell("Overall Customer Satisfaction out of 5", true, 10, "F3F4F6", AlignmentType.CENTER, "000000", 18),
    ],
  });

  const getSignatureCell = (isSigned: boolean, imgData?: string, name?: string) => {
    const defaultText = `\n\n\n[ SIGN - ${name || ''} ]\n\n\n`;
    if (signingMode === 'digital' && isSigned && imgData) {
      try {
        const u8 = base64ToUint8Array(imgData);
        return new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
          borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: u8,
                  transformation: {
                    width: 110,
                    height: 50,
                  },
                  type: "png"
                })
              ]
            })
          ]
        });
      } catch (err) {
        console.error("Image loading error", err);
      }
    }

    // Default return bordered blank space
    return new TableCell({
      width: { size: 20, type: WidthType.PERCENTAGE },
      margins: { top: 120, bottom: 120 },
      borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "_________________",
              color: "9CA3AF",
              size: 16,
            })
          ]
        })
      ]
    });
  };

  const validationValueRow = new TableRow({
    children: [
      createBorderedCell(signingMode === 'digital' ? engineerName : "___________________________", false, 25, undefined, AlignmentType.LEFT, "000000", 18),
      getSignatureCell(engineerSigned, engineerSignImg, "ENGINEER"),
      createBorderedCell(signingMode === 'digital' ? customerName : "___________________________", false, 25, undefined, AlignmentType.LEFT, "000000", 18),
      getSignatureCell(customerSigned, customerSignImg, "CUSTOMER"),
      createBorderedCell(signingMode === 'digital' ? String(overallSatisfaction) : "5", true, 10, undefined, AlignmentType.CENTER, "111111", 24),
    ],
  });

  const validationTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      validationHeaderRow,
      validationValueRow,
    ],
  });

  // Page 4 Appendix Section
  const appendixParagraphs: Paragraph[] = [];
  if (appendixList.length === 0) {
    appendixParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Tidak ada lampiran appendix yang ditambahkan. Bukti penunjang basah dapat dilampirkan setelah dicetak.",
            italics: true,
            size: 18,
            font: "Arial",
            color: "777777",
          }),
        ],
      })
    );
  } else {
    appendixList.forEach((item, index) => {
      appendixParagraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: `${index + 1}. ${item.caption || 'Migrate User Account Credential'}`,
              bold: true,
              size: 20,
              font: "Arial",
              color: "1F2937",
            }),
          ],
        })
      );

      // Embedded Image support in DOCX Appendix
      if (item.type === 'image' && item.url) {
        try {
          const u8 = base64ToUint8Array(item.url);
          appendixParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 150 },
              children: [
                new ImageRun({
                  data: u8,
                  transformation: {
                    width: 320,
                    height: 240,
                  },
                  type: "png"
                }),
              ],
            })
          );
        } catch (e) {
          console.error("Appendix image import error in Docx: ", e);
        }
      } else {
        appendixParagraphs.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `[Berkas Lampiran: ${item.name} (${item.size})]`,
                italics: true,
                size: 16,
                font: "Consolas",
                color: "4B5563",
              })
            ]
          })
        );
      }
    });
  }

  // Final Word Document Structuring
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        children: [
          // Section: Post Visit Header
          headerBannerTable,
          new Paragraph({ spacing: { before: 180 } }),

          // Details + Questionnaire
          documentMainTable,
          new Paragraph({ spacing: { before: 250, after: 180 } }),

          // Section 2: Issue Details Writeup
          new Paragraph({
            children: [
              new TextRun({
                text: "Issue Details:",
                bold: true,
                size: 20,
                font: "Arial",
                color: "000000",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60, after: 200 },
            children: [
              new TextRun({
                text: issueDetails || "The Field Service Engineer’s, requested to help users migrate their account credential at Corteva Malang on Monday, 8th June 2026 at 8.30 AM – 5.00 PM",
                size: 18,
                font: "Arial",
                color: "333333",
              }),
            ],
          }),

          // Page Break to mimic Page 2
          new Paragraph({ pageBreakBefore: true }),

          // Section 3: Resolution Writeup
          new Paragraph({
            children: [
              new TextRun({
                text: "Resolution:",
                bold: true,
                size: 20,
                font: "Arial",
                color: "000000",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60, after: 250 },
            children: [
              new TextRun({
                text: resolution || "FSE activities, available on Corteva Malang for supporting the ticket on Monday, 8th June 2026 at 8.30 AM – 5.00 PM\nFSE help customer to migrate their account credential, and the migration is still ongoing.",
                size: 18,
                font: "Arial",
                color: "333333",
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180, after: 180 } }),

          // Sign-off verification table
          validationTable,

          // Page Break to mimic Page 3 Detail logs
          new Paragraph({ pageBreakBefore: true }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Ticket status update on ${details.dateOfVisit ? new Date(details.dateOfVisit).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' }) : '8th June 2026'},`,
                size: 20,
                font: "Arial",
                color: "000000",
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 150 } }),

          new Paragraph({
            children: [
              new TextRun({ text: "Request Description: ", bold: true, size: 18, font: "Arial" }),
              new TextRun({ text: requestDescription || "Need support to help users migrate their account credential at Corteva Malang", size: 18, font: "Arial" }),
            ],
          }),
          new Paragraph({ spacing: { after: 150 } }),

          new Paragraph({
            children: [
              new TextRun({ text: "Status update: ", bold: true, size: 18, font: "Arial" }),
              new TextRun({ text: statusUpdate || "The Field Service Engineer activities, migrate users account credential as instructed by Corteva’s IT on Corteva Malang at Jl. Raya Krebet DS Krebet Kec. Bululawang Malang East Java Indonesia 65171 this afternoon on 8th June 2026", size: 18, font: "Arial" }),
            ],
          }),
          new Paragraph({ spacing: { before: 100, after: 150 } }),

          // Bullet List
          new Paragraph({
            indent: { left: 400 },
            children: [
              new TextRun({ text: "•  ", bold: true, size: 18, font: "Arial" }),
              new TextRun({ text: statusUpdateBullet || "FSE has done the instruction by Corteva’s IT to help users migrate their account", size: 18, font: "Arial" }),
            ],
          }),
          new Paragraph({ spacing: { after: 180 } }),

          new Paragraph({
            children: [
              new TextRun({ text: "Final Update: ", bold: true, size: 18, font: "Arial" }),
              new TextRun({ text: finalUpdate || "The Field Service Engineer has completed the shift for supporting users on Corteva Malang on 8th June 2026 at 5.00 PM", size: 18, font: "Arial" }),
            ],
          }),
          new Paragraph({ spacing: { after: 150 } }),

          new Paragraph({
            children: [
              new TextRun({ text: finalUpdateStatus || "The issues reported in this ticket were resolved successfully. FSE proceed to close the ticket.", size: 18, font: "Arial" }),
            ],
          }),

          // Page Break to mimic Page 4 Appendix
          new Paragraph({ pageBreakBefore: true }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 150 },
            children: [
              new TextRun({
                text: "Appendix",
                bold: true,
                size: 24,
                font: "Arial",
                color: "000000",
              }),
            ],
          }),

          ...appendixParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Post_Visit_Template_${details.customerName?.replace(/[\s\W]+/g, '_') || 'Draft'}.docx`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
