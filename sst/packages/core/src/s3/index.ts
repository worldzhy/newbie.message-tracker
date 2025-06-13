import {GetObjectCommand, S3Client, S3ClientConfig} from '@aws-sdk/client-s3';

export interface S3ServiceConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
}

export class S3Service {
  private client: S3Client;

  constructor(config: S3ServiceConfig = {region: 'us-east-1'}) {
    // Create S3 Client
    const clientConfig: S3ClientConfig = {
      region: config.region,
    };

    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  async getObject(params: {bucket: string; key: string}) {
    const command = new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
    });

    return await this.client.send(command);
  }
}
