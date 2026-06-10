import { test, expect } from "@playwright/test";

test.describe("笔记应用 E2E 测试", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("file:///F:/codex_project1/notes.html");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("首页显示空的笔记列表", async ({ page }) => {
    await expect(page.locator(".note-list .empty-msg")).toBeVisible();
    await expect(page.locator(".empty-state")).toBeVisible();
  });

  test("新建笔记", async ({ page }) => {
    await page.click("#newNoteBtn");
    await expect(page.locator(".note-item")).toHaveCount(1);
    await expect(page.locator(".editor-header")).toBeVisible();
    await expect(page.locator(".editor-body")).toBeVisible();
  });

  test("编辑笔记标题", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.fill("#titleInput", "我的测试笔记");
    await page.waitForTimeout(500);
    await expect(page.locator(".note-item .note-title")).toHaveText("我的测试笔记");
  });

  test("编辑笔记内容", async ({ page }) => {
    await page.click("#newNoteBtn");
    const content = "这是笔记内容，包含中文、English 和 123。";
    await page.fill("#contentArea", content);
    await page.waitForTimeout(500);
    await expect(page.locator("#charCount")).toContainText(/37 字/);
  });

  test("新建多条笔记并切换", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.fill("#titleInput", "笔记一");
    await page.click("#newNoteBtn");
    await page.fill("#titleInput", "笔记二");
    await expect(page.locator(".note-item")).toHaveCount(2);
    // Click first note
    await page.locator(".note-item").last().click();
    await expect(page.locator("#titleInput")).toHaveValue("笔记一");
  });

  test("删除笔记", async ({ page }) => {
    await page.click("#newNoteBtn");
    await expect(page.locator(".note-item")).toHaveCount(1);
    await page.locator(".delete-btn").click();
    await expect(page.locator("#deleteModal")).toBeVisible();
    await page.click("#confirmDeleteBtn");
    await expect(page.locator(".note-item")).toHaveCount(0);
  });

  test("取消删除", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.locator(".delete-btn").click();
    await page.click("#cancelDeleteBtn");
    await expect(page.locator(".note-item")).toHaveCount(1);
  });

  test("搜索过滤", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.fill("#titleInput", "JavaScript 教程");
    await page.click("#newNoteBtn");
    await page.fill("#titleInput", "购物清单");
    await page.fill("#searchInput", "Java");
    await expect(page.locator(".note-item")).toHaveCount(1);
    await expect(page.locator(".note-item .note-title")).toHaveText("JavaScript 教程");
  });

  test("搜索无结果时显示空状态", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.fill("#searchInput", "不存在的关键词");
    await expect(page.locator(".empty-msg")).toBeVisible();
    await expect(page.locator(".empty-msg")).toContainText("没有匹配的笔记");
  });

  test("Ctrl+N 快捷键新建", async ({ page }) => {
    await page.keyboard.press("Control+n");
    await expect(page.locator(".note-item")).toHaveCount(1);
  });

  test("Ctrl+S 快捷键保存", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.fill("#titleInput", "快捷键测试");
    await page.keyboard.press("Control+s");
    await expect(page.locator("#saveStatus")).toContainText("已保存");
  });

  test("Esc 关闭删除弹窗", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.locator(".delete-btn").click();
    await expect(page.locator("#deleteModal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#deleteModal")).not.toBeVisible();
  });

  test("数据持久化 (localStorage)", async ({ page }) => {
    await page.click("#newNoteBtn");
    await page.fill("#titleInput", "持久化测试");
    await page.fill("#contentArea", "刷新后应该还在");
    await page.waitForTimeout(500);

    // Store key before reload
    const key = await page.evaluate(() => "notes_app_data");
    // Reload
    await page.reload();
    // Check local storage
    const data = await page.evaluate((k) => {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    }, key);
    expect(data).not.toBeNull();
    expect(data.length).toBe(1);
    expect(data[0].title).toBe("持久化测试");
  });

  test("导出按钮存在", async ({ page }) => {
    await expect(page.locator("#exportBtn")).toBeVisible();
  });

  test("导入按钮存在", async ({ page }) => {
    await expect(page.locator("#importBtn")).toBeVisible();
  });
});
