'use client';

import { useState } from 'react';
import { Button } from '@gitroom/react/form/button';
import { Modal } from '@gitroom/react/form/modal';

interface PublishGuideProps {
  guide: {
    title: string;
    steps: Array<{
      step: number;
      title: string;
      description: string;
      content?: string;
      images?: string[];
    }>;
    tips: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export const XiaohongshuPublishGuide: React.FC<PublishGuideProps> = ({
  guide,
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedContent, setCopiedContent] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    });
  };

  const currentStepData = guide.steps[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={guide.title}>
      <div className="max-w-4xl mx-auto">
        {/* 步骤导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {guide.steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === currentStep
                    ? 'bg-red-500 text-white'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            步骤 {currentStep + 1} / {guide.steps.length}
          </div>
        </div>

        {/* 当前步骤内容 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">
            {currentStepData.title}
          </h3>
          <p className="text-gray-700 mb-4">{currentStepData.description}</p>

          {/* 如果有内容需要复制 */}
          {currentStepData.content && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  复制以下内容到小红书：
                </span>
                <Button
                  onClick={() => copyToClipboard(currentStepData.content!)}
                  variant="secondary"
                  size="sm"
                >
                  {copiedContent ? '已复制!' : '复制内容'}
                </Button>
              </div>
              <div className="bg-white border rounded p-3 text-sm whitespace-pre-wrap">
                {currentStepData.content}
              </div>
            </div>
          )}

          {/* 如果有图片 */}
          {currentStepData.images && currentStepData.images.length > 0 && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700 block mb-2">
                处理后的图片：
              </span>
              <div className="grid grid-cols-3 gap-2">
                {currentStepData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`图片 ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between mb-6">
          <Button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            variant="secondary"
          >
            上一步
          </Button>
          <Button
            onClick={() =>
              setCurrentStep(Math.min(guide.steps.length - 1, currentStep + 1))
            }
            disabled={currentStep === guide.steps.length - 1}
          >
            下一步
          </Button>
        </div>

        {/* 发布技巧 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">💡 发布技巧</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {guide.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* 底部操作 */}
        <div className="flex justify-end mt-6 space-x-3">
          <Button onClick={onClose} variant="secondary">
            关闭指导
          </Button>
          <Button
            onClick={() => {
              // 打开小红书APP或网页版
              window.open('https://www.xiaohongshu.com', '_blank');
            }}
            className="bg-red-500 hover:bg-red-600"
          >
            打开小红书
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 发布状态组件
export const XiaohongshuPublishStatus: React.FC<{
  status: 'pending' | 'published' | 'failed';
  onShowGuide: () => void;
  onMarkAsPublished: () => void;
}> = ({ status, onShowGuide, onMarkAsPublished }) => {
  const statusConfig = {
    pending: {
      color: 'yellow',
      icon: '⏳',
      text: '等待手动发布',
      action: '查看发布指导',
    },
    published: {
      color: 'green',
      icon: '✅',
      text: '已发布',
      action: '查看发布指导',
    },
    failed: {
      color: 'red',
      icon: '❌',
      text: '发布失败',
      action: '重新查看指导',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`bg-${config.color}-50 border border-${config.color}-200 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`font-medium text-${config.color}-800`}>
            {config.text}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onShowGuide} size="sm" variant="secondary">
            {config.action}
          </Button>
          {status === 'pending' && (
            <Button onClick={onMarkAsPublished} size="sm">
              标记为已发布
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
