/**
 * Types for the Technical Visit & Service Report Companion.
 * @license Apache-2.0
 */

export interface VisitDetails {
  customerName: string;
  partnerTicketNumber: string;
  customerTicketNumber: string;
  dateOfVisit: string;
  startTime: string;
  endTime: string;
}

export type ChecklistValue = 'Yes' | 'No' | 'NA';

export interface ChecklistItem {
  id: string;
  task: string;
  value: ChecklistValue;
  specifyDetails?: string;
}

export interface AppendixItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  size: string;
  url: string; // Blob URL or base64 data for previews
  caption?: string;
}
