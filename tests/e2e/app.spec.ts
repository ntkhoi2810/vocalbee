import { test, expect } from "@playwright/test";

test("student finishes a challenge, switches modes and retains progress on reload", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Lớp 7", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Chào Bạn học lớp 7," })).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Bắt đầu thử thách" }).click();
  let dialog = page.getByRole("dialog", { name: "Phiên học từ vựng" });
  await expect(dialog.getByRole("heading", { name: "assignment", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Mình đã sẵn sàng luyện tập" }).click();
  // Deliberate error verifies feedback and mistake notebook, without using hidden answers.
  const options = dialog.locator(".answer-option");
  const wrong = options.filter({ hasNotText: "bài tập được giao" }).first();
  await wrong.click();
  await dialog.getByRole("button", { name: "Trả lời", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Một cơ hội để nhớ lâu hơn" })).toBeVisible();
  await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.getByRole("button", { name: "Đổi chế độ", exact: true }).click();
  await page.getByRole("dialog", { name: "Chọn chế độ học" }).getByRole("button", { name: /Ôn cố định/ }).click();
  await expect(page.getByRole("status")).toContainText("Phiên đang học vẫn giữ chế độ cũ");
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục phiên học" }).click();
  dialog = page.getByRole("dialog");
  await expect(dialog.locator(".lesson-top")).toContainText("Ôn thích ứng");
  for (let i = 0; i < 30; i++) {
    if (await dialog.getByRole("button", { name: "Về góc học tập" }).isVisible()) break;
    if (await dialog.getByRole("button", { name: "Xem tổng kết" }).isVisible()) { await dialog.getByRole("button", { name: "Xem tổng kết" }).click(); await expect(dialog.locator(".feedback-view")).not.toBeVisible(); continue; }
    if (await dialog.getByRole("button", { name: "Tiếp tục", exact: true }).isVisible()) { await dialog.getByRole("button", { name: "Tiếp tục", exact: true }).click(); await expect(dialog.locator(".feedback-view")).not.toBeVisible(); continue; }
    if (await dialog.getByRole("button", { name: "Mình đã sẵn sàng luyện tập" }).isVisible()) { await dialog.getByRole("button", { name: "Mình đã sẵn sàng luyện tập" }).click(); continue; }
    await dialog.locator(".answer-option").first().click();
    await dialog.getByRole("button", { name: "Trả lời", exact: true }).click();
    await expect(dialog.locator(".feedback-view")).toBeVisible();
  }
  await expect(dialog.getByRole("heading", { name: "Hôm nay, bạn đã tiến bộ!" })).toBeVisible();
  await dialog.getByRole("button", { name: "Về góc học tập" }).click();
  await expect(page.getByRole("heading", { name: "Bạn đã làm rất tốt!" })).toBeVisible();
  await page.getByRole("button", { name: "Sổ lỗi cá nhân", exact: true }).click();
  await expect(page.getByRole("heading", { name: "assignment", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Chính tả", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Chưa có lỗi trong danh sách này" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile navigation, topics and mode selection fit a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Lớp 6", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Chào Bạn học lớp 6," })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/dashboard-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page.getByRole("button", { name: "Khám phá chủ đề", exact: true }).click();
  await page.getByPlaceholder("Tìm từ tiếng Anh hoặc nghĩa tiếng Việt…").fill("classroom");
  await page.getByRole("button", { name: /classroom phòng học/ }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "classroom", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page.getByRole("button", { name: "Ôn tập của bạn", exact: true }).click();
  await page.getByRole("button", { name: "Ôn thích ứng", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Ôn cố định/ }).click();
  await expect(page.getByRole("button", { name: "Ôn cố định", exact: true })).toBeVisible();
});

test("teacher creates a study and student, assigns a group and exports data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Vào không gian giáo viên" }).click();
  await page.getByRole("button", { name: "Quản lý thực nghiệm", exact: true }).click();
  await page.getByRole("button", { name: "Cấp tài khoản", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Cấp tài khoản học sinh" });
  await form.getByLabel("Tên hiển thị").fill("Học sinh E2E");
  await form.getByLabel("Tên đăng nhập").fill("e2e_student");
  await form.getByLabel("Khối lớp").selectOption("9");
  await form.getByLabel("Mật khẩu cấp ban đầu").fill("TestPassword123!");
  await form.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(form).not.toBeVisible();
  await page.getByRole("button", { name: "Tạo đợt mới" }).click();
  const exp = page.getByRole("dialog", { name: "Tạo đợt thực nghiệm" });
  await exp.getByLabel("Tên đợt").fill("Nghiên cứu E2E lớp 9");
  await exp.getByLabel("Khối lớp").selectOption("9");
  await exp.getByRole("button", { name: "Tạo đợt thực nghiệm" }).click();
  await expect(exp).not.toBeVisible();
  await page.getByRole("button", { name: "Học sinh & dữ liệu" }).click();
  await page.getByRole("checkbox", { name: "Chọn e2e_student" }).check();
  await page.getByRole("button", { name: "Phân nhóm A/B (1)" }).click();
  await expect(page.getByRole("status")).toHaveText("Đã phân nhóm ngẫu nhiên cân bằng A/B.");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Dữ liệu câu trả lời" }).click();
  expect((await download).suggestedFilename()).toBe("vocalbee-attempts.csv");
  await page.screenshot({ path: "test-results/teacher-desktop.png", fullPage: true });
});

test("API rejects unauthenticated and cross-origin mutations", async ({ request }) => {
  expect((await request.get("/api/app")).status()).toBe(401);
  expect((await request.post("/api/auth", { headers: { Origin: "https://example.com" }, data: { username: "student6", password: "VocalBee2026!" } })).status()).toBe(403);
});
