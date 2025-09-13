# 📊 Test Reports

This directory contains test reports and documentation for the Restaurant Daily application.

## Available Reports

### Latest Test Report
- **Location:** `latest-test-report/index.html`
- **Type:** Playwright HTML Report
- **Status:** ✅ 4/4 Tests Passing
- **Last Updated:** $(date +%Y--%m--%d)

### How to View Reports

#### HTML Test Report (Detailed)
```bash
# Open in browser
open docs/reports/latest-test-report/index.html

# Or use Playwright command
npx playwright show-report docs/reports/latest-test-report
```

#### Markdown Summary
```bash
# View test summary
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