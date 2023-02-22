import {
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
import {  Message } from 'kafkajs';
import { IProducer } from './producer.interface';
import { ConfigService } from '@nestjs/config';
import { KafkajsProducer } from './kafkajs.producer';

@Injectable()
export class ProducerService implements OnApplicationShutdown {
  private readonly producers = new Map<string, IProducer>();

  constructor(private readonly configService: ConfigService) {}

  async produce(topic: string, message: Message) {
    const producer = await this.getProducer(topic);
    await producer.produce(message);
  }
  async getProducer(topic: string) {
    let producer = this.producers.get(topic);

    if (!producer) {
      producer = new KafkajsProducer(
        topic,
        this.configService.get('KAFKA_BROKER'),
      );
    }
    await producer.connect();
    this.producers.set(topic, producer);
    return producer;
  }

  async onApplicationShutdown() {
    for (const producer of this.producers.values()) {
      producer.disconnect();
    }
  }
}
