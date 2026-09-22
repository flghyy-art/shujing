import { indexChapters } from "./chapter-index";
import { defaultLook } from "./look";
import type { Project } from "./types";

export const SAMPLE_NOVEL = `修车铺

第1章 刮花

雨是从晚饭后开始下的。林夏把卷帘门拉到一人高，任积水从坡道往店里渗。墙上的工具按尺寸排好，日光灯管跳了两下，终于稳住。

一辆白色玛莎拉蒂压着水声停在门口。车门开，下来的男人把伞递给司机，自己却不撑。顾衡，二十六岁，顾氏集团少东家，大衣领竖着，头发被雨打湿，贴在额上。

「左前杠。你们这种店，能补进口漆吗？」

林夏看了一眼刮痕，不深，漆没见底。「能。」

顾衡笑了一下，不像笑：「别把我的车弄得更难看。修不好，原价赔。」

第2章 机油

林夏没争。她换上手套，把车开上举升机，动线干净得不像这个铺子该有的。顾衡靠在门边刷手机，偶尔抬眼，看见她把刮痕周围的漆面打磨得像做手术。

「你以前在 4S 店干过？」

「没有。」

手机震。顾衡接起来，声音立刻软了：「爸，我在外面。董事会？今晚？我马上——」

他看见林夏正用食指抹过补好的漆面，检查反光。那双手不像修车的，像在认一块自己很熟的材料。

第3章 电话

店门外又停了一辆车。下来的人没打伞，进门就鞠躬，雨水从西装下摆往下滴。

「林总。」助理把文件夹递到她手里，不敢看顾衡，「董事会的人已经到了。顾董说，今晚必须您到场，股权表决不能缺席。」

顾衡手里的电话还没挂。他看着林夏，又看着助理，喉结滚了一下。

林夏摘手套，指节上还沾着一点机油。「顾少，你父亲三年前把控股权转给我的时候，你在国外读书。这间铺子是我自己的。车，十分钟后可以开走。」

第4章 钥匙

雨小了。林夏把钥匙抛给顾衡，他手忙脚乱接住。

「左前杠的漆，我调过了，明天再看色差。下次刮花，还来。」

她拉高衣领，走进雨里。顾衡站在店门口，手机里父亲还在说话。日光灯管又跳了一下。白色轿车安静地停着，像什么都没发生过。`;

const episodeId = "EP01";

export function createSampleProject(): Project {
  const now = Date.now();
  const chapters = indexChapters(SAMPLE_NOVEL);
  return {
    id: "sample-garage",
    createdAt: now,
    updatedAt: now,
    isSample: true,
    novel: { title: "修车铺", text: SAMPLE_NOVEL, chapters },
    look: defaultLook(),
    triage: {
      verdict: "worth",
      densityNote:
        "四章都落在可见动作上：进店、修车、亮身份、抛钥匙。几乎没有需要改写成画面的长段心理。横屏电影感现实剧的标准密度。",
      screenReady: [
        "雨夜卷帘门与白色跑车的建立镜头",
        "顾衡羞辱与林夏只回一个字",
        "举升机上的手部特写",
        "助理鞠躬叫林总",
        "抛钥匙离场",
      ],
      proseOnly: ["顾衡电话里的董事会信息，需压成一句可听对白", "三年前股权转让，用一句台词落地即可"],
      openingReplace: "直接从雨夜卷帘门拉起切到车停门口，不要从林夏晚饭写起。",
      productionLoad: "中。一场雨夜室内、一辆白车、三人。夜雨与补漆是主要制作负担。",
      recommendation: "值得拆。核心反转可压进一集 45–60 秒，三场戏足够。不必扩季。",
    },
    development: {
      engine: "身份错位：被轻视的修理工才是控股人。每一场都让顾衡的判断更错，最后用可见的鞠躬把代价拍出来。",
      directorNote:
        "冷静、短句、少配乐。羞辱要轻，反转才重。林夏几乎不解释，只做事。雨是贯穿的声音层。",
      genre: "都市打脸 / 身份反转",
      episodes: [
        {
          id: episodeId,
          number: 1,
          title: "修车铺的夜晚",
          logline: "少东家雨夜进店羞辱女修理工，直到助理进门叫她林总。",
          dramaticResult: "顾衡的世界翻转；林夏把修好的车还给他，自己走进雨里。",
          sourceSpan: "第1–4章",
          hook: "「你们这种店，能补进口漆吗？」",
        },
      ],
    },
    currentEpisodeId: episodeId,
    episodeWork: {
      [episodeId]: {
        brief: {
          id: episodeId,
          number: 1,
          title: "修车铺的夜晚",
          logline: "少东家雨夜进店羞辱女修理工，直到助理进门叫她林总。",
          dramaticResult: "顾衡的世界翻转；林夏把修好的车还给他，自己走进雨里。",
          sourceSpan: "第1–4章",
          hook: "「你们这种店，能补进口漆吗？」",
        },
        script: {
          episodeId,
          title: "修车铺的夜晚",
          durationHint: "约 50 秒 / 三场",
          scenes: [
            {
              id: "SC001",
              heading: "内 / 修车铺 / 夜",
              time: "夜·雨",
              location: "修车铺",
              action:
                "卷帘门拉到一人高。积水从坡道渗入。白色玛莎拉蒂停在门口。顾衡把伞扔给司机，自己淋着走进来。林夏看左前杠刮痕。",
              dialogue: [
                { character: "顾衡", line: "左前杠。你们这种店，能补进口漆吗？" },
                { character: "林夏", line: "能。" },
                { character: "顾衡", line: "修不好，原价赔。" },
              ],
            },
            {
              id: "SC002",
              heading: "内 / 修车铺 / 夜",
              time: "夜·雨",
              location: "修车铺",
              action:
                "林夏戴手套，把车开上举升机，打磨刮痕。顾衡靠门刷手机。电话响，他接起来，声音变软。他看见林夏用指腹检查漆面反光。",
              dialogue: [
                { character: "顾衡", line: "你以前在 4S 店干过？" },
                { character: "林夏", line: "没有。" },
                { character: "顾衡", line: "爸，我在外面。董事会？今晚？我马上——" },
              ],
            },
            {
              id: "SC003",
              heading: "内 / 修车铺门口 / 夜",
              time: "夜·雨小",
              location: "修车铺",
              action:
                "助理没打伞进门，鞠躬，把文件夹递给林夏。顾衡电话未挂。林夏摘手套，指节沾机油。她把钥匙抛给顾衡，拉高衣领走进雨里。",
              dialogue: [
                { character: "助理", line: "林总。董事会的人已经到了。股权表决不能缺席。" },
                {
                  character: "林夏",
                  line: "顾少，你父亲三年前把控股权转给我的时候，你在国外读书。车，十分钟后可以开走。",
                },
                { character: "林夏", line: "下次刮花，还来。" },
              ],
            },
          ],
        },
        assets: {
          characters: [
            {
              id: "CHAR-林夏",
              name: "林夏",
              age: "28",
              identity: "隐名控股股东 / 修车铺老板",
              look: "短黑发及耳，眉眼冷静，指节有薄茧，左食指常有机油。",
              wardrobe: "深蓝工装外套，灰T恤，黑色工装裤，短靴。本集不换装。",
              continuityLock: "深蓝工装 + 短黑发及耳 + 指节机油。不得换成长发或高跟鞋。",
            },
            {
              id: "CHAR-顾衡",
              name: "顾衡",
              age: "26",
              identity: "顾氏集团少东家",
              look: "湿发贴额，下颌线清楚，神情先倨后乱。",
              wardrobe: "黑色高定大衣，白衬衫，无伞，肩背被雨打湿。本集不换装。",
              continuityLock: "黑色大衣 + 湿发贴额。进门后肩背持续潮湿。",
            },
            {
              id: "CHAR-助理",
              name: "助理",
              age: "40 出头",
              identity: "顾董助理",
              look: "瘦，眼镜被雨雾住，神情恭敬到不敢抬头。",
              wardrobe: "深灰西装，无伞，下摆滴水。",
              continuityLock: "深灰西装湿透 + 鞠躬姿态。不得写成保镖体型。",
            },
          ],
          locations: [
            {
              id: "LOC-铺",
              name: "修车铺",
              description: "单间街边铺，卷帘门、工具墙、举升机、日光灯管微跳。",
              lighting: "冷白日光灯为主，门口霓虹漏进一层品红。",
              views: ["门外雨坡", "门内过肩看车", "举升机底部", "工具墙特写"],
              continuityLock: "卷帘门只拉到一人高。灯管允许跳一下，不得换成暖黄天花灯。",
            },
            {
              id: "LOC-街",
              name: "铺前街道",
              description: "湿沥青、倒影、对面关着的餐饮店招。",
              lighting: "雨夜霓虹，低色温路灯。",
              views: ["对街建立", "车头低机位"],
              continuityLock: "始终下雨，后半场雨势减小但不停。",
            },
          ],
          props: [
            {
              id: "PROP-车",
              name: "白色玛莎拉蒂",
              description: "白色轿跑，左前杠一道不深的刮痕。",
              state: "进店带刮痕 → 补漆后湿润反光。",
              continuityLock: "白色，左前杠刮痕在 SC001–SC002 可见，SC003 已补。",
            },
            {
              id: "PROP-钥匙",
              name: "车钥匙",
              description: "原厂钥匙，黑色，金属环。",
              state: "林夏抛出，顾衡手忙脚乱接住。",
              continuityLock: "不得换成智能卡或远程钥匙灯光秀。",
            },
            {
              id: "PROP-手套",
              name: "丁腈手套",
              description: "蓝色一次性手套。",
              state: "SC002 戴上，SC003 摘下，指节留机油。",
              continuityLock: "蓝色丁腈，不是棉手套。",
            },
          ],
        },
        storyboard: [
          {
            id: "SHOT-001",
            sceneId: "SC001",
            title: "雨夜铺面建立",
            scale: "全景",
            camera: "缓慢横移",
            durationSec: 6,
            purpose: "地理与天气，横屏从街面滑到卷帘门。",
            startFrame: "雨落在湿沥青与店招倒影。",
            endFrame: "卷帘门一人高，店内冷白灯光漏出。",
            action: "镜头沿湿沥青横移，停在门洞。",
          },
          {
            id: "SHOT-002",
            sceneId: "SC001",
            title: "白车入画",
            scale: "中全",
            camera: "低机位跟入",
            durationSec: 5,
            purpose: "车作为权力道具进场。",
            startFrame: "白色车头灯切开雨帘。",
            endFrame: "车停稳，左前杠刮痕可辨。",
            action: "车压着水声驶入门前，停。",
          },
          {
            id: "SHOT-003",
            sceneId: "SC001",
            title: "顾衡进门",
            scale: "中近",
            camera: "手持",
            durationSec: 4,
            purpose: "湿发、不撑伞、倨。",
            startFrame: "车门开，伞被甩给画外司机。",
            endFrame: "他踏进门洞，肩背全湿。",
            action: "顾衡下车，不看修车铺，只看自己的车。",
            dialogue: "左前杠。你们这种店，能补进口漆吗？",
          },
          {
            id: "SHOT-004",
            sceneId: "SC001",
            title: "对峙过肩",
            scale: "过肩",
            camera: "锁机",
            durationSec: 5,
            purpose: "权力轴：他高她低，稍后会反转。",
            startFrame: "从林夏肩后看顾衡。",
            endFrame: "林夏只回一个字。",
            action: "林夏看刮痕，点头。",
            dialogue: "能。",
          },
          {
            id: "SHOT-005",
            sceneId: "SC002",
            title: "补漆手术",
            scale: "特写",
            camera: "插入",
            durationSec: 6,
            purpose: "手是她的身份证据。",
            startFrame: "蓝手套按住砂纸。",
            endFrame: "指腹抹过湿润漆面，反光均匀。",
            action: "打磨、补漆、检查反光，动作无废。",
          },
          {
            id: "SHOT-006",
            sceneId: "SC002",
            title: "电话变声",
            scale: "中景",
            camera: "手持",
            durationSec: 5,
            purpose: "同一张脸，对外强硬，对父亲软。",
            startFrame: "顾衡靠门刷手机。",
            endFrame: "听筒贴耳，眼神飘向林夏的手。",
            action: "电话响，他接，声音立刻软下来。",
            dialogue: "爸，我在外面。董事会？今晚？我马上——",
          },
          {
            id: "SHOT-007",
            sceneId: "SC003",
            title: "助理鞠躬",
            scale: "中全",
            camera: "跟入",
            durationSec: 4,
            purpose: "反转的第一记可见动作。",
            startFrame: "门洞外一个湿透的西装。",
            endFrame: "九十度鞠躬，文件夹递向林夏。",
            action: "助理进门，不看顾衡。",
            dialogue: "林总。董事会的人已经到了。",
          },
          {
            id: "SHOT-008",
            sceneId: "SC003",
            title: "摘手套",
            scale: "特写",
            camera: "锁机",
            durationSec: 3,
            purpose: "机油指纹，身份落地的物件。",
            startFrame: "蓝手套往下褪。",
            endFrame: "指节一点机油，停在画面中心。",
            action: "林夏摘手套，不擦那点油。",
          },
          {
            id: "SHOT-009",
            sceneId: "SC003",
            title: "亮身份",
            scale: "过肩反打",
            camera: "缓慢推",
            durationSec: 8,
            purpose: "把三年股权变成一句，不解释。",
            startFrame: "顾衡失焦的脸，电话还在耳边。",
            endFrame: "推到林夏眼睛。",
            action: "她把文件夹夹在腋下，看他。",
            dialogue: "顾少，你父亲三年前把控股权转给我的时候，你在国外读书。车，十分钟后可以开走。",
          },
          {
            id: "SHOT-010",
            sceneId: "SC003",
            title: "抛钥匙离场",
            scale: "中全到背影",
            camera: "跟出",
            durationSec: 6,
            purpose: "她把空间还给雨，他留在门洞。",
            startFrame: "钥匙在空中。",
            endFrame: "林夏背影走进雨里，白车停着。",
            action: "抛钥匙，顾衡手忙脚乱接住。她拉衣领出门。",
            dialogue: "下次刮花，还来。",
          },
        ],
        imagePrompts: [
          {
            id: "IMG-LOOKDEV",
            kind: "lookdev",
            title: "风格帧 · 雨夜铺面",
            subject: "rain-soaked Chinese street garage at night, widescreen cinematic frame",
            wardrobe: "",
            setting:
              "half-open roller shutter, cold fluorescent spill, neon magenta leak from a neighboring sign, white coupe nose in puddle reflections",
            lighting: "practical fluorescent plus neon bounce, wet highlights, no moonlight",
            composition: "top-heavy rain, shutter as a horizontal cut, human-scale doorway",
            notes: "本张锁定全片光线与材质，后续角色图必须能贴进这个空间。",
          },
          {
            id: "IMG-林夏",
            kind: "character",
            title: "角色板 · 林夏",
            subject:
              "Chinese woman 28, short black hair to ears, calm eyes, thin calluses, a speck of engine oil on left index knuckle, standing three-quarter",
            wardrobe: "deep navy mechanic jacket, grey tee, black work pants, short boots",
            setting: "inside the garage, tool wall softly behind",
            lighting: "cool fluorescent key, faint magenta rim from the doorway",
            composition: "widescreen character portrait, face and hands readable, not a fashion pose",
            notes: "连续性锁：短发及耳、深蓝工装、指节机油。",
          },
          {
            id: "IMG-顾衡",
            kind: "character",
            title: "角色板 · 顾衡",
            subject:
              "Chinese man 26, wet hair stuck to forehead, sharp jaw, arrogant then unsettled, rain on black coat",
            wardrobe: "black tailored coat, white shirt, no umbrella, shoulders soaked",
            setting: "doorway of the garage, rain behind him",
            lighting: "edge light from shop interior, rain highlights on coat",
            composition: "widescreen, head-to-thigh, wet texture on wool",
            notes: "连续性锁：黑大衣、湿发贴额、肩背潮湿。",
          },
          {
            id: "IMG-铺",
            kind: "location",
            title: "场景 · 修车铺",
            subject: "single-bay street garage interior",
            wardrobe: "",
            setting:
              "roller shutter raised to head height, organized tool wall, hydraulic lift, flickering tube light, puddle on concrete",
            lighting: "cold white tubes, magenta neon leak at the door",
            composition: "widescreen, shutter on the left third, lift in midground",
            notes: "灯管可微跳，不换暖黄天花。",
          },
          {
            id: "IMG-车",
            kind: "prop",
            title: "道具 · 白车左前杠",
            subject: "white luxury coupe front-left bumper with a shallow scratch, paint not through",
            wardrobe: "",
            setting: "wet concrete, fluorescent reflection on bodywork",
            lighting: "hard practical on wet paint",
            composition: "tactile insert, scratch readable, no license plate text",
            notes: "不要写真实车牌号。刮痕不深。",
          },
          {
            id: "IMG-钥匙",
            kind: "prop",
            title: "道具 · 车钥匙",
            subject: "OEM black car key with metal ring, in mid-air between two hands",
            wardrobe: "",
            setting: "garage interior bokeh",
            lighting: "small specular on metal",
            composition: "extreme close-up, key sharp, hands implied",
            notes: "不是智能卡，不是发光钥匙。",
          },
        ],
        videoPrompts: [
          {
            id: "MOTION-001",
            shotId: "SHOT-001",
            title: "雨夜铺面建立",
            durationSec: 6,
            cameraMove: "slow lateral drift along wet asphalt, settle on the half-open shutter",
            subject: "empty street and the garage mouth, no faces yet",
            action: "rain falls; water runs down the ramp into the shop",
            setting: "night street garage, neon and fluorescent mix",
            lighting: "wet reflections, cold interior spill",
            startState: "looking at rain on asphalt",
            endState: "framed on the one-person-high shutter opening",
            audio: "rain, distant traffic, a tube light ticking once",
          },
          {
            id: "MOTION-002",
            shotId: "SHOT-002",
            title: "白车入画",
            durationSec: 5,
            cameraMove: "low tracking as the coupe noses in and stops",
            subject: "white luxury coupe",
            action: "car rolls through puddles and stops; left bumper scratch becomes readable",
            setting: "in front of the garage",
            lighting: "headlights cutting rain",
            startState: "headlights approaching through rain",
            endState: "car parked, scratch visible on left front bumper",
            audio: "tires on water, engine settling",
          },
          {
            id: "MOTION-003",
            shotId: "SHOT-003",
            title: "顾衡进门",
            durationSec: 4,
            cameraMove: "handheld follow from car door into the threshold",
            subject: "Gu Heng, wet hair, black coat, no umbrella",
            action: "he tosses the umbrella off-screen, steps into the shop without looking at Lin Xia",
            setting: "car to doorway",
            lighting: "rain highlights on wool, shop fluorescent ahead",
            startState: "car door opening",
            endState: "he stands inside, shoulders soaked",
            dialogue: "左前杠。你们这种店，能补进口漆吗？",
            audio: "rain, door thud, his line in Mandarin, lip-sync",
          },
          {
            id: "MOTION-004",
            shotId: "SHOT-004",
            title: "对峙过肩",
            durationSec: 5,
            cameraMove: "locked-off over Lin Xia's shoulder",
            subject: "Gu Heng facing camera, Lin Xia's shoulder in foreground",
            action: "she glances at the scratch and answers with one word",
            setting: "inside garage",
            lighting: "cool key on his face",
            startState: "two-shot over her shoulder",
            endState: "her head tilts a millimeter, still",
            dialogue: "能。",
            audio: "rain under, her single word, no score",
          },
          {
            id: "MOTION-005",
            shotId: "SHOT-005",
            title: "补漆手术",
            durationSec: 6,
            cameraMove: "static insert, tiny push at the end",
            subject: "Lin Xia's gloved hands on the bumper",
            action: "sand, fill, wipe, check the reflection with a fingertip",
            setting: "at the hydraulic lift",
            lighting: "hard practical on wet paint",
            startState: "blue nitrile glove on sandpaper",
            endState: "even reflection on the repaired patch",
            audio: "sanding, rain, no dialogue",
          },
          {
            id: "MOTION-006",
            shotId: "SHOT-006",
            title: "电话变声",
            durationSec: 5,
            cameraMove: "handheld medium, drift toward his ear then his eyeline",
            subject: "Gu Heng against the door frame",
            action: "phone rings; he answers; his voice softens; his eyes find her hands",
            setting: "garage doorway",
            lighting: "mixed neon and fluorescent",
            startState: "scrolling on his phone",
            endState: "phone to ear, looking at her hands",
            dialogue: "爸，我在外面。董事会？今晚？我马上——",
            audio: "ringtone cut, his line, rain",
          },
          {
            id: "MOTION-007",
            shotId: "SHOT-007",
            title: "助理鞠躬",
            durationSec: 4,
            cameraMove: "follow the assistant in, stop when he bows",
            subject: "middle-aged assistant in a soaked grey suit",
            action: "enters without umbrella, bows ninety degrees, offers a folder to Lin Xia",
            setting: "from rain into the shop",
            lighting: "backlit by rain and neon",
            startState: "silhouette in the shutter opening",
            endState: "bow held, folder toward Lin Xia",
            dialogue: "林总。董事会的人已经到了。",
            audio: "footsteps in water, his line, rain",
          },
          {
            id: "MOTION-008",
            shotId: "SHOT-008",
            title: "摘手套",
            durationSec: 3,
            cameraMove: "locked-off extreme close-up",
            subject: "Lin Xia's hands",
            action: "she peels off the blue glove; a speck of oil stays on the knuckle",
            setting: "mid-shop, lift blurred",
            lighting: "cool key, oil slightly glossy",
            startState: "gloved hand",
            endState: "bare knuckle with engine oil, held",
            audio: "glove snap, rain",
          },
          {
            id: "MOTION-009",
            shotId: "SHOT-009",
            title: "亮身份",
            durationSec: 8,
            cameraMove: "slow dolly toward Lin Xia's eyes past Gu Heng's out-of-focus face",
            subject: "Lin Xia, folder under her arm; Gu Heng still on the phone",
            action: "she delivers the ownership line without raising her voice",
            setting: "center of the garage",
            lighting: "fluorescent, rain backlight at door",
            startState: "his stunned face in the foreground",
            endState: "her eyes sharp and still",
            dialogue:
              "顾少，你父亲三年前把控股权转给我的时候，你在国外读书。车，十分钟后可以开走。",
            audio: "her line, faint father voice in the phone, rain",
          },
          {
            id: "MOTION-010",
            shotId: "SHOT-010",
            title: "抛钥匙离场",
            durationSec: 6,
            cameraMove: "follow the key then follow her out to a back view",
            subject: "key in air, then Lin Xia walking into rain",
            action: "she tosses the key; he fumbles the catch; she raises her collar and leaves",
            setting: "garage to street",
            lighting: "shop light behind her, rain in front",
            startState: "key leaving her hand",
            endState: "her back in the rain, white car still, he in the doorway",
            dialogue: "下次刮花，还来。",
            audio: "key clink, her line, rain taking over",
          },
        ],
      },
    },
    currentStep: "manuscript",
  };
}
