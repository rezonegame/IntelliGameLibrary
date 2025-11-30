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
  },
  {
    "id": 107,
    "name": "四分牌",
    "originalName": "All Fours",
    "image": createRandomPlaceholderSVG(),
    "description": "一款经典的英国吃墩游戏，玩家通过赢得包含高价值牌的墩来为“高”、“低”、“杰克”和“牌局”这四项计分。",
    "players": { "min": 2, "max": 4 },
    "playTime": { "min": 20, "max": 30 },
    "complexity": "Medium",
    "category": "卡牌游戏",
    "mechanics": ["吃墩", "计分"],
    "tags": ["card_game", "trick_taking", "classic", "england"],
    "componentsDescription": "一副标准的52张扑克牌。",
    "historicalStory": "“四分牌”（All Fours）起源于17世纪的英国，是历史上最古老和最具影响力的吃墩游戏之一。它的独特计分系统（为最高的王牌、最低的王牌、王牌J和赢得墩中牌面总点数高者计分）是其核心创新，深刻影响了后来的许多卡牌游戏，特别是在美国。",
    "modificationSuggestion": {
      "themeSwaps": [
        "海盗夺宝：玩家是海盗，通过赢得战斗（吃墩）来夺取“最高的宝藏”、“最低的宝藏”、“船长”（J）和“最多的金币”（牌局）。",
        "宫廷竞争：贵族通过赢得辩论来获得“国王的青睐”（高）、“人民的支持”（低）、“小丑的帮助”（J）和“最多的影响力”（牌局）。"
      ],
      "mechanicFusions": [
        "四分牌 + 动态王牌：每轮的王牌不是固定的，而是由第一个无法跟牌的玩家所出的牌的花色决定。",
        "四分牌 + 任务卡：每轮开始时，会有一张任务卡，为特定牌（例如“赢得红心Q”）提供额外的分数奖励。"
      ]
    },
    "rules": {
      "objective": "通过吃墩为四个项目（最高王牌、最低王牌、王牌J、牌局总点数）来获得分数，成为第一个达到目标分数的玩家。",
      "setup": "每位玩家发6张牌。翻开一张牌作为王牌。",
      "gameplay": "玩家轮流出牌，必须跟牌。如果无法跟牌，可以出王牌或垫牌。赢得墩的玩家收集这些牌。一轮结束后，根据谁拥有最高的王牌、最低的王牌、王牌J以及谁赢得的牌面总点数最高来计分。"
    },
    "aiAnalysis": {
      "coreFun": "在吃墩的过程中，有选择性地争夺不同的计分项，充满战术灵活性。",
      "keyDecisions": "决定何时使用王牌，是争夺一个包含J的墩，还是为了凑够牌局总点数而赢得一个看似不重要的墩。",
      "potentialFlaws": "计分方式对新手来说可能有些不直观。",
      "designImpact": "一个展示了多重计分目标如何丰富吃墩游戏策略的绝佳例子。它能锻炼玩家的目标管理能力和在不同收益间进行权衡的决策能力。"
    },
    "variants": ["七点牌"]
  }
];
