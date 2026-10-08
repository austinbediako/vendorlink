import asyncio
from playwright.async_api import async_playwright
import os

async def capture():
    os.makedirs('docs/screenshots', exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        # Capture Home Page
        await page.goto('http://localhost:5173')
        await asyncio.sleep(2)
        await page.screenshot(path='docs/screenshots/home_page.png')
        
        # Login
        await page.goto('http://localhost:5173/login')
        await asyncio.sleep(1)
        await page.screenshot(path='docs/screenshots/login_page.png')
        
        await page.fill('input[type="email"]', 'business.open@vms.com')
        await page.fill('input[type="password"]', 'password123')
        await page.click('button[type="submit"]')
        await asyncio.sleep(3)
        
        # Business Dashboard
        await page.screenshot(path='docs/screenshots/business_dashboard.png')
        
        # Service Requests
        await page.goto('http://localhost:5173/service-requests')
        await asyncio.sleep(2)
        await page.screenshot(path='docs/screenshots/service_requests.png')
        
        # Find Artisans
        await page.goto('http://localhost:5173/artisans')
        await asyncio.sleep(2)
        await page.screenshot(path='docs/screenshots/artisan_search.png')
        
        # Logout
        await page.evaluate("localStorage.clear(); sessionStorage.clear();")
        
        # Login as Artisan
        await page.goto('http://localhost:5173/login')
        await asyncio.sleep(1)
        await page.fill('input[type="email"]', 'artisan.welder@vms.com')
        await page.fill('input[type="password"]', 'password123')
        await page.click('button[type="submit"]')
        await asyncio.sleep(3)
        
        # Artisan Dashboard
        await page.screenshot(path='docs/screenshots/artisan_dashboard.png')
        
        # Logout
        await page.evaluate("localStorage.clear(); sessionStorage.clear();")
        
        # Login as Admin
        await page.goto('http://localhost:5173/login')
        await asyncio.sleep(1)
        await page.fill('input[type="email"]', 'admin@vms.com')
        await page.fill('input[type="password"]', 'password123')
        await page.click('button[type="submit"]')
        await asyncio.sleep(3)
        
        # Admin Dashboard
        await page.screenshot(path='docs/screenshots/admin_dashboard.png')
        
        await browser.close()

asyncio.run(capture())
