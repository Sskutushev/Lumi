import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
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

  test('should create a new project', async ({ page }) => {
    // 1. Click add project button
    await page.getByRole('button', { name: '+ Add' }).click();

    // 2. Fill in project details in modal
    await page.locator('input[placeholder="Enter project name..."]').fill('Test Project');
    await page
      .locator('textarea[placeholder="Enter project description..."]')
      .fill('This is a test project');

    // 3. Click create project
    await page.getByRole('button', { name: 'Create' }).click();

    // 4. Verify that project appears in the list
    await expect(page.getByText('Test Project')).toBeVisible();
  });

  test('should add task to project', async ({ page }) => {
    // Create a project first
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.locator('input[placeholder="Enter project name..."]').fill('Project for Task');
    await page
      .locator('textarea[placeholder="Enter project description..."]')
      .fill('This project will contain a task');
    await page.getByRole('button', { name: 'Create' }).click();

    // Create a task
    const taskInput = page.locator('input[placeholder*="Add a new task"]');
    await taskInput.fill('Task for project');
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Click on the task to open details
    await page.getByText('Task for project').click();

    // Select the project in the task details
    await page.locator('select').first().selectOption('Project for Task');

    // Save the task
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify that the task is now in the project
    await page.getByText('Project for Task').click();
    await expect(page.getByText('Task for project')).toBeVisible();
  });

  test('should delete a project', async ({ page }) => {
    // Create a project first
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.locator('input[placeholder="Enter project name..."]').fill('Project to Delete');
    await page
      .locator('textarea[placeholder="Enter project description..."]')
      .fill('This project will be deleted');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify project exists
    await expect(page.getByText('Project to Delete')).toBeVisible();

    // Delete the project (using the trash button)
    const projectRow = page.locator('.flex').filter({ has: page.getByText('Project to Delete') });
    await projectRow
      .locator('button')
      .filter({ has: page.locator('svg') })
      .click();

    // Verify project is gone
    await expect(page.getByText('Project to Delete')).not.toBeVisible();
  });

  test('should navigate to project view', async ({ page }) => {
    // Create a project first
    await page.getByRole('button', { name: '+ Add' }).click();
    await page
      .locator('input[placeholder="Enter project name..."]')
      .fill('Navigation Test Project');
    await page
      .locator('textarea[placeholder="Enter project description..."]')
      .fill('Project for navigation test');
    await page.getByRole('button', { name: 'Create' }).click();

    // Click on the project to navigate to project view
    await page.getByText('Navigation Test Project').click();

    // Verify that we're on the project page
    await expect(page.getByText('Navigation Test Project')).toBeVisible();
    await expect(page.getByText('Tasks')).toBeVisible();
  });
});
