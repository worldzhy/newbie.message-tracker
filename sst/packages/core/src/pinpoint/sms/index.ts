import {
  PinpointSMSVoiceV2Client,
  PinpointSMSVoiceV2ClientConfig,
  SendTextMessageCommand,
  SendTextMessageCommandInput,
  SendTextMessageCommandOutput,
} from '@aws-sdk/client-pinpoint-sms-voice-v2';
import {SendTextMessageParams, TextServiceConfig} from './interface';

export {SendTextMessageParams, TextServiceConfig};

export class TextMessageService {
  private client: PinpointSMSVoiceV2Client;

  constructor(
    config: TextServiceConfig = {
      region: process.env.AWS_PINPOINT_REGION!,
    }
  ) {
    // Create Pinpoint Client
    const clientConfig: PinpointSMSVoiceV2ClientConfig = {
      region: config.region,
    };
    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new PinpointSMSVoiceV2Client(clientConfig);
  }

  async sendText(
    params: SendTextMessageParams
  ): Promise<SendTextMessageCommandOutput> {
    const commandInput: SendTextMessageCommandInput = {
      DestinationPhoneNumber: params.phoneNumber,
      MessageType: 'TRANSACTIONAL',
      MessageBody: params.text,
    };

    return await this.client.send(new SendTextMessageCommand(commandInput));
  }
}
