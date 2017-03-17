import * as pkgcloud from 'pkgcloud';

export default class RackspaceService {
  private logger;
  private client;
  private container: string;

  constructor(container: string, username: string, region: string, apiKey: string, logger) {
    this.logger = logger;
    this.container = container;

    this.client = pkgcloud.storage.createClient({
      provider: 'rackspace',
      username: username,
      apiKey: apiKey,
      region: region,
      useInternal: false
    });
  }

  uploadStream(opts) {
    return new Promise((resolve, reject) => {
      const file = {
        container: this.container,
        remote: opts.filename,
        contentType: opts.mimeType
      };

      const writeStream = this.client.upload(file);

      writeStream.on('error', function(err) {
        reject(err);
      });

      writeStream.on('success', function() {
        resolve();
      });

      opts.stream.pipe(writeStream);
    });
  }

  removeFile(filename) {
    return new Promise((resolve, reject) => {
      if (!filename) {
        return resolve();
      }

      this.client.removeFile(this.container, filename, function(err) {
        if (err) {
          this.logger.warn(err);
        }
        // ignore errors if the old file fails to be removed, we can clean up manually
        resolve();
      });
    });
  }
}
