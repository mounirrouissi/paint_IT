export  interface PurchaseRequest {
  index: number;
  customerName: string;
  customerEmail: string;
}


export interface PlayGroundProps {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
  downloadProgress: number;
  startWithDemoImage: (img: string) => Promise<void>;
}

export interface EditorProps {
  file: File|undefined
}