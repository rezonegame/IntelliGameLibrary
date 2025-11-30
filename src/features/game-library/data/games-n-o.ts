import { Game } from '../../../core/models/game.model';
import { createRandomPlaceholderSVG } from './placeholder';

export const GAMES_N_O: Game[] = [
  {
    "id": 109,
    "name": "打单身汉",
    "originalName": "Old Maid",
    "image": createRandomPlaceholderSVG(),
    "description": "一款简单的儿童卡牌游戏，玩家通过配对并丢弃成对的牌，目标是避免最后持有那张无法配对的“单身汉”牌。",
    "players": { "min": 2, "max": 8 },
    "playTime": { "min": 5, "max": 15 },
    "complexity": "Very Low",
    "category": "卡牌游戏",
    "mechanics": ["组合收集", "运气"],
    "tags": ["card_game", "kids", "luck", "shedding", "party"],
    "componentsDescription": "一副特殊的“打单身汉”牌，或者一副标准的52张扑克牌，移除一张Q，剩下的一张Q即为“单身汉”。",
    "historicalStory": "“打单身汉”是一款在维多利亚时代非常流行的客厅游戏，以其简单和社交性而闻名。游戏的乐趣不在于争当赢家，而在于避免成为唯一的输家——那个拿到最后一张“老处女”牌的人。这种“烫手山芋”式的机制，使其成为儿童派对和家庭聚会中的常青树。",
    "modificationSuggestion": {
      "themeSwaps": [
        "躲避捣蛋鬼：牌是各种精灵，其中一张是“捣蛋鬼”。玩家需要避免最后拿到捣蛋鬼牌。",
        "寻宝游戏：牌是成对的宝藏，一张是“假宝藏”。玩家需要避免最后拿到假宝藏。",
        "动物园逃脱：所有动物都成对逃走了，只有一只“走失的企鹅”没有配对。"
      ],
      "mechanicFusions": [
        "打单身汉 + 特殊能力：某些配对的牌（例如一对K）在被打出时，可以触发特殊效果，例如“指定一位玩家，与他交换一张牌”。",
        "打单身汉 + 吹牛：当向对手抽牌时，你可以宣称“我抽的不是单身汉！”，即使你抽到了。如果对手不相信并挑战你，而你确实没抽到，对手就要多抽一张牌。"
      ]
    },
    "rules": {
      "objective": "将手中的牌全部配对打出，避免成为最后一个持有“单身汉”牌的玩家。",
      "setup": "将一副移除了单张Q的牌全部发给玩家。玩家检查手中的牌，将所有可以配对的牌（点数相同）打出。",
      "gameplay": "玩家轮流从左边（或右边）的对手手中盲抽一张牌。如果抽到的牌可以与自己手中的牌配对，则将这对牌打出。游戏继续，直到所有牌都已配对，只剩下一个玩家手中拿着那张无法配对的“单身汉”牌。"
    },
    "aiAnalysis": {
      "coreFun": "简单、充满悬念的社交互动，以及“捉弄”输家的乐趣。",
      "keyDecisions": "从对手手中抽哪张牌（纯粹猜测），以及如何通过表情管理来隐藏自己是否持有“单身汉”牌。",
      "potentialFlaws": "毫无策略，纯粹是运气和简单的心理游戏。",
      "designImpact": "一款展示了“避免失败”也可以作为核心驱动力的游戏。它能极好地锻炼儿童的社交能力、轮流概念和基础的配对技巧。"
    },
    "variants": []
  }
];
