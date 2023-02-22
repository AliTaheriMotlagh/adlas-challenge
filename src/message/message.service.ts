import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './message.dto';
import { ProducerService } from 'src/kafka/producer.service';
import { ConsumerService } from 'src/kafka/consumer.service';

@Injectable()
export class MessageService implements OnModuleInit {
  messages = [];
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly producerService: ProducerService,
    private readonly consumerService: ConsumerService,
  ) {}

  async Publisher(msg: string) {
    await this.producerService.produce('test', { value: msg });
    return await this.create({ msg });
  }

  async Consumer() {
    return this.messages;
  }

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const createdMessage = new this.messageModel(createMessageDto);
    return createdMessage.save();
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  async onModuleInit() {
    await this.consumerService.consume({
      topic: { topic: 'test', fromBeginning: true },
      config: { groupId: 'adlas-challenge' },
      onMessage: async (message) => {
        this.messages.push(message.value.toString());
      },
    });
  }
}
