# 📊 Test Reports

This directory contains test reports and documentation for the Restaurant Daily application.

## Available Reports

### 📋 Markdown Reports (GitHub-Friendly)
- **Detailed Report:** [DETAILED_TEST_REPORT.md](./DETAILED_TEST_REPORT.md)
- **Summary Report:** [../../TEST_REPORT.md](../../TEST_REPORT.md)
- **Status:** ✅ 4/4 Tests Passing
- **Last Updated:** $(date +%Y--%m--%d)

### 🌐 HTML Report (Local Viewing)
- **Location:** `latest-test-report/index.html`
- **Type:** Interactive Playwright HTML Report
- **Best For:** Local development and debugging

## How to View Reports

### GitHub/Web Viewing (Recommended)
```bash
# Detailed markdown report (renders on GitHub)
https://github.com/MindweaveTech/restaurant-daily/blob/main/docs/reports/DETAILED_TEST_REPORT.md

# Quick summary
https://github.com/MindweaveTech/restaurant-daily/blob/main/TEST_REPORT.md
```

### Local Development
```bash
# Interactive HTML report
npx playwright show-report docs/reports/latest-test-report

# Or open directly
open docs/reports/latest-test-report/index.html

# Markdown reports
cat docs/reports/DETAILED_TEST_REPORT.md
cat TEST_REPORT.md
```

## Report Contents

### Playwright HTML Report Includes:
- ✅ Test execution timeline
- 🎯 Detailed test results with screenshots
- 📱 Browser-specific test results
- 🔍 Failed test debugging information (if any)
- 📊 Performance metrics and timings
- 🎬 Video recordings (on failure)
- 📋 Test configuration details

### Benefits
- **Visual Debugging:** Screenshots and videos of test failures
- **Performance Insights:** Load times and rendering metrics
- **Cross-Browser Results:** Desktop and mobile test outcomes
- **Interactive Timeline:** See test execution flow
- **Filtering Options:** Filter by status, browser, or test name

## Automation

Reports are automatically generated:
- ✅ On every `npm run test` execution
- ✅ During pre-push hooks (Husky)
- ✅ In CI/CD pipeline (future implementation)

---

**Last Generated:** $(date +%Y--%m--%d\ %H:%M)
**Test Framework:** Playwright
**Application:** Restaurant Daily