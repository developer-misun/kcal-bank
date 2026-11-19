# data/ — 데이터 구조

**파일 하나 = DB 테이블 하나**가 되도록 나눴다. 지금은 JSON으로 관리하고, 앱에서는 같은 구조 그대로 SQLite 등 DB로 옮긴다.
테이블 정의(DDL)와 관계는 `docs/03-data-model.md`에 있다.

```
data/
├─ master/                 # 기준 데이터 (잘 안 바뀜, 앱 시드로 들어감)
│  ├─ foods.json           # 음식·제품 영양 DB          → foods 테이블
│  ├─ nutrition-standards.json  # 연령·성별 영양소 기준  → standards 테이블
│  └─ codes.json           # 코드표: 끼니, 분류, 출처, 성별, 활동량
├─ logs/                   # 기록 데이터 (매일 쌓임, 월별 파일)
│  ├─ entries/YYYY-MM.json # 먹은 음식 한 줄 = 한 행     → entries 테이블
│  └─ activity/YYYY-MM.json# 워치 활동 kcal (하루 한 행)  → activity 테이블
├─ defaults/
│  └─ settings.json        # 새 사용자 기본 목표 설정     → settings 테이블
└─ schema/                 # JSON Schema (테이블별 필드 정의)
```

## 규칙
- 모든 파일은 `{ "table": "<테이블명>", "items": [ ... ] }` 모양. 월별 파일은 `"month": "YYYY-MM"`도 넣는다.
- **id**
  - foods: 영문 소문자·숫자·하이픈 (`hetbahn-lentil`)
  - entries: `날짜-순번` (`2026-11-18-03`). 같은 날 안에서 순번이 겹치지 않게
- **코드값**은 `master/codes.json`의 `code`를 쓴다. 화면에는 `label`(한국어)을 보여 준다.
  - meal: `breakfast` `lunch` `dinner` `snack`
  - source: `label`(성분표) `estimate`(추정) `unknown`(미표기)
- 영양소 단위: kcal / g (탄수화물·단백질·지방·식이섬유·당류·포화지방) / mg (나트륨). 모르면 `null`.
- entries의 `label`은 기록 당시 원문 그대로 둔다. `name`·`amount`·`unit`은 원문에서 뽑아낸 값이라 빈칸(`null`)이 있을 수 있다.
- entries의 `foodId`는 foods와 연결할 때 쓴다. 아직은 대부분 `null`.

## 올리지 않는 것
체중, 검진 결과 같은 **건강 정보는 git에 올리지 않는다.** 앱에서는 `body_logs` 테이블로 기기 안에만 저장한다 (`docs/03-data-model.md`).

## 갱신
- 실제 사용 기록은 **전날 분까지** 매일 `logs/`에 추가한다.
- 바꾼 뒤에는 검사를 돌린다: `node scripts/validate-data.mjs`
