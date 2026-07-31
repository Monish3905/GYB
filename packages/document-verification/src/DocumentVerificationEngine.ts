export interface Document {
  documentId: string;
  identityId: string;
  type: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'RESIDENCE_PERMIT' | 'BUSINESS_REGISTRATION' | 'TAX_CERTIFICATE';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  issuingCountry: string;
  expiryDate: Date;
  verifiedAt?: Date;
}

export class DocumentVerificationEngine {
  private documents: Map<string, Document> = new Map();

  public submit(doc: Document): void {
    this.documents.set(doc.documentId, doc);
  }

  public verify(documentId: string): Document {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);
    
    const now = new Date();
    doc.status = doc.expiryDate > now ? 'VERIFIED' : 'EXPIRED';
    doc.verifiedAt = now;
    return doc;
  }

  public getDocument(documentId: string): Document | undefined {
    return this.documents.get(documentId);
  }
}
