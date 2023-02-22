import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './message.dto';

@Controller('message')
export class MessageController {
    constructor(private readonly service: MessageService){}
    @Post("pub")
  Publisher(@Body() data: CreateMessageDto) {
    return this.service.Publisher(data.msg);
  }

  @Get("con")
  Consumer() {
    return this.service.Consumer();
  }
}
