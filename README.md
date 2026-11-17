# kcal-bank — 식단 기록 앱 (가칭)

하루 목표 칼로리 안에서 식단을 기록하고, **영양소를 기준 대비로 한눈에** 보고, 남은 칼로리를 **저금통**처럼 모으는 개인용 식단 앱입니다.
2026-10-20부터 Claude와 대화로 실제 식단을 기록하면서 다듬은 기능을 앱으로 옮기는 것이 목표예요.

- 1차 목표: **개인용 앱을 Google Play / App Store에 무료로 배포**
- 사용자: 나를 시작으로 성인 남녀, 청소년, 어린이, 노인 누구나 (연령·성별 기준 선택)

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `docs/01-product.md` | 제품 개요, 사용자, 핵심 가치 |
| `docs/02-features.md` | 화면별 기능 명세 (식단 · 영양 참고 · 목표) |
| `docs/03-data-model.md` | 데이터 구조 |
| `docs/04-rules.md` | 계산 규칙 (저금통, 기초대사량, 추천 칼로리, 영양소 막대 색) |
| `docs/05-nutrition-standards.md` | 영양소 기준 (2025 한국인 영양소 섭취기준 + 맞춤) |
| `docs/06-release.md` | 스토어 배포 체크리스트 |
| `docs/07-roadmap.md` | 단계별 계획, 아직 정하지 않은 것 |
| `prototype/index.html` | 동작하는 웹 프로토타입 (브라우저로 바로 열림, 브라우저 저장소 사용) |
| `data/foods.json` | 음식·제품 영양 DB 약 40개 (성분표 확인값 + 추정값) |
| `data/nutrition-standards.json` | 연령·성별 영양소 기준표 |
| `data/sample-days.json` | 실제 사용 기록 15일 (건강 정보 제외) |
| `CLAUDE.md` | 노트북의 Claude Code가 읽을 개발 지침 |

## 프로토타입 보기

`prototype/index.html`을 브라우저로 열면 됩니다. 서버가 필요 없고, 기록은 그 브라우저에만 저장돼요.

## 노트북에서 개발 시작하기

```bash
git clone <이 저장소 주소>
cd <저장소 폴더>
claude
```

Claude Code에게 예를 들어 이렇게 시작하면 됩니다.

> docs와 prototype을 읽고, docs/07-roadmap.md의 1단계(MVP)를 만들 계획을 세워줘. 기술 스택은 먼저 나한테 물어봐.
