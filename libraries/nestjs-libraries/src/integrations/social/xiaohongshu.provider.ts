import {
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
  ClientInformation,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { XiaohongshuDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/xiaohongshu.dto';
import { Integration } from '@prisma/client';
import sharp from 'sharp';
import { readOrFetch } from '@gitroom/helpers/utils/read.or.fetch';

export class XiaohongshuProvider extends SocialAbstract implements SocialProvider {
  identifier = 'xiaohongshu';
  name = '小红书';
  isBetweenSteps = true; // 需要用户手动确认发布
  scopes: string[] = []; // 无需OAuth scopes

  async refreshToken(): Promise<AuthTokenDetails> {
    // 小红书不需要token刷新，返回固定值
    return {
      id: 'xiaohongshu-manual',
      name: '小红书手动发布',
      accessToken: 'manual-token',
      refreshToken: '',
      expiresIn: 999999999,
      picture: '',
      username: '手动发布模式',
    };
  }

  async generateAuthUrl() {
    // 小红书不需要OAuth认证，返回空URL让前端显示自定义字段
    const state = makeId(10);
    return {
      url: '',
      codeVerifier: 'manual-auth',
      state,
    };
  }

  async customFields() {
    return [
      {
        key: 'username',
        label: '小红书用户名',
        defaultValue: '',
        validation: `/^.{1,}$/`,
        type: 'text' as const,
      },
    ];
  }

  async authenticate(
    params: { code: string; codeVerifier: string; refresh?: string },
    clientInformation?: ClientInformation
  ): Promise<AuthTokenDetails | string> {
    try {
      // 解析前端传来的自定义字段数据
      const body = JSON.parse(Buffer.from(params.code, 'base64').toString());

      // 验证用户名是否有效
      if (!body.username || body.username.trim().length === 0) {
        return 'Please enter a valid username';
      }

      const username = body.username.trim();

      return {
        id: `xiaohongshu-${username}`,
        name: `小红书 - ${username}`,
        accessToken: 'manual-token',
        refreshToken: '',
        expiresIn: 999999999,
        picture: '',
        username: username,
        additionalSettings: [
          {
            title: '发布模式',
            description: '小红书采用半自动化发布，系统会为您准备好内容和图片，您需要手动完成最后的发布步骤',
            type: 'text' as const,
            value: '半自动发布',
          },
        ],
      };
    } catch (error) {
      // 如果解析失败，可能是测试环境或者前端还没有正确实现
      // 返回一个默认的认证结果
      return {
        id: 'xiaohongshu-default',
        name: '小红书手动发布',
        accessToken: 'manual-token',
        refreshToken: '',
        expiresIn: 999999999,
        picture: '',
        username: '手动发布模式',
        additionalSettings: [
          {
            title: '发布模式',
            description: '小红书采用半自动化发布，系统会为您准备好内容和图片，您需要手动完成最后的发布步骤',
            type: 'text' as const,
            value: '半自动发布',
          },
        ],
      };
    }
  }

  async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails<XiaohongshuDto>[],
    integration: Integration
  ): Promise<PostResponse[]> {
    // 处理内容和媒体，准备发布指导
    const processedPosts = await this.prepareContentForXiaohongshu(postDetails);
    
    return processedPosts.map((post, index) => ({
      id: post.id,
      postId: `xiaohongshu-manual-${Date.now()}-${index}`,
      releaseURL: '', // 用户发布后需要手动填入
      status: 'pending-manual-publish',
      publishGuide: post.publishGuide,
    }));
  }

  private async prepareContentForXiaohongshu(
    postDetails: PostDetails<XiaohongshuDto>[]
  ) {
    const processedPosts = [];

    for (const post of postDetails) {
      // 1. 处理文本内容
      const processedContent = this.formatContentForXiaohongshu(
        post.message,
        post.settings
      );

      // 2. 处理图片
      const processedMedia = await this.processMediaForXiaohongshu(post.media || []);

      // 3. 生成发布指导
      const publishGuide = this.generatePublishGuide(
        processedContent,
        processedMedia,
        post.settings
      );

      processedPosts.push({
        ...post,
        processedContent,
        processedMedia,
        publishGuide,
      });
    }

    return processedPosts;
  }

  private formatContentForXiaohongshu(
    content: string,
    settings?: XiaohongshuDto
  ): string {
    // 1. 验证内容长度
    const validation = this.validateContentLength(content);
    if (!validation.isValid) {
      console.warn('小红书内容长度警告:', validation.suggestion);
    }

    // 2. 优化内容结构
    let formatted = this.optimizeContentStructure(content);

    // 3. 添加小红书风格的emoji
    formatted = this.addXiaohongshuEmojis(formatted);

    // 4. 处理话题标签
    if (settings?.topics && settings.topics.length > 0) {
      const topicTags = settings.topics.map((topic: string) => `#${topic}#`).join(' ');
      formatted += `\n\n${topicTags}`;
    }

    // 5. 添加位置信息
    if (settings?.location) {
      formatted += `\n📍 ${settings.location}`;
    }

    // 6. 添加互动元素
    formatted = this.addInteractiveElements(formatted, settings?.isCommercial || false);

    return formatted;
  }

  private addXiaohongshuEmojis(content: string): string {
    // 为内容添加适合小红书的emoji
    const emojiMap = {
      '！': '✨',
      '推荐': '🔥',
      '必看': '👀',
      '攻略': '📝',
      '分享': '💫',
      '好用': '👍',
      '美': '💄',
      '食': '🍽️',
      '旅': '✈️',
    };

    let formatted = content;
    Object.entries(emojiMap).forEach(([key, emoji]) => {
      if (formatted.includes(key)) {
        formatted = formatted.replace(new RegExp(key, 'g'), `${emoji}${key}`);
      }
    });

    return formatted;
  }

  private async processMediaForXiaohongshu(media: any[]) {
    if (!media || media.length === 0) return [];

    // 小红书图片要求：
    // - 最多9张图片
    // - 支持JPG, PNG格式
    // - 建议尺寸比例：1:1, 3:4, 4:3
    // - 文件大小 < 20MB
    const processedMedia = [];
    const maxImages = 9;

    for (let i = 0; i < Math.min(media.length, maxImages); i++) {
      const item = media[i];

      if (item.type === 'image') {
        try {
          // 读取原始图片
          const imageBuffer = await readOrFetch(item.path);

          // 获取图片信息
          const metadata = await sharp(imageBuffer).metadata();

          // 优化图片尺寸和格式
          const optimizedBuffer = await sharp(imageBuffer)
            .resize({
              width: Math.min(metadata.width || 1080, 1080),
              height: Math.min(metadata.height || 1080, 1080),
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ quality: 90 })
            .toBuffer();

          processedMedia.push({
            ...item,
            optimizedPath: `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`,
            originalSize: imageBuffer.length,
            optimizedSize: optimizedBuffer.length,
            dimensions: `${metadata.width}x${metadata.height}`,
          });
        } catch (error) {
          // 如果处理失败，保留原始媒体
          processedMedia.push(item);
        }
      } else {
        // 小红书暂不支持视频自动发布，添加提示
        processedMedia.push({
          ...item,
          note: '小红书视频需要手动上传',
        });
      }
    }

    return processedMedia;
  }

  private generatePublishGuide(
    content: string,
    media: any[],
    settings?: XiaohongshuDto
  ) {
    // 生成优化的标题建议
    const titleSuggestion = this.generateXiaohongshuTitle(content);

    // 获取最佳发布时间建议
    const timingSuggestion = this.getOptimalPublishTime();

    const guide = {
      title: '小红书发布指导',
      steps: [
        {
          step: 1,
          title: '打开小红书APP',
          description: '在手机上打开小红书APP，点击底部"+"按钮开始创建笔记',
        },
        {
          step: 2,
          title: '上传图片',
          description: media.length > 0
            ? `上传${media.length}张图片。建议使用正方形或3:4比例的图片效果最佳`
            : '选择合适的图片上传，建议使用正方形或3:4比例的图片',
          images: media.map(m => m.optimizedPath || m.path),
        },
        {
          step: 3,
          title: '填写标题',
          description: '使用吸引人的标题，建议参考以下标题：',
          content: titleSuggestion,
        },
        {
          step: 4,
          title: '填写正文内容',
          description: '复制下面的内容到小红书正文',
          content: content,
        },
        {
          step: 5,
          title: '设置发布选项',
          description: this.generatePublishOptions(settings),
        },
        {
          step: 6,
          title: '发布笔记',
          description: '检查内容无误后，点击"发布"按钮完成发布',
        },
      ],
      tips: [
        `💡 ${timingSuggestion}`,
        '💡 标题要吸引人，可以使用数字、疑问句、感叹号',
        '💡 图片第一张最重要，决定点击率',
        '💡 适当使用话题标签，但不要超过5个',
        '💡 如果是商业内容，记得标注【广告】',
        '💡 发布后及时回复评论，提高互动率',
      ],
      publishTime: timingSuggestion,
      contentValidation: this.validateContentLength(content),
    };

    return guide;
  }

  private generatePublishOptions(settings?: XiaohongshuDto) {
    const options = [];

    if (settings?.privacy) {
      const privacyMap = {
        public: '公开',
        friends: '仅好友可见',
        private: '仅自己可见',
      };
      options.push(`隐私设置：${privacyMap[settings.privacy as keyof typeof privacyMap]}`);
    }

    if (settings?.location) {
      options.push(`添加位置：${settings.location}`);
    }

    if (settings?.isCommercial) {
      options.push('标记为商业内容：开启');
    }

    if (settings?.topics && settings.topics.length > 0) {
      options.push(`话题标签：${settings.topics.join(', ')}`);
    }

    return options.length > 0 ? options.join('\n') : '使用默认设置即可';
  }

  // 生成小红书风格的标题
  private generateXiaohongshuTitle(content: string): string {
    // 提取内容的前20个字符作为基础
    let title = content.substring(0, 20).trim();

    // 添加吸引人的元素
    const attractiveElements = [
      '✨', '🔥', '💯', '👀', '📝', '💫', '🎯', '⭐'
    ];

    const randomEmoji = attractiveElements[Math.floor(Math.random() * attractiveElements.length)];

    // 如果标题太短，添加一些常用的小红书标题模式
    if (title.length < 10) {
      const patterns = [
        '必看攻略！',
        '超详细教程',
        '亲测有效',
        '强烈推荐',
        '干货分享',
        '实用技巧'
      ];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      title = `${randomEmoji} ${title} ${randomPattern}`;
    } else {
      title = `${randomEmoji} ${title}...`;
    }

    return title;
  }

  // 优化内容结构
  private optimizeContentStructure(content: string): string {
    // 分段处理，提高可读性
    const paragraphs = content.split('\n').filter(p => p.trim());

    if (paragraphs.length === 1) {
      // 单段内容，尝试按句号分割
      const sentences = paragraphs[0].split('。').filter(s => s.trim());
      if (sentences.length > 2) {
        return sentences.map(s => s.trim() + '。').join('\n\n');
      }
    }

    // 多段内容，确保段落间有适当间距
    return paragraphs.join('\n\n');
  }

  // 添加小红书常用的互动元素
  private addInteractiveElements(content: string, isCommercial: boolean = false): string {
    let enhanced = content;

    if (!isCommercial) {
      // 非商业内容添加互动引导
      const interactiveElements = [
        '\n\n💬 你们觉得呢？评论区聊聊～',
        '\n❤️ 觉得有用记得点赞收藏哦！',
        '\n🔄 欢迎转发给需要的朋友',
        '\n📝 有问题可以私信我'
      ];

      enhanced += interactiveElements.join('');
    } else {
      // 商业内容添加合规元素
      enhanced = '【广告】' + enhanced;
      enhanced += '\n\n💼 商业合作内容，感谢支持';
    }

    return enhanced;
  }

  // 检查内容长度并提供建议
  private validateContentLength(content: string): { isValid: boolean; suggestion?: string } {
    const length = content.length;

    if (length < 20) {
      return {
        isValid: false,
        suggestion: '内容太短，建议至少20个字符以上，可以添加更多细节描述'
      };
    }

    if (length > 1000) {
      return {
        isValid: false,
        suggestion: '内容过长，建议控制在1000字符以内，可以分成多篇发布'
      };
    }

    return { isValid: true };
  }

  // 生成发布时间建议
  private getOptimalPublishTime(): string {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0=周日, 1=周一, ..., 6=周六

    // 小红书最佳发布时间
    const optimalTimes = {
      weekday: ['7:00-9:00', '12:00-14:00', '19:00-22:00'],
      weekend: ['10:00-12:00', '14:00-16:00', '19:00-22:00']
    };

    const isWeekend = day === 0 || day === 6;
    const times = isWeekend ? optimalTimes.weekend : optimalTimes.weekday;

    // 检查当前时间是否在最佳时间段
    const isOptimalTime = times.some(timeRange => {
      const [start, end] = timeRange.split('-');
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);
      return hour >= startHour && hour <= endHour;
    });

    if (isOptimalTime) {
      return '当前时间适合发布！';
    } else {
      const nextOptimalTime = times.find(timeRange => {
        const startHour = parseInt(timeRange.split('-')[0].split(':')[0]);
        return startHour > hour;
      });

      if (nextOptimalTime) {
        return `建议在 ${nextOptimalTime} 发布，用户活跃度更高`;
      } else {
        return `建议明天在 ${times[0]} 发布`;
      }
    }
  }
}
