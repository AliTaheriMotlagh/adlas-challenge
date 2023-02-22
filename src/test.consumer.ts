import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './kafka/consumer.service';

@Injectable()
export class testConsumer implements OnModuleInit {
  constructor(private readonly consumerService: ConsumerService) {}
  async onModuleInit() {
    await this.consumerService.consume({
      topic: { topic: 'test' },
      config: { groupId: 'adlas-challenge' },
      onMessage: async (message) => {
         console.log(message.value.toString());
      },
    });
  }
}
