import { Game } from '../../../core/models/game.model';
import { createRandomPlaceholderSVG } from './placeholder';

export const GAMES_A: Game[] = [
  {
    "id": 102,
    "name": "佐尼棋",
    "originalName": "Awithlaknannai Mosona",
    "image": createRandomPlaceholderSVG(),
    "description": "一种美洲原住民祖尼人的策略游戏，是“西非跳棋”的一种变体，目标是困住对手。",
    "players": { "min": 2, "max": 2 },
    "playTime": { "min": 10, "max": 20 },
    "complexity": "Low",
    "category": "抽象策略",
    "mechanics": ["网格移动", "吃子 (围困)"],
    "tags": ["native_american", "strategy", "capture", "ancient"],
    "componentsDescription": "一个带有对角线的棋盘，类似于西非跳棋。每位玩家持有一定数量的棋子（通常是20-24个）。",
    "historicalStory": "这款游戏是北美洲西南部祖尼部落的传统游戏，其名字意为“石头移动”。它反映了在有限空间内进行围堵和反围堵的战术思想，是美洲原住民智慧的结晶。",
    "modificationSuggestion": {
      "themeSwaps": [
        "部落狩猎: 两个部落试图在峡谷中围捕猎物（对方棋子）。",
        "警察与抗议者: 警察试图将抗议者围困在一个广场中。"
      ],
      "mechanicFusions": [
        "佐尼棋 + 特殊地形: 棋盘的某些点是“圣地”，在上面的棋子不能被吃掉。",
        "佐尼棋 + 援军: 每成功围住一个对手的棋子，可以在己方底线增加一个新的棋子。"
      ]
    },
    "rules": {
      "objective": "将对手的棋子全部吃掉或使其无法移动。",
      "setup": "双方棋子交错放置在棋盘上，留出中心点为空。",
      "gameplay": "玩家轮流将一个己方棋子移动到相邻的空点。通过跳过一个对方棋子到其后的空点来吃掉它。与国际跳棋不同，吃子不是强制的。当一个玩家的棋子被完全围住无法移动时，也会被吃掉。"
    },
    "aiAnalysis": {
      "coreFun": "通过协调移动来逐步收紧包围网的战略乐趣。",
      "keyDecisions": "是选择吃子还是选择占据有利位置进行围堵。",
      "potentialFlaws": "游戏可能变得非常静态和缓慢。",
      "designImpact": "一个关于“限制”和“围困”的策略游戏。它能教会玩家理解“行动力”作为一种资源的重要性，以及如何通过空间控制来战胜对手。"
    },
    "variants": ["西非跳棋"]
  }
];