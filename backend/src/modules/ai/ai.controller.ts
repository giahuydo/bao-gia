import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateQuotationDto } from './dto/generate-quotation.dto';
import { SuggestItemsDto } from './dto/suggest-items.dto';
import { ImproveDescriptionDto } from './dto/improve-description.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-quotation')
  @ApiOperation({ summary: 'AI generates a quotation draft from text description' })
  generateQuotation(@Body() dto: GenerateQuotationDto) {
    return this.aiService.generateQuotation(dto.description);
  }

  @Post('suggest-items')
  @ApiOperation({ summary: 'AI suggests items based on quotation title' })
  suggestItems(@Body() dto: SuggestItemsDto) {
    return this.aiService.suggestItems(dto.title, dto.existingItems);
  }

  @Post('improve-description')
  @ApiOperation({ summary: 'AI improves an item description' })
  improveDescription(@Body() dto: ImproveDescriptionDto) {
    return this.aiService.improveDescription(dto.itemName, dto.currentDescription);
  }
}
