/**
 * 小红书集成使用示例
 * 
 * 这个文件展示了如何在Postiz中使用小红书集成功能
 */

import { XiaohongshuDto } from '../libraries/nestjs-libraries/src/dtos/posts/providers-settings/xiaohongshu.dto';

// 示例1: 基础生活分享内容
export const lifestylePostExample = {
  content: `今天分享一个超实用的护肤小技巧！
  
最近发现了一个让皮肤水嫩的秘密，就是在护肤的最后一步，用手轻拍面部30秒。

这样做可以：
✨ 促进血液循环
✨ 帮助护肤品更好吸收  
✨ 让肌肤更有光泽

坚持一周就能看到明显效果哦！`,
  
  settings: {
    topics: ['护肤技巧', '美容分享', '生活小窍门'],
    location: '北京·朝阳区',
    privacy: 'public',
    isCommercial: false,
    category: 'beauty'
  } as XiaohongshuDto,
  
  media: [
    {
      type: 'image' as const,
      path: '/examples/skincare-before.jpg',
      alt: '护肤前后对比'
    },
    {
      type: 'image' as const,
      path: '/examples/skincare-products.jpg', 
      alt: '使用的护肤品'
    }
  ]
};

// 示例2: 美食探店内容
export const foodPostExample = {
  content: `探店｜这家隐藏在胡同里的小店太惊艳了！

📍 地址：东城区南锣鼓巷xx号
💰 人均：80-120元
⭐ 推荐指数：5星

必点菜品：
🍜 招牌牛肉面 - 汤头浓郁，面条劲道
🥟 手工饺子 - 皮薄馅大，一口一个
🥬 凉拌黄瓜 - 清爽解腻，完美配菜

环境很有老北京的味道，服务员也特别热情。强烈推荐给喜欢传统美食的朋友们！`,

  settings: {
    topics: ['美食探店', '北京美食', '传统小吃', '胡同美食'],
    location: '北京·东城区·南锣鼓巷',
    privacy: 'public',
    isCommercial: false,
    category: 'food'
  } as XiaohongshuDto,

  media: [
    {
      type: 'image' as const,
      path: '/examples/restaurant-exterior.jpg',
      alt: '餐厅外观'
    },
    {
      type: 'image' as const,
      path: '/examples/beef-noodles.jpg',
      alt: '招牌牛肉面'
    },
    {
      type: 'image' as const,
      path: '/examples/dumplings.jpg',
      alt: '手工饺子'
    }
  ]
};

// 示例3: 商业推广内容
export const commercialPostExample = {
  content: `种草｜这款面膜真的太好用了！

作为一个敏感肌，我对面膜的要求特别高。这款xx品牌的玻尿酸面膜真的让我惊喜：

✅ 温和不刺激，敏感肌也能用
✅ 补水效果超棒，用完脸蛋水嫩嫩
✅ 性价比很高，学生党也能承受

使用感受：
质地很轻薄，贴合度很好，15分钟后撕下来脸部明显有光泽。连续用了一周，皮肤状态明显改善。

现在有活动价，需要的姐妹们可以冲了！`,

  settings: {
    topics: ['面膜推荐', '护肤种草', '敏感肌护肤'],
    location: '上海·静安区',
    privacy: 'public',
    isCommercial: true, // 标记为商业内容
    category: 'beauty'
  } as XiaohongshuDto,

  media: [
    {
      type: 'image' as const,
      path: '/examples/mask-product.jpg',
      alt: '面膜产品图'
    },
    {
      type: 'image' as const,
      path: '/examples/mask-usage.jpg',
      alt: '使用效果图'
    }
  ]
};

// 示例4: 旅行攻略内容
export const travelPostExample = {
  content: `三天两夜杭州游攻略｜人均800元玩转西湖！

刚从杭州回来，整理了一份超详细的攻略分享给大家～

🚄 交通：高铁往返 约300元
🏨 住宿：西湖附近民宿 200元/晚
🍽️ 餐饮：人均50元/餐

📍 必去景点：
Day1: 西湖十景 → 雷峰塔 → 南宋御街
Day2: 灵隐寺 → 飞来峰 → 河坊街  
Day3: 千岛湖一日游

💡 省钱小贴士：
• 很多景点免费，只需要预约
• 可以租共享单车环湖，很方便
• 当地小吃性价比很高

总体来说，杭州真的是一个很适合周末游的城市，风景美，消费也不高！`,

  settings: {
    topics: ['杭州旅游', '周末游', '旅行攻略', '省钱攻略'],
    location: '杭州·西湖区',
    privacy: 'public',
    isCommercial: false,
    category: 'travel'
  } as XiaohongshuDto,

  media: [
    {
      type: 'image' as const,
      path: '/examples/west-lake.jpg',
      alt: '西湖美景'
    },
    {
      type: 'image' as const,
      path: '/examples/travel-itinerary.jpg',
      alt: '行程安排'
    },
    {
      type: 'image' as const,
      path: '/examples/local-food.jpg',
      alt: '当地美食'
    }
  ]
};

// 示例5: 科技数码内容
export const techPostExample = {
  content: `数码测评｜这款蓝牙耳机真的值得入手吗？

最近入手了这款xx品牌的降噪耳机，用了两周来给大家分享一下真实感受：

🎧 音质表现：8/10
低音浑厚，高音清亮，适合听流行和古典音乐

🔇 降噪效果：9/10  
主动降噪很强，地铁上基本听不到外界噪音

🔋 续航能力：7/10
官方说30小时，实际使用大概25小时左右

💰 性价比：8/10
这个价位段算是很不错的选择

总结：如果你经常通勤或者对音质有要求，这款耳机还是很推荐的！`,

  settings: {
    topics: ['数码测评', '蓝牙耳机', '科技分享'],
    privacy: 'public',
    isCommercial: false,
    category: 'tech'
  } as XiaohongshuDto,

  media: [
    {
      type: 'image' as const,
      path: '/examples/headphones.jpg',
      alt: '蓝牙耳机外观'
    },
    {
      type: 'image' as const,
      path: '/examples/headphones-detail.jpg',
      alt: '耳机细节图'
    }
  ]
};

// 使用示例函数
export function createXiaohongshuPost(content: string, settings: XiaohongshuDto, media?: any[]) {
  return {
    integration: {
      id: 'xiaohongshu-integration-id'
    },
    value: [{
      content,
      image: media || []
    }],
    settings: {
      __type: 'xiaohongshu',
      ...settings
    }
  };
}

// 批量发布示例
export const batchPostsExample = [
  lifestylePostExample,
  foodPostExample,
  travelPostExample
].map((example, index) => ({
  ...createXiaohongshuPost(example.content, example.settings, example.media),
  scheduledTime: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000) // 每天发布一篇
}));
