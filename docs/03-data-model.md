# 03. 데이터 모델

프로토타입은 문서형 저장소를 쓴다. 앱에서는 SQLite 같은 로컬 DB로 옮기면 된다.

## Day (하루 기록) — `days/{yyyy-mm-dd}`
```json
{
  "date": "2026-11-02",
  "items": [
    {"meal": "저녁", "name": "장어구이 135g (추정)", "kcal": 311,
     "carbs": 0, "protein": 24.3, "fat": 23, "fiber": 0, "sugar": 0, "sodium": 135}
  ],
  "active": 177,
  "weight": 59.5
}
```
| 필드 | 설명 |
|---|---|
| items[].meal | `아침` `점심` `저녁` `간식` |
| items[].name | 음식명. 양을 이름에 같이 적는다 (예: "방울토마토 300g"). 앱에서는 `amount` + `unit` 필드로 분리 권장 |
| items[].kcal | 필수 |
| items[].carbs/protein/fat/fiber/sugar | g, 선택 |
| items[].sodium | mg, 선택 |
| active | 워치 활동 kcal, 선택 |
| weight | kg, 선택 |

**개선 제안 (앱 버전):** items에 `foodId`(Food 참조), `amount`, `unit`, `src`(`성분표`/`추정`), `createdAt` 추가.

## Food (음식·제품 DB) — `pantry/{id}`
`data/foods.json` 참고.
```json
{"id": "hetbahn-lentil", "name": "햇반 렌틸콩 현미밥", "cat": "밥·면·곡물",
 "unit": "110g 1개", "kcal": 160, "carbs": 36, "protein": 4, "fat": 0.9, "sat": 0,
 "fiber": 4, "sugar": 0.5, "sodium": 0, "src": "성분표", "memo": "..."}
```
| 필드 | 설명 |
|---|---|
| cat | `단백질` `채소·과일` `밥·면·곡물` `유제품` `간식·음료` `양념·기타` |
| unit | 기준량 표시 문자열. 영양 값은 이 1회분 기준 |
| sat | 포화지방 g |
| src | `성분표` / `추정` |
| note, memo | 짧은 메모 / 자세한 메모 |

## Settings — `settings/goal`
```json
{"sex": "f", "age": 30, "height": 160, "act": 1.375, "start": "2026-10-20",
 "startW": 60, "targetW": 55, "goal": 1500, "min": 1200, "watch": 200, "std": "custom"}
```
| 필드 | 설명 |
|---|---|
| act | 활동 계수 1.2 / 1.375 / 1.55 / 1.725 |
| start | D-1이 되는 날짜 |
| goal / min | 하루 목표 / 최소 kcal |
| watch | 워치 보너스 기준 kcal |
| std | 영양소 기준 id (`data/nutrition-standards.json`) |
