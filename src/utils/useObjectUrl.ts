import { useEffect, useState } from "react";
import { getBlobUrl } from "../data/db";

export function useObjectUrl(blobId: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    let created: string | undefined;
    if (blobId) {
      getBlobUrl(blobId).then((u) => {
        if (active) {
          created = u;
          setUrl(u);
        }
      });
    } else {
      setUrl(undefined);
    }
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [blobId]);

  return url;
}
