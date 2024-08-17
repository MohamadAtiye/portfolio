
export function formatFileSize(fileSizeInBytes: number): string {
    const kilobytes = fileSizeInBytes / 1024;
    const megabytes = kilobytes / 1024;
  
    if (megabytes >= 1) {
      // If the file size is 1 MB or more, return it in MB
      return `${megabytes.toFixed(2)} MB`;
    } else {
      // Otherwise, return it in KB
      return `${kilobytes.toFixed(2)} KB`;
    }
  }