# Privacy Policy for SmartTabs

**Effective Date:** July 15, 2026

SmartTabs ("we," "our," or "the Extension") is dedicated to providing power user tab management utilities with absolute data privacy. This document outlines our data operations and strict user protection metrics.

## 1. Data Collection & Processing
SmartTabs operates under a strict **Zero-Server Architecture**:
- **Local Preservation Only**: All configured workspace entities, targeted URLs, scheduling alarms, and metadata logs are encapsulated locally inside your browser's client-side secure subsystem (`chrome.storage.local`).
- **No Remote Transmission**: No data is collected, monitored, tracked, synced, or transmitted to any external servers, third-party clouds, or data brokers.

## 2. Explanation of Chrome API Permissions
To perform its optimization workflows, the Extension requests access to specialized system frameworks:
- `storage`: Required to securely persist your custom workspace state and layout preferences on your hardware.
- `tabs`: Necessary to dynamically coordinate window routing, focus adjustments, and deduplication logic.
- `alarms`: Used to trigger scheduled environment launches at user-defined hours.
- `notifications`: Utilized solely to push local OS system confirmations regarding execution metrics.
- `contextMenus`: Grants the ability to register the native right-click shortcut to append assets locally.
- `<all_urls>` (Host Permissions): Strictly utilized to parse target links against configuration states locally during duplicate rule validation.

## 3. Data Retention & Deletion
Since all operational data lives exclusively on the user's host machine, removing the extension via `chrome://extensions/` instantly wipes out 100% of stored preferences and histories permanently.

For inquiries regarding this privacy construct, please reach out via GitHub or professional contact points for `@dharmendra-swe`.