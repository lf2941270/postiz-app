import { 
  IsOptional, 
  IsArray, 
  IsString, 
  IsBoolean, 
  IsIn, 
  MaxLength,
  ArrayMaxSize 
} from 'class-validator';

export class XiaohongshuDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: '话题标签最多5个' })
  topics?: string[];

  @IsOptional()
  @IsIn(['public', 'friends', 'private'])
  privacy?: 'public' | 'friends' | 'private';

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '位置信息不能超过50个字符' })
  location?: string;

  @IsOptional()
  @IsBoolean()
  isCommercial?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '标题不能超过20个字符' })
  title?: string;

  @IsOptional()
  @IsIn(['lifestyle', 'beauty', 'fashion', 'food', 'travel', 'tech', 'other'])
  category?: 'lifestyle' | 'beauty' | 'fashion' | 'food' | 'travel' | 'tech' | 'other';
}
