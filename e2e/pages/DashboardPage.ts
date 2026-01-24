import { type Locator, type Page, expect } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly sidebar: Locator;
    readonly projectsTab: Locator;
    readonly dashboardTab: Locator;
    readonly userAvatar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.sidebar = page.getByRole('complementary'); // 'aside' usually maps to complementary
        // Using text locators for sidebar items as they are generic buttons
        this.projectsTab = page.getByRole('button', { name: 'Meus Projetos' });
        this.dashboardTab = page.getByRole('button', { name: 'Dashboard' });
        this.userAvatar = page.locator('img[alt="Avatar"]');
    }

    async navigateToProjects() {
        await this.projectsTab.click();
    }

    async navigateToDashboard() {
        await this.dashboardTab.click();
    }
}
