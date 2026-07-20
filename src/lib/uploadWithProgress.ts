export type UploadProgressEvent = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadFormDataOptions = {
  url: string;
  formData: FormData;
  onProgress?: (event: UploadProgressEvent) => void;
  signal?: AbortSignal;
  method?: string;
};

export class UploadHttpError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(body || `Upload failed (${status})`);
    this.name = 'UploadHttpError';
    this.status = status;
    this.body = body;
  }
}

/**
 * POST FormData with upload byte progress via XHR (fetch has no upload %).
 */
export function uploadFormDataWithProgress<T = unknown>(
  options: UploadFormDataOptions
): Promise<T> {
  const { url, formData, onProgress, signal, method = 'POST' } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    const onAbort = () => {
      xhr.abort();
      reject(new DOMException('Upload aborted', 'AbortError'));
    };
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      const percent = e.total > 0 ? Math.min(100, Math.round((e.loaded / e.total) * 100)) : 0;
      onProgress({ loaded: e.loaded, total: e.total, percent });
    };

    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      const text = xhr.responseText ?? '';
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new UploadHttpError(xhr.status, text));
        return;
      }
      if (!text) {
        resolve(undefined as T);
        return;
      }
      try {
        resolve(JSON.parse(text) as T);
      } catch {
        resolve(text as T);
      }
    };

    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new Error('Network error during upload'));
    };

    xhr.onabort = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new DOMException('Upload aborted', 'AbortError'));
    };

    xhr.send(formData);
  });
}
