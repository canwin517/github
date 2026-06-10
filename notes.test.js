function genId() {
  return Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}
function createNote(t, c) {
  const n = Date.now();
  return { id: genId(), title: t || "", content: c || "", createdAt: n, updatedAt: n };
}
function addNote(notes, n) { return [n, ...notes]; }
function delNote(notes, i) { return notes.filter(n => n.id !== i); }
function getNote(notes, i) { return notes.find(n => n.id === i) || null; }
function updNote(notes, i, p) {
  return notes.map(n => n.id !== i ? n : { ...n, ...p, updatedAt: Date.now() });
}
function searchNotes(notes, q) {
  if (!q || !q.trim()) return notes;
  const s = q.trim().toLowerCase();
  return notes.filter(n => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
}
function truncate(str, len) {
  if (!str) return "空笔记";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

let passed = 0, failed = 0;
function assert(ok, msg) { if (ok) passed++; else { failed++; console.log("  FAIL: " + msg); } }

console.log("=== 笔记应用数据层单元测试 ===\n");

// Test createNote
{
  const n = createNote("测试标题", "测试内容");
  assert(n.title === "测试标题", "createNote: 标题正确");
  assert(n.content === "测试内容", "createNote: 内容正确");
  assert(typeof n.id === "string" && n.id.length > 0, "createNote: 生成有效 id");
  assert(typeof n.createdAt === "number" && n.createdAt > 0, "createNote: 时间戳有效");
  assert(n.createdAt === n.updatedAt, "createNote: 创建与更新时间一致");
  console.log("  [OK] createNote 基础功能\n");
}

// Test addNote and ordering
{
  const n1 = createNote("第一篇", "内容1");
  const n2 = createNote("第二篇", "内容2");
  let notes = addNote([], n1);
  assert(notes.length === 1, "addNote: 添加第一项");
  notes = addNote(notes, n2);
  assert(notes.length === 2, "addNote: 添加第二项");
  assert(notes[0].id === n2.id, "addNote: 最新笔记在最前");
  console.log("  [OK] addNote 顺序\n");
}

// Test getNote
{
  const n1 = createNote("标题A", "内容A");
  const notes = [n1];
  assert(getNote(notes, n1.id).title === "标题A", "getNote: 按 id 查找");
  assert(getNote(notes, "nonexistent") === null, "getNote: 不存在返回 null");
  console.log("  [OK] getNote 查找\n");
}

// Test updNote
{
  const n1 = createNote("原标题", "原内容");
  let notes = [n1];
  const before = notes[0].updatedAt;
  notes = updNote(notes, n1.id, { title: "新标题", content: "新内容" });
  const updated = getNote(notes, n1.id);
  assert(updated.title === "新标题", "updNote: 更新标题");
  assert(updated.content === "新内容", "updNote: 更新内容");
  assert(updated.updatedAt >= before, "updNote: 更新时间刷新");
  console.log("  [OK] updNote 更新\n");
}

// Test delNote
{
  const n1 = createNote("待删除", "");
  const n2 = createNote("保留", "");
  let notes = [n1, n2];
  notes = delNote(notes, n1.id);
  assert(notes.length === 1, "delNote: 删除后长度减一");
  assert(getNote(notes, n1.id) === null, "delNote: 已删除不可查");
  assert(getNote(notes, n2.id) !== null, "delNote: 未误删其他笔记");
  console.log("  [OK] delNote 删除\n");
}

// Test searchNotes
{
  const n1 = createNote("JavaScript 教程", "关于 async/await 的用法");
  const n2 = createNote("购物清单", "牛奶 面包 鸡蛋");
  const n3 = createNote("Python 笔记", "列表推导式");
  const notes = [n1, n2, n3];

  const r1 = searchNotes(notes, "JavaScript");
  assert(r1.length === 1 && r1[0].id === n1.id, "search: 标题匹配");

  const r2 = searchNotes(notes, "async");
  assert(r2.length === 1 && r2[0].id === n1.id, "search: 内容匹配");

  const r3 = searchNotes(notes, "牛奶");
  assert(r3.length === 1 && r3[0].id === n2.id, "search: 中文内容匹配");

  const r4 = searchNotes(notes, "不存在的词");
  assert(r4.length === 0, "search: 无匹配返回空");

  const r5 = searchNotes(notes, "");
  assert(r5.length === 3, "search: 空查询返回全部");

  console.log("  [OK] searchNotes 搜索\n");
}

// Test truncate
{
  assert(truncate("hello world", 5) === "hello…", "truncate: 截断");
  assert(truncate("hi", 10) === "hi", "truncate: 短文本不变");
  assert(truncate("", 5) === "空笔记", "truncate: 空字符串");
  assert(truncate(null, 5) === "空笔记", "truncate: null");
  console.log("  [OK] truncate 截断\n");
}

console.log(`\n=== 结果：通过 ${passed} 项，失败 ${failed} 项 ===`);
if (failed > 0) process.exit(1);
