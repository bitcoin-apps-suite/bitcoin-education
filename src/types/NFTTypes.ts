// Bitcoin Education .nft File Types
export interface NFTHeader {
  magicNumber: string; // "BWNF" = Bitcoin Education NFT
  version: string; // "1.0"
  contentHash: string; // SHA-256 of content
  timestamp: number; // Creation timestamp
  fileSize: number; // Total file size in bytes
  contentType: string; // MIME type of content
}

export interface NFTMetadata {
  // Core identification
  title: string;
  description: string;
  
  // Creator information
  creatorName: string;
  creatorAddress: string; // BSV address
  creatorPublicKey?: string;
  
  // Bitcoin Education specific
  documentType: 'grant-submission' | 'contract' | 'document' | 'article';
  platformSignature?: string; // Our endorsement signature
  
  // Monetization
  shareStructure?: {
    totalShares: number;
    issuedShares: number;
    sharePrice: number; // in satoshis
    currency: string; // "BSV" | "BEDUCATION"
  };
  
  // Revenue routing (.ft integration)
  revenueRoutes?: {
    address: string;
    percentage: number;
    tokenType?: string; // ".ft" file reference
  }[];
  
  // Grant submission specific
  grantInfo?: {
    applicantType: 'developer' | 'author' | 'publisher';
    requestedAmount: number;
    requestedCurrency: 'BSV' | 'BEDUCATION';
    fundingAddress: string; // Where grants should be sent
    bwriterAward?: number; // Our platform award amount
    applicationStatus: 'pending' | 'awarded' | 'funded' | 'rejected';
    reviewNotes?: string;
    fundingDetected?: {
      amount: number;
      txid: string;
      timestamp: number;
    };
  };
  
  // Rights and licensing
  rights: {
    license: 'CC0' | 'MIT' | 'proprietary' | 'custom';
    customLicense?: string;
    commercialUse: boolean;
    derivatives: boolean;
  };
  
  // Platform metadata
  platformData?: {
    tags: string[];
    category: string;
    featured: boolean;
    quality_score?: number; // 0-100
    view_count?: number;
    download_count?: number;
  };
}

export interface NFTContent {
  format: 'html' | 'markdown' | 'json' | 'binary';
  encoding: 'utf8' | 'base64';
  data: string; // The actual content
  attachments?: {
    filename: string;
    mimeType: string;
    size: number;
    data: string; // base64 encoded
  }[];
}

export interface NFTSignature {
  creatorSignature: string; // Creator's signature of content hash
  platformSignature?: string; // Our platform signature (endorsement)
  timestamp: number;
  algorithm: string; // "ECDSA-SHA256"
}

export interface NFTFile {
  header: NFTHeader;
  metadata: NFTMetadata;
  content: NFTContent;
  signature: NFTSignature;
}

// Utility types for working with NFTs
export type GrantSubmission = NFTFile & {
  metadata: NFTMetadata & {
    documentType: 'grant-submission';
    grantInfo: NonNullable<NFTMetadata['grantInfo']>;
  };
};

export type ContractDocument = NFTFile & {
  metadata: NFTMetadata & {
    documentType: 'contract';
    shareStructure: NonNullable<NFTMetadata['shareStructure']>;
  };
};

// File operations interface
export interface NFTService {
  create(content: NFTContent, metadata: Omit<NFTMetadata, 'platformData'>): Promise<NFTFile>;
  read(data: ArrayBuffer | string): Promise<NFTFile>;
  write(nft: NFTFile): Promise<ArrayBuffer>;
  validate(nft: NFTFile): Promise<boolean>;
  sign(nft: NFTFile, privateKey: string): Promise<NFTFile>;
  detectFunding(nft: GrantSubmission): Promise<NFTFile>;
}