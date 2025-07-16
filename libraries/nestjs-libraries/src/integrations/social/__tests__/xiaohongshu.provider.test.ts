import { XiaohongshuProvider } from '../xiaohongshu.provider';
import { XiaohongshuDto } from '../../../dtos/posts/providers-settings/xiaohongshu.dto';

describe('XiaohongshuProvider', () => {
  let provider: XiaohongshuProvider;

  beforeEach(() => {
    provider = new XiaohongshuProvider();
  });

  describe('基础配置', () => {
    it('应该有正确的标识符和名称', () => {
      expect(provider.identifier).toBe('xiaohongshu');
      expect(provider.name).toBe('小红书');
      expect(provider.isBetweenSteps).toBe(true);
      expect(provider.scopes).toEqual([]);
    });
  });

  describe('认证流程', () => {
    it('应该生成空URL用于自定义字段处理', async () => {
      const result = await provider.generateAuthUrl();

      expect(result.url).toBe('');
      expect(result.codeVerifier).toBe('manual-auth');
      expect(result.state).toBeDefined();
    });

    it('应该返回自定义字段配置', async () => {
      const result = await provider.customFields();

      expect(result).toEqual([
        {
          key: 'username',
          label: '小红书用户名',
          defaultValue: '',
          validation: `/^.{1,}$/`,
          type: 'text',
        },
      ]);
    });

    it('应该使用有效用户名认证成功', async () => {
      const userData = { username: 'test_user' };
      const encodedData = Buffer.from(JSON.stringify(userData)).toString('base64');

      const result = await provider.authenticate({
        code: encodedData,
        codeVerifier: 'manual-auth'
      });

      expect(result).toEqual({
        id: 'xiaohongshu-test_user',
        name: '小红书 - test_user',
        accessToken: 'manual-token',
        refreshToken: '',
        expiresIn: 999999999,
        picture: '/icons/platforms/xiaohongshu.png',
        username: 'test_user',
        additionalSettings: [
          {
            title: '发布模式',
            description: '小红书采用半自动化发布，系统会为您准备好内容和图片，您需要手动完成最后的发布步骤',
            type: 'text',
            value: '半自动发布',
          },
        ],
      });
    });

    it('应该拒绝空用户名', async () => {
      const userData = { username: '' };
      const encodedData = Buffer.from(JSON.stringify(userData)).toString('base64');

      const result = await provider.authenticate({
        code: encodedData,
        codeVerifier: 'manual-auth'
      });

      expect(result).toBe('Please enter a valid username');
    });

    it('应该处理无效的认证数据', async () => {
      const result = await provider.authenticate({
        code: 'invalid-data',
        codeVerifier: 'manual-auth'
      });

      // 应该返回默认的认证结果而不是抛出错误
      expect(typeof result).toBe('object');
      expect((result as any).id).toBe('xiaohongshu-default');
      expect((result as any).name).toBe('小红书手动发布');
    });
  });

  describe('内容处理', () => {
    it('应该正确格式化基础内容', async () => {
      const postDetails = [{
        id: 'test-1',
        message: '这是一个测试内容，用来验证小红书格式化功能。',
        settings: {
          topics: ['测试', '小红书'],
          location: '北京·朝阳区',
          isCommercial: false
        } as XiaohongshuDto
      }];

      const result = await provider.post('test-id', 'manual-token', postDetails, {} as any);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-1');
      expect(result[0].status).toBe('pending-manual-publish');
      expect(result[0].publishGuide).toBeDefined();
    });

    it('应该处理商业内容', async () => {
      const postDetails = [{
        id: 'test-2',
        message: '这是商业推广内容',
        settings: {
          isCommercial: true
        } as XiaohongshuDto
      }];

      const result = await provider.post('test-id', 'manual-token', postDetails, {} as any);
      
      expect(result[0].publishGuide).toBeDefined();
      // 商业内容应该有特殊处理
    });

    it('应该处理带媒体的内容', async () => {
      const postDetails = [{
        id: 'test-3',
        message: '带图片的测试内容',
        media: [
          {
            type: 'image' as const,
            path: 'https://example.com/test.jpg',
            alt: '测试图片'
          }
        ],
        settings: {} as XiaohongshuDto
      }];

      const result = await provider.post('test-id', 'manual-token', postDetails, {} as any);

      expect(result[0].publishGuide.steps).toBeDefined();
      expect(result[0].publishGuide.steps.length).toBeGreaterThan(0);
    });
  });

  describe('发布指导生成', () => {
    it('应该生成完整的发布指导', async () => {
      const postDetails = [{
        id: 'test-4',
        message: '完整的测试内容，包含各种元素',
        settings: {
          topics: ['生活', '分享'],
          location: '上海',
          privacy: 'public' as const,
          isCommercial: false
        } as XiaohongshuDto
      }];

      const result = await provider.post('test-id', 'manual-token', postDetails, {} as any);
      const guide = result[0].publishGuide;

      expect(guide.title).toBe('小红书发布指导');
      expect(guide.steps).toHaveLength(6);
      expect(guide.tips).toBeDefined();
      expect(guide.tips.length).toBeGreaterThan(0);
      expect(guide.publishTime).toBeDefined();
      expect(guide.contentValidation).toBeDefined();
    });

    it('应该包含正确的步骤信息', async () => {
      const postDetails = [{
        id: 'test-5',
        message: '步骤测试内容',
        settings: {} as XiaohongshuDto
      }];

      const result = await provider.post('test-id', 'manual-token', postDetails, {} as any);
      const steps = result[0].publishGuide.steps;

      expect(steps[0].title).toBe('打开小红书APP');
      expect(steps[1].title).toBe('上传图片');
      expect(steps[2].title).toBe('填写标题');
      expect(steps[3].title).toBe('填写正文内容');
      expect(steps[4].title).toBe('设置发布选项');
      expect(steps[5].title).toBe('发布笔记');
    });
  });

  describe('内容验证', () => {
    it('应该验证内容长度', () => {
      // 通过反射访问私有方法进行测试
      const shortContent = '太短';
      const normalContent = '这是一个正常长度的内容，应该可以通过验证。';
      const longContent = 'a'.repeat(1001);

      // 注意：这里需要通过某种方式测试私有方法
      // 在实际项目中，可能需要将这些方法设为protected或创建测试专用的public方法
    });
  });

  describe('刷新令牌', () => {
    it('应该返回固定的令牌信息', async () => {
      const result = await provider.refreshToken();
      
      expect(result.id).toBe('xiaohongshu-manual');
      expect(result.accessToken).toBe('manual-token');
      expect(result.expiresIn).toBe(999999999);
    });
  });
});
