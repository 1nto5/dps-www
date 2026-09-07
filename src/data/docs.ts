/** One document to download, the shape `DocList` renders. */
export interface Doc {
  href: string;
  label: string;
  /** "PDF", "DOC", "DOCX" — part of the link text. */
  format: string;
  /** "3,4 MB" — part of the link text when known. */
  size?: string;
}
