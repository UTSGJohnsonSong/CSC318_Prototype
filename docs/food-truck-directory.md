# UofT Food Truck Name / Photo Directory

Purpose: canonical mapping for future UI display of real truck names and photos.

## Naming convention

- Use one stable `code` for each truck (for data keys)
- Keep `displayName` as user-facing English name
- Keep `nicknameZh` as your field shorthand
- Keep `photoRef` as current photo source; can later move into `public/trucks/*.jpg`

## Master mapping (1-11)

| # | code | displayName | nicknameZh | photoRef | photoStatus |
|---|---|---|---|---|---|
| 1 | `luchi-pink` | Luchi Pink Truck | 路吃小粉车 | `@1.jpg` | provided (pending final confirm) |
| 2 | `alis-wraps` | Ali's Wraps | Ali's wraps | _missing_ | pending |
| 3 | `rb-red` | RB Red Truck | RB外小红车 | `@2.jpg` | provided (pending final confirm) |
| 4 | `middle-east-flame` | Middle East Flame Truck | 中东火焰车 | `@3.jpg` | provided (pending final confirm) |
| 5 | `white-chinese` | White Chinese Truck | 白色中餐车 | _missing_ | pending |
| 6 | `blue-truck` | The Blue Truck | 小蓝车 | _missing_ | pending |
| 7 | `purple-fried-chicken` | Purple Fried Chicken Truck | 炸鸡小紫车 | _missing_ | pending |
| 8 | `matte-black-pork` | Matte Black Pork Chop Truck | 黑色磨砂猪排餐车 | _missing_ | pending |
| 9 | `jianbing-grain` | Wholegrain Jianbing Truck | 杂粮煎饼 | _missing_ | pending |
| 10 | `pita-express` | Pita Express | Pita Express | _missing_ | pending |
| 11 | `glounge-noir` | Glounge Noir Drinks Truck | Glounge黑色喷漆饮料餐车 | _missing_ | pending |

## Current provided photo files

- `@1.jpg`: pink truck (Luchi branding visible)
- `@2.jpg`: red truck (Wokking on Wheels visible)
- `@3.jpg`: black truck (Food From East visible)

## Next step (recommended)

1. Confirm whether `@2.jpg` should map to #2 or #3.
2. Confirm whether `@3.jpg` should map to #4 or #8.
3. Add remaining photos (#5-#11) and then move all to stable paths:
   - `public/trucks/1.jpg` ... `public/trucks/11.jpg`
