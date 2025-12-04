import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login and navigate to dashboard
    await page.goto('/');

    // Sign in with test user
    await page.getByText('Sign In').click();
    await page.locator('#email').fill('testuser@example.com');
    await page.locator('#password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('Inbox')).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    // 1. Enter task title in input field
    const taskInput = page.locator('input[placeholder*="Add a new task"]');
    await taskInput.fill('New test task');

    // 2. Click add button
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // 3. Verify that task appears in the list
    await expect(page.getByText('New test task')).toBeVisible();
  });

  test('should mark task as completed', async ({ page }) => {
    // Create a task first
    const taskInput = page.locator('input[placeholder*="Add a new task"]');
    await taskInput.fill('Task to complete');
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Find the task and click its checkbox
    const taskCheckbox = page
      .locator('.flex')
      .filter({ has: page.getByText('Task to complete') })
      .locator('button[role="checkbox"]');
    await taskCheckbox.click();

    // Verify that task is marked as completed
    await expect(page.locator('p').filter({ hasText: 'Task to complete' }).first()).toHaveClass(
      /line-through/
    );
  });

  test('should delete a task', async ({ page }) => {
    // Create a task first
    const taskInput = page.locator('input[placeholder*="Add a new task"]');
    await taskInput.fill('Task to delete');
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Open task options menu
    const taskItem = page.locator('.flex').filter({ has: page.getByText('Task to delete') });
    await taskItem
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Click delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Verify that task is no longer in the list
    await expect(page.getByText('Task to delete')).not.toBeVisible();
  });

  test('should edit task details', async ({ page }) => {
    // Create a task first
    const taskInput = page.locator('input[placeholder*="Add a new task"]');
    await taskInput.fill('Original task');
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Click on the task to open details
    await page.getByText('Original task').click();

    // Wait for modal to appear and update task title
    await page.locator('input[type="text"]').fill('Updated task title');

    // Save the task
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify that the task title has been updated
    await expect(page.getByText('Updated task title')).toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    // Create a completed task
    const taskInput = page.locator('input[placeholder*="Add a new task"]');
    await taskInput.fill('Completed task');
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Mark the task as completed
    const taskCheckbox = page
      .locator('.flex')
      .filter({ has: page.getByText('Completed task') })
      .locator('button[role="checkbox"]');
    await taskCheckbox.click();

    // Create an incomplete task
    await taskInput.fill('Incomplete task');
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Click on "Completed" filter
    await page.getByText('Completed').click();

    // Verify that only the completed task is visible
    await expect(page.getByText('Completed task')).toBeVisible();
    await expect(page.getByText('Incomplete task')).not.toBeVisible();

    // Switch back to "All" to see both tasks
    await page.getByText('All').click();
    await expect(page.getByText('Completed task')).toBeVisible();
    await expect(page.getByText('Incomplete task')).toBeVisible();
  });
});
