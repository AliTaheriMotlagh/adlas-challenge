import { Logger } from '@nestjs/common';
import { IConsumer } from './consumer.interface';
import {
  Kafka,
  Consumer,
  ConsumerSubscribeTopic,
  ConsumerConfig,
  KafkaMessage,
} from 'kafkajs';
import { sleep } from 'src/utils/sleep';
export class KafkajsConsumer implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;
  constructor(
    private readonly topic: ConsumerSubscribeTopic,
    config: ConsumerConfig,
    broker: string,
  ) {
    this.kafka = new Kafka({ brokers: [broker] });
    this.consumer = this.kafka.consumer(config);
     this.logger = new Logger(`${topic.topic}-${config.groupId}`);
  }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (error) {
      this.logger.error('Failed to connect to kafka ');
      await sleep(5000);
      await this.connect();
    }
  }
  async disconnect() {
    await this.consumer.disconnect();
  }
  async consume(onMessage: (message: KafkaMessage) => Promise<void>) {
    await this.consumer.subscribe(this.topic);
    await this.consumer.run({
      eachMessage: async ({ message, partition }) => {
        this.logger.debug(`processing message partition ${partition}`);
        onMessage(message);
      },
    });
  }
}
