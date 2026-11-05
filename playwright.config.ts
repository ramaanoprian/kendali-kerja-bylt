import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',timeout:30000,use:{baseURL:'http://localhost:5173',headless:true,launchOptions:{args:["--no-sandbox"],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}},reporter:[['list'],['json',{outputFile:'test-results/browser.json'}]],workers:1});
