# 03. 데이터 모델

데이터는 **테이블 단위로 나눈 JSON**으로 관리한다 (`data/README.md`). 앱에서는 같은 구조를 그대로 로컬 DB(SQLite 등)로 옮긴다.
JSON 파일 하나가 테이블 하나, `items` 배열의 원소 하나가 한 행이다.

## 테이블 한눈에
| 테이블 | JSON 위치 | 성격 | git에 올림 |
|---|---|---|---|
| `foods` | `data/master/foods.json` | 음식·제품 영양 DB | O |
| `standards` | `data/master/nutrition-standards.json` | 영양소 기준표 | O |
| `codes` | `data/master/codes.json` | 코드표 (끼니, 분류, 출처 등) | O |
| `entries` | `data/logs/entries/YYYY-MM.json` | 먹은 음식 기록 | O |
| `activity` | `data/logs/activity/YYYY-MM.json` | 하루 워치 활동 kcal | O |
| `settings` | `data/defaults/settings.json` | 목표·개인 설정 | 기본값만 |
| `body_logs` | (없음) | 체중 등 몸 기록 | **X (기기 안에만)** |

```
foods 1 ──< entries (entries.foodId → foods.id, 없어도 됨)
settings.standardId → standards (custom 또는 그룹 id)
```

## 하루 집계는 저장하지 않는다
하루 합계 kcal, 영양소 합계, 평가 이모티콘, 저금통은 **entries + activity + settings로 계산**한다 (`04-rules.md`).
저장해 두면 기록을 고칠 때마다 맞춰야 하므로, 화면에 보여 줄 때 계산한다.

## foods
```json
{"id": "hetbahn-lentil", "name": "햇반 렌틸콩 현미밥", "category": "grain",
 "serving": {"label": "110g 1개", "amount": 110, "unit": "g"},
 "kcal": 160, "carbs": 36, "protein": 4, "fat": 0.9, "satFat": 0,
 "fiber": 4, "sugar": 0.5, "sodium": 0, "source": "label"}
```
| 필드 | 설명 |
|---|---|
| id | 영문 소문자·숫자·하이픈 |
| category | `protein` `veg_fruit` `grain` `dairy` `snack_drink` `etc` |
| serving | 영양 값의 기준량. label은 화면용 문자열, amount·unit은 계산용 (없으면 null) |
| 영양소 | kcal, g (carbs·protein·fat·satFat·fiber·sugar), mg (sodium). 모르면 null |
| source | `label`(성분표) / `estimate`(추정) / `unknown` |

## entries
```json
{"id": "2026-11-17-06", "date": "2026-11-17", "meal": "dinner",
 "name": "삶은 돼지고기", "amount": 116, "unit": "g", "foodId": null,
 "kcal": 255, "carbs": 0, "protein": 25.5, "fat": 16.2, "fiber": 0, "sugar": 0, "sodium": 58,
 "source": "estimate", "label": "삶은 돼지고기 116g (추정)"}
```
| 필드 | 설명 |
|---|---|
| id | `날짜-순번` |
| meal | `breakfast` `lunch` `dinner` `snack` |
| name / amount / unit | 음식명과 먹은 양. 양을 모르면 null |
| foodId | foods에서 골라 기록했으면 그 id |
| 영양소 | **먹은 양 기준** 값 (1회 기준량이 아님) |
| label | 기록 당시 원문 |

## activity
```json
{"date": "2026-11-18", "activeKcal": 572}
```
하루 한 행. 하루에 여러 번 입력하면 마지막 값으로 덮어쓴다.

## settings
```json
{"id": "goal", "sex": "f", "age": 30, "height": 160, "activityLevel": 1.375,
 "startDate": "2026-10-20", "startWeight": 60, "targetWeight": 55,
 "goalKcal": 1500, "minKcal": 1200, "watchBaseKcal": 200, "standardId": "custom"}
```
| 필드 | 설명 |
|---|---|
| activityLevel | 1.2 / 1.375 / 1.55 / 1.725 |
| startDate | D-1이 되는 날짜 |
| goalKcal / minKcal | 하루 목표 / 최소 kcal |
| watchBaseKcal | 저금통 워치 보너스 기준 |
| standardId | `standards`의 id (`custom` 또는 그룹) |

## body_logs (git에 올리지 않음)
```json
{"date": "2026-11-16", "weightKg": 60.0}
```
건강 정보라 **기기 안에만** 저장한다. 시드 데이터도 없다.

## SQLite로 옮길 때 (예시)
```sql
CREATE TABLE foods (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  serving_label TEXT NOT NULL, serving_amount REAL, serving_unit TEXT,
  kcal REAL NOT NULL, carbs REAL, protein REAL, fat REAL, sat_fat REAL,
  fiber REAL, sugar REAL, sodium REAL,
  source TEXT NOT NULL CHECK (source IN ('label','estimate','unknown')), note TEXT
);
CREATE TABLE entries (
  id TEXT PRIMARY KEY, date TEXT NOT NULL,
  meal TEXT NOT NULL CHECK (meal IN ('breakfast','lunch','dinner','snack')),
  name TEXT NOT NULL, amount REAL, unit TEXT,
  food_id TEXT REFERENCES foods(id),
  kcal REAL NOT NULL, carbs REAL, protein REAL, fat REAL, fiber REAL, sugar REAL, sodium REAL,
  source TEXT NOT NULL, label TEXT, created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_entries_date ON entries(date);
CREATE TABLE activity (date TEXT PRIMARY KEY, active_kcal REAL NOT NULL);
CREATE TABLE body_logs (date TEXT PRIMARY KEY, weight_kg REAL);
CREATE TABLE settings (id TEXT PRIMARY KEY, json TEXT NOT NULL);
```
JSON 필드명(camelCase)은 DB에서 snake_case로 바꾼다. 영양소 기준표(`standards`)는 구조가 깊어서 앱 안에 상수로 두거나 JSON 그대로 저장해도 된다.

## 프로토타입과의 차이
`prototype/index.html`은 예전 문서형 구조(`days/날짜` 문서 안에 items 배열, `pantry/{id}`)를 쓴다. 앱은 위 테이블 구조로 만든다.
| 프로토타입 | 테이블 구조 |
|---|---|
| `days/{date}.items[]` | `entries` (id = 날짜-순번) |
| `days/{date}.active` | `activity` |
| `days/{date}.weight` | `body_logs` |
| `pantry/{id}` (cat, unit, sat, src) | `foods` (category, serving, satFat, source) |
| `settings/goal` (act, start, startW …) | `settings` (activityLevel, startDate, startWeight …) |
| 끼니 `아침`…, 출처 `성분표`/`추정` | 코드값 `breakfast`…, `label`/`estimate` |
