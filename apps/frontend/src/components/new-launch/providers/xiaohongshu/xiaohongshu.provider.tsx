'use client';

import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { XiaohongshuDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/xiaohongshu.dto';
import { Input } from '@gitroom/react/form/input';
import { Select } from '@gitroom/react/form/select';
import { Checkbox } from '@gitroom/react/form/checkbox';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { useState } from 'react';

export const XiaohongshuSettings = () => {
  const { register, watch, setValue } = useSettings();
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');

  const addTopic = () => {
    if (newTopic.trim() && topics.length < 5) {
      const updatedTopics = [...topics, newTopic.trim()];
      setTopics(updatedTopics);
      setValue('topics', updatedTopics);
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
    setValue('topics', updatedTopics);
  };

  return (
    <div className="space-y-4">
      {/* 隐私设置 */}
      <Select
        label="隐私设置"
        {...register('privacy')}
        options={[
          { value: 'public', label: '公开' },
          { value: 'friends', label: '仅好友可见' },
          { value: 'private', label: '仅自己可见' },
        ]}
      />

      {/* 话题标签 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          话题标签 (最多5个)
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="输入话题标签"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTopic();
              }
            }}
          />
          <button
            type="button"
            onClick={addTopic}
            disabled={!newTopic.trim() || topics.length >= 5}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              #{topic}#
              <button
                type="button"
                onClick={() => removeTopic(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 位置信息 */}
      <Input
        label="位置信息 (可选)"
        placeholder="例如：北京·朝阳区"
        {...register('location')}
      />

      {/* 内容分类 */}
      <Select
        label="内容分类"
        {...register('category')}
        options={[
          { value: 'lifestyle', label: '生活方式' },
          { value: 'beauty', label: '美妆护肤' },
          { value: 'fashion', label: '时尚穿搭' },
          { value: 'food', label: '美食探店' },
          { value: 'travel', label: '旅行攻略' },
          { value: 'tech', label: '科技数码' },
          { value: 'other', label: '其他' },
        ]}
      />

      {/* 商业内容标记 */}
      <Checkbox
        label="标记为商业内容"
        description="如果这是广告或商业合作内容，请勾选此项"
        {...register('isCommercial')}
      />

      {/* 发布提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">📱 发布提示</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 小红书需要手动发布，系统会为您准备好内容和图片</li>
          <li>• 建议发布时间：工作日19-22点，周末14-16点和19-22点</li>
          <li>• 图片建议使用正方形或3:4比例，最多9张</li>
          <li>• 标题要吸引人，可以使用数字、疑问句、感叹号</li>
        </ul>
      </div>
    </div>
  );
};

export const XiaohongshuComment: PostComment = () => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {/* TODO: 添加小红书官方图标到 /apps/frontend/public/icons/platforms/xiaohongshu.png */}
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
            小
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-red-800 mb-2">小红书发布说明</h4>
          <div className="text-sm text-red-700 space-y-2">
            <p>
              小红书采用半自动化发布模式。系统会为您：
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>优化内容格式，添加适合小红书的emoji和标签</li>
              <li>处理图片尺寸和格式，确保符合平台要求</li>
              <li>生成详细的发布指导，包括步骤说明</li>
              <li>提供最佳发布时间建议</li>
            </ul>
            <p className="font-medium">
              您需要在手机上打开小红书APP，按照指导完成最后的发布步骤。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withProvider(
  XiaohongshuSettings,
  XiaohongshuComment,
  XiaohongshuDto,
  undefined,
  2000
);
