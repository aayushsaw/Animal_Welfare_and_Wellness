import { test, expect } from '@playwright/test';

test.describe('Listings and Adoption Lifecycle', () => {
  test('should browse, filter by category, and navigate to details', async ({ page }) => {
    await page.goto('/animals');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Find Your Companion');

    // Click Category filter for Dogs
    await page.click('[data-testid="category-filter-dog"]');
    
    // Wait for the query and check results
    await page.waitForSelector('[data-testid="animal-card"]');
    const cardsCount = await page.locator('[data-testid="animal-card"]').count();
    
    if (cardsCount > 0) {
      const firstCard = page.locator('[data-testid="animal-card"]').first();
      const firstCardName = await firstCard.locator('[data-testid="animal-card-name"]').innerText();
      
      // Click on it
      await firstCard.click();
      await page.waitForURL('**/animals/*');
      
      // Verify detail page has matching name
      await expect(page.locator('h1')).toContainText(firstCardName);
    }
  });

  test('should complete the full adoption request and admin review flow', async ({ page }) => {
    // 1. Register a new buyer user to avoid adopting own posted animals
    const buyerUsername = `buyer_${Math.floor(Math.random() * 100000)}`;
    await page.goto('/register');
    await page.fill('[data-testid="firstname-input"]', 'Buyer');
    await page.fill('[data-testid="lastname-input"]', 'User');
    await page.fill('[data-testid="username-input"]', buyerUsername);
    await page.fill('[data-testid="email-input"]', `${buyerUsername}@example.com`);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="register-submit"]');
    await page.waitForURL('**/');

    // 2. Go to animals list and find an available one
    await page.locator('nav').locator('text=Find a Pet').first().click();
    await page.waitForSelector('[data-testid="animal-card"]');
    const availableCards = page.locator('[data-testid="animal-card"]');
    const count = await availableCards.count();
    
    let animalId = '';
    let animalName = '';
    
    for (let i = 0; i < count; i++) {
      const card = availableCards.nth(i);
      const badgeText = await card.locator('.absolute.top-3.left-3').innerText();
      if (badgeText.toLowerCase().includes('available')) {
        animalName = await card.locator('[data-testid="animal-card-name"]').innerText();
        const href = await card.getAttribute('href');
        animalId = href?.split('/').pop() || '';
        await card.click();
        break;
      }
    }

    if (!animalId) {
      console.log('No available animals found to request adoption. Skipping lifecycle test.');
      return;
    }

    await page.waitForURL(`**/animals/${animalId}`);
    await expect(page.locator('h1')).toContainText(animalName);

    // 3. Submit adoption request
    await page.click('[data-testid="request-adoption-btn"]');
    await page.fill('[data-testid="adopt-message-input"]', 'I have a large backyard and lots of love!');
    await page.click('[data-testid="adopt-submit-btn"]');
    
    // Check success toast / confirmation
    await expect(page.locator('text=Adoption request submitted')).toBeVisible();

    // 4. Log out
    await page.click('[data-testid="navbar-profile-btn"]');
    await page.click('[data-testid="navbar-logout"]');
    await page.waitForURL('**/');

    // 5. Log in as 'admin'
    await page.goto('/login');
    await page.fill('[data-testid="username-input"]', 'admin');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('**/');

    // 6. Go to dashboard and find the review request
    await page.click('[data-testid="navbar-profile-btn"]');
    await page.click('[data-testid="navbar-dashboard"]');
    await page.waitForURL('**/dashboard');

    // Find the pending request for our animal
    await expect(page.locator('h2:has-text("Pending Reviews")')).toBeVisible();
    
    // We locate the review block containing the animalName and requesterUsername
    const pendingRequestRow = page.locator(`.divide-y > div:has-text("${animalName}"):has-text("${buyerUsername}")`);
    await expect(pendingRequestRow).toBeVisible();
    
    // Click Review Request
    await pendingRequestRow.locator('button:has-text("Review Request")').click();
    
    // Fill note and Approve
    await pendingRequestRow.locator('input[placeholder="Add a review note..."]').fill('Approved E2E test adoption.');
    await pendingRequestRow.locator('button:has-text("Approve")').click();
    
    // Verify toast notification for approval
    await expect(page.locator('text=Adoption request reviewed successfully')).toBeVisible();
  });
});
