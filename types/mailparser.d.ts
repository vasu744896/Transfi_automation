declare module 'mailparser' {
  import { Readable } from 'stream';

  export interface Attachment {
    contentType: string;
    filename: string;
    contentDisposition: string;
    contentId: string;
    cid: string;
    size: number;
    headers: Map<string, string>;
    content: Buffer;
    checksum: string;
    transferEncoding: string;
    related: boolean;
  }

  export interface ParsedMail {
    text?: string;
    html?: string;
    subject?: string;
    date?: Date;
    from?: { text: string; value: { name: string; address: string }[] };
    to?: { text: string; value: { name: string; address: string }[] };
    attachments?: Attachment[];
    [key: string]: any;
  }

  export function simpleParser(
    stream: Readable | Buffer | string,
    options?: any
  ): Promise<ParsedMail>;
}
