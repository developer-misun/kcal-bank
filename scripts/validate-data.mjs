#!/usr/bin/env node
// data/ 폴더 JSON 검사 (의존성 없음). 실행: node scripts/validate-data.mjs
// - 필수 필드, 코드값, 날짜 형식
// - id 중복, 월별 파일과 날짜 일치
// - entries.foodId → foods.id 참조 확인
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const NUTS = ["kcal", "carbs", "protein", "fat", "fiber", "sugar", "sodium"];

const codes = read("master/codes.json");
const MEALS = new Set(codes.meal.map((c) => c.code));
const CATS = new Set(codes.category.map((c) => c.code));
const SRCS = new Set(codes.source.map((c) => c.code));

function checkNuts(file, row, label) {
  for (const k of NUTS) {
    const v = row[k];
    if (k === "kcal" && typeof v !== "number") err(file, `${label} kcal 없음`);
    else if (v != null && (typeof v !== "number" || v < 0)) err(file, `${label} ${k} 값 이상: ${v}`);
  }
}

// foods
const foods = read("master/foods.json");
const foodIds = new Set();
for (const f of foods.items) {
  const L = `food ${f.id}`;
  if (!/^[a-z0-9-]+$/.test(f.id ?? "")) err("foods", `${L} id 형식`);
  if (foodIds.has(f.id)) err("foods", `${L} id 중복`);
  foodIds.add(f.id);
  if (!f.name) err("foods", `${L} name 없음`);
  if (!CATS.has(f.category)) err("foods", `${L} category 코드 아님: ${f.category}`);
  if (!SRCS.has(f.source)) err("foods", `${L} source 코드 아님: ${f.source}`);
  if (!f.serving?.label) err("foods", `${L} serving.label 없음`);
  checkNuts("foods", f, L);
}

// logs (월별 파일)
function eachMonth(dir, fn) {
  const p = join(ROOT, "logs", dir);
  if (!existsSync(p)) return;
  for (const name of readdirSync(p).filter((n) => n.endsWith(".json")).sort()) {
    const file = `logs/${dir}/${name}`;
    const data = read(file);
    const month = name.replace(".json", "");
    if (data.month !== month) err(file, `month 필드(${data.month})와 파일명 다름`);
    fn(file, data, month);
  }
}

const entryIds = new Set();
let entryCount = 0;
eachMonth("entries", (file, data, month) => {
  for (const e of data.items) {
    entryCount++;
    const L = `entry ${e.id}`;
    if (!DATE.test(e.date ?? "")) err(file, `${L} date 형식`);
    if (!e.date?.startsWith(month)) err(file, `${L} 다른 달 날짜`);
    if (!e.id?.startsWith(e.date + "-")) err(file, `${L} id는 날짜로 시작해야 함`);
    if (entryIds.has(e.id)) err(file, `${L} id 중복`);
    entryIds.add(e.id);
    if (!MEALS.has(e.meal)) err(file, `${L} meal 코드 아님: ${e.meal}`);
    if (!SRCS.has(e.source)) err(file, `${L} source 코드 아님: ${e.source}`);
    if (!e.name) err(file, `${L} name 없음`);
    if (e.foodId != null && !foodIds.has(e.foodId)) err(file, `${L} foodId 없음: ${e.foodId}`);
    checkNuts(file, e, L);
  }
});

const actDates = new Set();
eachMonth("activity", (file, data, month) => {
  for (const a of data.items) {
    if (!DATE.test(a.date ?? "") || !a.date.startsWith(month)) err(file, `activity 날짜 이상: ${a.date}`);
    if (actDates.has(a.date)) err(file, `activity 날짜 중복: ${a.date}`);
    actDates.add(a.date);
    if (typeof a.activeKcal !== "number" || a.activeKcal < 0) err(file, `activity ${a.date} activeKcal 이상`);
  }
});

// 건강 정보가 섞이지 않았는지 (체중 등은 git에 올리지 않음)
for (const dir of ["entries", "activity"]) {
  const p = join(ROOT, "logs", dir);
  if (!existsSync(p)) continue;
  for (const n of readdirSync(p)) {
    if (/"weight"\s*:/.test(readFileSync(join(p, n), "utf8"))) err(`logs/${dir}/${n}`, "weight 필드가 있으면 안 됨");
  }
}

console.log(`foods ${foodIds.size} · entries ${entryCount} · activity ${actDates.size}`);
if (errors.length) {
  console.error(`오류 ${errors.length}개`);
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}
console.log("OK");
