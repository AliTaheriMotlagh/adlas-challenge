import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { IConsumer } from './consumer.interface';
import {
  ConsumerSubscribeTopic,
  ConsumerConfig,
  KafkaMessage,
} from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { KafkajsConsumer } from './kafkajs.consumer';

interface KafkajsConsumerOptions {
  topic: ConsumerSubscribeTopic;
  config: ConsumerConfig;
  onMessage: (message: KafkaMessage) => Promise<void>;
}

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];

  constructor(private readonly configService: ConfigService) {}

  async consume({ topic, config, onMessage }: KafkajsConsumerOptions) {
    const consumer = new KafkajsConsumer(
      topic,
      config,
      this.configService.get('KAFKA_BROKER'),
    );
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
