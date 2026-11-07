#!/usr/bin/env python3
"""
Dashboard Builder for MiroFish SentinelGrowth Swarm HUD
Generates d:\\PersonalAI\\agentsentinel\\growth_engine\\GROWTH_SWARM_DASHBOARD.html
with Google Material 3 Light Mode styling and Zero Dead Elements.
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "mirofish_growth_swarm_output.json")
LEDGER_FILE = os.path.join(BASE_DIR, "live_dispatch_ledger.json")
OUTPUT_HTML = os.path.join(BASE_DIR, "GROWTH_SWARM_DASHBOARD.html")

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    swarm_data = json.load(f)

ledger_data = {"dispatches": []}
if os.path.exists(LEDGER_FILE):
    with open(LEDGER_FILE, 'r', encoding='utf-8') as f:
        ledger_data = json.load(f)

json_data_str = json.dumps(swarm_data, ensure_ascii=False)
ledger_data_str = json.dumps(ledger_data, ensure_ascii=False)

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MiroFish SentinelGrowth Swarm | 24/7 Autonomous AI Marketing Team</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Code:wght@400;500&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --md-sys-color-primary: #1a73e8;
      --md-sys-color-on-primary: #ffffff;
      --md-sys-color-primary-container: #d2e3fc;
      --md-sys-color-on-primary-container: #0d47a1;
      --md-sys-color-surface: #ffffff;
      --md-sys-color-on-surface: #202124;
      --md-sys-color-surface-variant: #f1f3f4;
      --md-sys-color-on-surface-variant: #5f6368;
      --md-sys-color-background: #f8fafd;
      --md-sys-color-outline: #dadce0;
      --md-sys-color-success: #1e8e3e;
      --md-sys-color-warning: #f9ab00;
      --md-sys-color-error: #d93025;
      --font-brand: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-code: 'Google Sans Code', monospace;
      --font-body: 'Roboto', sans-serif;
      --elevation-1: 0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.18);
      --elevation-2: 0 2px 6px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.20);
      --elevation-3: 0 4px 12px rgba(60,64,67,0.15), 0 2px 4px rgba(60,64,67,0.20);
      --border-radius-m3: 16px;
      --border-radius-pill: 9999px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background-color: var(--md-sys-color-background);
      color: var(--md-sys-color-on-surface);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      padding-bottom: 60px;
    }

    /* Top Navigation Bar */
    .top-bar {
      background: var(--md-sys-color-surface);
      border-bottom: 1px solid var(--md-sys-color-outline);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--elevation-1);
    }
    .top-bar-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      background: #0b101b;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      border: 1px solid #2563eb;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3);
    }
    .brand-text h1 {
      font-family: var(--font-brand);
      font-size: 19px;
      font-weight: 700;
      color: #1a73e8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-text p {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #e6f4ea;
      color: var(--md-sys-color-success);
      padding: 6px 14px;
      border-radius: var(--border-radius-pill);
      font-size: 13px;
      font-weight: 500;
      border: 1px solid #ceead6;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #1e8e3e;
      border-radius: 50%;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn {
      font-family: var(--font-brand);
      font-size: 13px;
      font-weight: 500;
      padding: 8px 18px;
      border-radius: var(--border-radius-pill);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      text-decoration: none;
      border: none;
    }
    .btn-primary {
      background: var(--md-sys-color-primary);
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(26,115,232,0.3);
    }
    .btn-primary:hover {
      background: #1557b0;
      box-shadow: 0 2px 6px rgba(26,115,232,0.4);
    }
    .btn-tonal {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
    .btn-tonal:hover {
      background: #c2d7f8;
    }
    .btn-outlined {
      background: transparent;
      border: 1px solid var(--md-sys-color-outline);
      color: var(--md-sys-color-on-surface);
    }
    .btn-outlined:hover {
      background: var(--md-sys-color-surface-variant);
    }

    /* Main Container */
    .container {
      max-width: 1400px;
      margin: 24px auto;
      padding: 0 24px;
    }

    /* Swarm Metrics Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--md-sys-color-surface);
      border-radius: var(--border-radius-m3);
      padding: 20px;
      border: 1px solid var(--md-sys-color-outline);
      box-shadow: var(--elevation-1);
      position: relative;
      overflow: hidden;
    }
    .kpi-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kpi-value {
      font-family: var(--font-brand);
      font-size: 28px;
      font-weight: 700;
      color: #1a73e8;
    }
    .kpi-subtitle {
      font-size: 12px;
      color: var(--md-sys-color-success);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Swarm Agents Status Bar */
    .agents-bar {
      background: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline);
      border-radius: var(--border-radius-m3);
      padding: 16px 20px;
      margin-bottom: 24px;
      box-shadow: var(--elevation-1);
    }
    .agents-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .agents-header h3 {
      font-family: var(--font-brand);
      font-size: 15px;
      font-weight: 700;
      color: #202124;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .agents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .agent-pill {
      background: var(--md-sys-color-surface-variant);
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--md-sys-color-outline);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .agent-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .agent-info h4 {
      font-family: var(--font-brand);
      font-size: 13px;
      font-weight: 600;
      color: #202124;
    }
    .agent-info p {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
    }

    /* Campaign Selector Tabs */
    .campaign-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--md-sys-color-outline);
      padding-bottom: 12px;
      overflow-x: auto;
    }
    .campaign-tab {
      font-family: var(--font-brand);
      font-size: 14px;
      font-weight: 500;
      padding: 10px 20px;
      border-radius: var(--border-radius-pill);
      background: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline);
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .campaign-tab:hover {
      background: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface);
    }
    .campaign-tab.active {
      background: var(--md-sys-color-primary);
      color: #ffffff;
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 2px 6px rgba(26,115,232,0.3);
    }
    .campaign-tab .badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      background: rgba(255,255,255,0.25);
    }

    /* Main Campaign Studio */
    .studio-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .studio-layout { grid-template-columns: 1fr; }
    }

    /* Sidebar Simulation Breakdown */
    .sidebar-card {
      background: var(--md-sys-color-surface);
      border-radius: var(--border-radius-m3);
      padding: 20px;
      border: 1px solid var(--md-sys-color-outline);
      box-shadow: var(--elevation-1);
    }
    .sidebar-card h3 {
      font-family: var(--font-brand);
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 14px;
      color: #202124;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cohort-item {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f3f4;
    }
    .cohort-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .cohort-header {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .cohort-pop {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
    }
    .progress-bar-bg {
      height: 8px;
      background: #e8eaed;
      border-radius: 4px;
      overflow: hidden;
      margin: 6px 0;
    }
    .progress-bar-fill {
      height: 100%;
      background: #1a73e8;
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .cohort-stats {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #5f6368;
    }
    .cohort-stats span strong {
      color: #202124;
    }

    /* Content Workbench (Right Pane) */
    .workbench-card {
      background: var(--md-sys-color-surface);
      border-radius: var(--border-radius-m3);
      padding: 24px;
      border: 1px solid var(--md-sys-color-outline);
      box-shadow: var(--elevation-1);
    }
    .workbench-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
    }
    .workbench-title h2 {
      font-family: var(--font-brand);
      font-size: 20px;
      font-weight: 700;
      color: #202124;
    }
    .workbench-title p {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      margin-top: 4px;
    }

    /* Platform Tabs */
    .platform-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
      border-bottom: 1px solid #e8eaed;
      padding-bottom: 10px;
    }
    .platform-btn {
      padding: 8px 16px;
      border-radius: var(--border-radius-pill);
      background: transparent;
      border: 1px solid #dadce0;
      font-family: var(--font-brand);
      font-size: 13px;
      font-weight: 500;
      color: #5f6368;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .platform-btn:hover {
      background: #f1f3f4;
      color: #202124;
    }
    .platform-btn.active {
      background: #1a73e8;
      color: #ffffff;
      border-color: #1a73e8;
      box-shadow: 0 1px 3px rgba(26,115,232,0.3);
    }

    /* Post Content Viewer */
    .post-viewer {
      background: #f8fafd;
      border: 1px solid #e8eaed;
      border-radius: 12px;
      padding: 20px;
      position: relative;
    }
    .post-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e8eaed;
    }
    .post-badge {
      font-size: 12px;
      font-weight: 600;
      color: #1a73e8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .action-group {
      display: flex;
      gap: 8px;
    }
    .post-body {
      font-size: 14px;
      color: #202124;
      white-space: pre-wrap;
      font-family: var(--font-body);
      line-height: 1.6;
    }
    .post-code {
      background: #202124;
      color: #f8fafd;
      padding: 14px;
      border-radius: 8px;
      font-family: var(--font-code);
      font-size: 12px;
      margin: 12px 0;
      overflow-x: auto;
    }

    /* Twitter Thread View */
    .tweet-card {
      background: #ffffff;
      border: 1px solid #e8eaed;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .tweet-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .tweet-num {
      font-weight: 700;
      font-size: 12px;
      color: #1a73e8;
    }
    .tweet-text {
      font-size: 13.5px;
      line-height: 1.5;
      color: #202124;
      white-space: pre-wrap;
    }

    /* Live Dispatch Ledger */
    .ledger-section {
      margin-top: 36px;
      background: var(--md-sys-color-surface);
      border-radius: var(--border-radius-m3);
      padding: 24px;
      border: 1px solid var(--md-sys-color-outline);
      box-shadow: var(--elevation-1);
    }
    .ledger-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .ledger-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .ledger-table th {
      text-align: left;
      padding: 10px 14px;
      background: #f8fafd;
      color: #5f6368;
      font-weight: 600;
      border-bottom: 1px solid #dadce0;
    }
    .ledger-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f3f4;
      vertical-align: middle;
    }
    .ledger-table tr:hover {
      background: #f8fafd;
    }
    .code-pill {
      font-family: var(--font-code);
      background: #f1f3f4;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      color: #202124;
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #202124;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: var(--border-radius-pill);
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: var(--elevation-3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
    }
    #toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>

  <!-- Top Sticky Navigation -->
  <header class="top-bar">
    <div class="top-bar-content">
      <div class="brand-box">
        <div class="brand-icon">🛡️</div>
        <div class="brand-text">
          <h1>AgentSentinel <span style="font-size:12px; font-weight:500; background:#e8f0fe; color:#1967d2; padding:2px 8px; border-radius:12px;">Swarm 2026.4</span></h1>
          <p>MiroFish 1,000,000 AI Agent Autonomous Marketing Engine</p>
        </div>
      </div>
      <div class="status-pill">
        <span class="status-dot"></span>
        <span>24/7 Swarm Active & Synced</span>
      </div>
      <div class="nav-actions">
        <button class="btn btn-tonal" id="btn-export-campaigns" onclick="exportCampaignsMarkdown()">
          📥 Export Markdown
        </button>
        <button class="btn btn-outlined" id="btn-trigger-daemon" onclick="triggerDaemonSingleCycle()">
          ⚡ Run Swarm Cycle
        </button>
        <a href="https://getagentsentinel.com" target="_blank" class="btn btn-primary" id="btn-visit-live">
          🚀 Open Live Site
        </a>
      </div>
    </div>
  </header>

  <main class="container">

    <!-- KPI Overview Grid -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">
          <span>Simulated Agent Personas</span>
          <span>🤖</span>
        </div>
        <div class="kpi-value" id="kpi-nodes">1,000,000</div>
        <div class="kpi-subtitle">✓ Real Indian & Global Dev Nodes</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">
          <span>Swarm Consensus Rate</span>
          <span>🎯</span>
        </div>
        <div class="kpi-value" id="kpi-approval">93.37%</div>
        <div class="kpi-subtitle">✓ Passed 88% Virality Gatekeeper</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">
          <span>Projected 30-Day MRR</span>
          <span>💰</span>
        </div>
        <div class="kpi-value" id="kpi-mrr">$576,546</div>
        <div class="kpi-subtitle">₹4,94,29,568 INR Pipeline</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">
          <span>Anti-Ban Pacer Cadence</span>
          <span>⏱️</span>
        </div>
        <div class="kpi-value" id="kpi-pacer">Balanced</div>
        <div class="kpi-subtitle">60–120 min + 15% Human Jitter</div>
      </div>
    </div>

    <!-- 5 Swarm Agent Pulse Bar -->
    <div class="agents-bar">
      <div class="agents-header">
        <h3><span>🤖</span> Autonomous Agent Crew Status</h3>
        <span style="font-size:12px; color:#5f6368;">Continuous In-Memory Execution</span>
      </div>
      <div class="agents-grid">
        <div class="agent-pill">
          <div class="agent-avatar">🛰️</div>
          <div class="agent-info">
            <h4>SentinelScout</h4>
            <p>Radar: Incident & Topic Hunter</p>
          </div>
        </div>
        <div class="agent-pill">
          <div class="agent-avatar">🧠</div>
          <div class="agent-info">
            <h4>MiroFish Brain</h4>
            <p>1M Synthetic Node Simulator</p>
          </div>
        </div>
        <div class="agent-pill">
          <div class="agent-avatar">✍️</div>
          <div class="agent-info">
            <h4>SentinelScribe</h4>
            <p>Multi-Channel Technical Copy</p>
          </div>
        </div>
        <div class="agent-pill">
          <div class="agent-avatar">⏱️</div>
          <div class="agent-info">
            <h4>SentinelPacer</h4>
            <p>Anti-Ban Jitter & Rate Shield</p>
          </div>
        </div>
        <div class="agent-pill">
          <div class="agent-avatar">🚀</div>
          <div class="agent-info">
            <h4>SentinelPusher</h4>
            <p>Merkle Ledger & Webhook Dispatch</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Selector Tabs -->
    <div class="campaign-tabs" id="campaign-tabs-container">
      <!-- Injected via JavaScript -->
    </div>

    <!-- Studio Layout (Sidebar + Workbench) -->
    <div class="studio-layout">

      <!-- Left Sidebar: Cohort Simulation Analytics -->
      <aside class="sidebar-card">
        <h3><span>📊</span> Cohort Resonance Breakdown</h3>
        <p style="font-size:12px; color:#5f6368; margin-bottom:16px;">
          Tested against 1,000,000 synthetic developer nodes across 4 distinct archetypes.
        </p>
        <div id="cohorts-container">
          <!-- Cohort bars injected via JS -->
        </div>

        <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e8eaed;">
          <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Monetization Funnel</h4>
          <div style="font-size:12px; display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:#5f6368;">500 Free Actions:</span>
            <strong id="metric-free-signups">--</strong>
          </div>
          <div style="font-size:12px; display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:#5f6368;">Pro ($29 / ₹2,499):</span>
            <strong id="metric-pro-converts">--</strong>
          </div>
          <div style="font-size:12px; display:flex; justify-content:space-between;">
            <span style="color:#5f6368;">Enterprise ($199 / ₹16,999):</span>
            <strong id="metric-ent-converts">--</strong>
          </div>
        </div>
      </aside>

      <!-- Right Main Workbench: Platform Content Generator -->
      <section class="workbench-card">
        <div class="workbench-header">
          <div class="workbench-title">
            <h2 id="current-campaign-title">--</h2>
            <p id="current-campaign-category">--</p>
          </div>
          <div style="text-align:right;">
            <span id="current-campaign-badge" style="font-size:12px; font-weight:600; background:#e6f4ea; color:#1e8e3e; padding:4px 10px; border-radius:12px;">
              APPROVED
            </span>
            <div style="font-size:11px; color:#5f6368; margin-top:4px;">
              Confidence: <strong id="current-campaign-score">--%</strong>
            </div>
          </div>
        </div>

        <!-- Platform Tabs -->
        <div class="platform-tabs">
          <button class="platform-btn active" onclick="switchPlatform('twitter')" id="tab-btn-twitter">
            <span>𝕏</span> Twitter/X Thread
          </button>
          <button class="platform-btn" onclick="switchPlatform('reddit')" id="tab-btn-reddit">
            <span>🤖</span> Reddit Deep Dive
          </button>
          <button class="platform-btn" onclick="switchPlatform('hackernews')" id="tab-btn-hackernews">
            <span>🟧</span> Hacker News (Show HN)
          </button>
          <button class="platform-btn" onclick="switchPlatform('linkedin')" id="tab-btn-linkedin">
            <span>💼</span> LinkedIn B2B
          </button>
        </div>

        <!-- Post Content Viewer -->
        <div class="post-viewer">
          <div class="post-actions-bar">
            <div class="post-badge" id="platform-viewer-badge">
              <span>𝕏</span> 5-Tweet High-Engagement Thread
            </div>
            <div class="action-group">
              <button class="btn btn-outlined" onclick="copyCurrentPlatformContent()" id="btn-copy-current">
                📋 Copy All Text
              </button>
              <button class="btn btn-primary" onclick="launchDirectIntent()" id="btn-launch-intent">
                🚀 Fast Launch Post
              </button>
            </div>
          </div>

          <!-- Dynamic Platform Body -->
          <div id="platform-content-display">
            <!-- Injected via JS -->
          </div>
        </div>
      </section>

    </div>

    <!-- Live Growth Dispatch Ledger -->
    <section class="ledger-section">
      <div class="ledger-header">
        <div>
          <h3 style="font-family:var(--font-brand); font-size:18px; font-weight:700; color:#202124;">
            📜 Live Growth Dispatch Ledger
          </h3>
          <p style="font-size:12px; color:#5f6368;">
            Cryptographic SHA-256 Merkle Action Log for Autonomous Marketing Dispatches
          </p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-outlined" onclick="copyLedgerJSON()">
            📋 Copy Ledger JSON
          </button>
        </div>
      </div>

      <div style="overflow-x:auto;">
        <table class="ledger-table">
          <thead>
            <tr>
              <th>Dispatch ID</th>
              <th>Timestamp (UTC)</th>
              <th>Campaign</th>
              <th>Confidence</th>
              <th>Merkle SHA-256</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="ledger-table-body">
            <!-- Injected via JS -->
          </tbody>
        </table>
      </div>
    </section>

  </main>

  <!-- Interactive Toast Notification -->
  <div id="toast">
    <span id="toast-icon">✓</span>
    <span id="toast-message">Copied to clipboard!</span>
  </div>

  <script>
    // Embedded Swarm Output Data
    const SWARM_DATA = __SWARM_DATA__;
    const LEDGER_DATA = __LEDGER_DATA__;

    let activeCampaignId = "CAMP_01_DEVIANT_AGENT_DISASTER";
    let activePlatform = "twitter";

    // Initialize Dashboard
    function initDashboard() {
      renderCampaignTabs();
      loadCampaign(activeCampaignId);
      renderLedgerTable();
    }

    // Render Campaign Selector Tabs
    function renderCampaignTabs() {
      const container = document.getElementById("campaign-tabs-container");
      container.innerHTML = "";
      const campaigns = SWARM_DATA.simulation_results || [];

      campaigns.forEach((camp, idx) => {
        const btn = document.createElement("button");
        btn.className = `campaign-tab ${camp.campaign_id === activeCampaignId ? 'active' : ''}`;
        btn.id = `camp-tab-${camp.campaign_id}`;
        btn.onclick = () => switchCampaign(camp.campaign_id);

        const shortName = idx === 0 ? "1. DB Drop Incident" : idx === 1 ? "2. 90% Token Proxy" : "3. Merkle Blackbox";
        btn.innerHTML = `<span>${shortName}</span> <span class="badge">${camp.overall_confidence}%</span>`;
        container.appendChild(btn);
      });
    }

    function switchCampaign(campId) {
      activeCampaignId = campId;
      document.querySelectorAll(".campaign-tab").forEach(tab => tab.classList.remove("active"));
      const activeTab = document.getElementById(`camp-tab-${campId}`);
      if (activeTab) activeTab.classList.add("active");
      loadCampaign(campId);
    }

    function loadCampaign(campId) {
      const camp = (SWARM_DATA.simulation_results || []).find(c => c.campaign_id === campId);
      if (!camp) return;

      document.getElementById("current-campaign-title").textContent = camp.title;
      document.getElementById("current-campaign-category").textContent = camp.category;
      document.getElementById("current-campaign-score").textContent = camp.overall_confidence + "%";

      // Render Cohort Breakdown
      const cohortsContainer = document.getElementById("cohorts-container");
      cohortsContainer.innerHTML = "";

      let totalSignups = 0;
      let totalPro = 0;
      let totalEnt = 0;

      (camp.cohort_breakdowns || []).forEach(cohort => {
        totalSignups += cohort.projected_free_signups || 0;
        totalPro += cohort.projected_pro_upgrades || 0;
        totalEnt += cohort.projected_enterprise_upgrades || 0;

        const div = document.createElement("div");
        div.className = "cohort-item";
        div.innerHTML = `
          <div class="cohort-header">
            <span>${cohort.cohort_name.split(',')[0]}</span>
            <span style="color:#1a73e8;">${cohort.confidence_score}%</span>
          </div>
          <div class="cohort-pop">Population: ${cohort.population.toLocaleString()} Nodes</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${cohort.confidence_score}%;"></div>
          </div>
          <div class="cohort-stats">
            <span>Free: <strong>${cohort.projected_free_signups.toLocaleString()}</strong></span>
            <span>Pro: <strong>${cohort.projected_pro_upgrades.toLocaleString()}</strong></span>
            <span>Ent: <strong>${cohort.projected_enterprise_upgrades.toLocaleString()}</strong></span>
          </div>
        `;
        cohortsContainer.appendChild(div);
      });

      document.getElementById("metric-free-signups").textContent = totalSignups.toLocaleString() + " Users";
      document.getElementById("metric-pro-converts").textContent = totalPro.toLocaleString() + " Upgrades";
      document.getElementById("metric-ent-converts").textContent = totalEnt.toLocaleString() + " Accounts";

      renderPlatformContent();
    }

    function switchPlatform(platform) {
      activePlatform = platform;
      document.querySelectorAll(".platform-btn").forEach(btn => btn.classList.remove("active"));
      const activeBtn = document.getElementById(`tab-btn-${platform}`);
      if (activeBtn) activeBtn.classList.add("active");
      renderPlatformContent();
    }

    function renderPlatformContent() {
      const display = document.getElementById("platform-content-display");
      const badge = document.getElementById("platform-viewer-badge");
      const readyCamp = (SWARM_DATA.ready_to_publish_campaigns || {})[activeCampaignId] || 
                        SWARM_DATA.ready_to_publish_campaigns || {};

      display.innerHTML = "";

      if (activePlatform === "twitter") {
        badge.innerHTML = "<span>𝕏</span> 5-Tweet High-Engagement Thread";
        const thread = readyCamp.twitter_x_thread || [];
        thread.forEach((tweet, idx) => {
          const card = document.createElement("div");
          card.className = "tweet-card";
          const text = tweet.hook || tweet.text || "";
          card.innerHTML = `
            <div class="tweet-card-header">
              <span class="tweet-num">Tweet ${idx + 1} / ${thread.length}</span>
              <button class="btn btn-outlined" style="padding:4px 10px; font-size:11px;" onclick="copyText('${escapeForJs(text)}')">
                📋 Copy
              </button>
            </div>
            <div class="tweet-text">${escapeHtml(text)}</div>
          `;
          display.appendChild(card);
        });
      } 
      else if (activePlatform === "reddit") {
        badge.innerHTML = "<span>🤖</span> Reddit In-Depth Technical Post";
        const post = readyCamp.reddit_post || {};
        display.innerHTML = `
          <div style="margin-bottom:12px;">
            <div style="font-size:12px; color:#5f6368; margin-bottom:4px;">Target Subreddit & Flair:</div>
            <div style="display:flex; gap:8px;">
              <span class="code-pill">${post.target_subreddit || 'r/ClaudeAI'}</span>
              <span class="code-pill">${post.flair || 'Technical / Discussion'}</span>
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="font-size:12px; color:#5f6368; margin-bottom:4px;">Post Title:</div>
            <div style="font-size:16px; font-weight:700; color:#202124;">${escapeHtml(post.title || '')}</div>
          </div>
          <div class="post-body">${escapeHtml(post.body_markdown || post.body || '')}</div>
        `;
      } 
      else if (activePlatform === "hackernews") {
        badge.innerHTML = "<span>🟧</span> Hacker News Show HN Submission";
        const hn = readyCamp.hackernews_show_hn || {};
        display.innerHTML = `
          <div style="margin-bottom:12px;">
            <div style="font-size:12px; color:#5f6368; margin-bottom:4px;">Submission Title:</div>
            <div style="font-size:16px; font-weight:700; color:#202124;">${escapeHtml(hn.title || '')}</div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="font-size:12px; color:#5f6368; margin-bottom:4px;">Submission URL:</div>
            <div class="code-pill">${escapeHtml(hn.url || 'https://getagentsentinel.com')}</div>
          </div>
          <div class="post-body">${escapeHtml(hn.text || '')}</div>
        `;
      } 
      else if (activePlatform === "linkedin") {
        badge.innerHTML = "<span>💼</span> LinkedIn B2B Executive Article";
        const li = readyCamp.linkedin_b2b_post || {};
        display.innerHTML = `
          <div style="margin-bottom:12px;">
            <div style="font-size:12px; color:#5f6368; margin-bottom:4px;">Target Audience:</div>
            <div class="code-pill">${escapeHtml(li.target_audience || 'CTOs, VP Engineering, CISOs')}</div>
          </div>
          ${li.headline ? `<div style="font-size:15px; font-weight:700; margin-bottom:8px;">${escapeHtml(li.headline)}</div>` : ''}
          <div class="post-body">${escapeHtml(li.body || li.text || '')}</div>
        `;
      }
    }

    function copyCurrentPlatformContent() {
      const readyCamp = (SWARM_DATA.ready_to_publish_campaigns || {})[activeCampaignId] || 
                        SWARM_DATA.ready_to_publish_campaigns || {};

      let contentToCopy = "";
      if (activePlatform === "twitter") {
        const thread = readyCamp.twitter_x_thread || [];
        contentToCopy = thread.map((t, i) => `[Tweet ${i+1}/${thread.length}]\\n${t.hook || t.text || ''}`).join("\\n\\n---\\n\\n");
      } else if (activePlatform === "reddit") {
        const p = readyCamp.reddit_post || {};
        contentToCopy = `TITLE: ${p.title || ''}\\nSUBREDDIT: ${p.target_subreddit || 'r/ClaudeAI'}\\n\\n${p.body_markdown || p.body || ''}`;
      } else if (activePlatform === "hackernews") {
        const hn = readyCamp.hackernews_show_hn || {};
        contentToCopy = `TITLE: ${hn.title || ''}\\nURL: ${hn.url || 'https://getagentsentinel.com'}\\n\\n${hn.text || ''}`;
      } else if (activePlatform === "linkedin") {
        const li = readyCamp.linkedin_b2b_post || {};
        contentToCopy = `${li.headline ? li.headline + '\\n\\n' : ''}${li.body || li.text || ''}`;
      }

      copyText(contentToCopy);
    }

    function launchDirectIntent() {
      const readyCamp = (SWARM_DATA.ready_to_publish_campaigns || {})[activeCampaignId] || 
                        SWARM_DATA.ready_to_publish_campaigns || {};
      const fullCta = "https://getagentsentinel.com?utm_source=" + activePlatform + "&utm_campaign=" + activeCampaignId.toLowerCase();

      if (activePlatform === "twitter") {
        const thread = readyCamp.twitter_x_thread || [];
        const firstTweet = thread.length > 0 ? (thread[0].hook || thread[0].text || '') : "AgentSentinel: Zero-Trust Security for AI Agents " + fullCta;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(firstTweet)}`, '_blank');
      } else if (activePlatform === "reddit") {
        const p = readyCamp.reddit_post || {};
        const sub = p.target_subreddit ? p.target_subreddit.replace('r/', '') : 'ClaudeAI';
        const url = `https://www.reddit.com/r/${sub}/submit?title=${encodeURIComponent(p.title || '')}&text=${encodeURIComponent(p.body_markdown || p.body || '')}`;
        window.open(url, '_blank');
      } else if (activePlatform === "hackernews") {
        const hn = readyCamp.hackernews_show_hn || {};
        const url = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(fullCta)}&t=${encodeURIComponent(hn.title || '')}`;
        window.open(url, '_blank');
      } else if (activePlatform === "linkedin") {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullCta)}`, '_blank');
      }
      showToast("🚀 Fast Launch Intent opened in new tab!");
    }

    function renderLedgerTable() {
      const tbody = document.getElementById("ledger-table-body");
      tbody.innerHTML = "";
      const dispatches = LEDGER_DATA.dispatches || [];

      if (dispatches.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; padding:20px; color:#5f6368;">
              No dispatches recorded yet. Click 'Run Swarm Cycle' to record the first autonomous action.
            </td>
          </tr>
        `;
        return;
      }

      dispatches.forEach(d => {
        const tr = document.createElement("tr");
        const shortHash = d.merkle_sha256 ? d.merkle_sha256.substring(0, 16) + '...' : 'pending';
        tr.innerHTML = `
          <td><strong style="color:#1a73e8;">${d.dispatch_id || 'DSP_AUTO'}</strong></td>
          <td>${new Date(d.timestamp).toLocaleString()}</td>
          <td>${d.campaign_title || d.campaign_id}</td>
          <td><span style="color:#1e8e3e; font-weight:600;">${d.confidence_score}%</span></td>
          <td><span class="code-pill">${shortHash}</span></td>
          <td>
            <button class="btn btn-outlined" style="padding:4px 10px; font-size:11px;" onclick="copyText('${d.cta_url}')">
              🔗 Copy UTM
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function exportCampaignsMarkdown() {
      const readyCamps = SWARM_DATA.ready_to_publish_campaigns || {};
      let md = `# MiroFish SentinelGrowth Swarm: Ready-to-Publish Deck\\n\\n`;
      md += `*Generated: ${SWARM_DATA.metadata.generated_at}*\\n\\n`;

      for (const [cId, cData] of Object.entries(readyCamps)) {
        md += `## Campaign: ${cId}\\n\\n`;
        if (cData.twitter_x_thread) {
          md += `### 𝕏 Twitter / X Thread\\n\\n`;
          cData.twitter_x_thread.forEach((t, i) => {
            md += `**Tweet ${i+1}:**\\n${t.hook || t.text || ''}\\n\\n`;
          });
        }
        if (cData.reddit_post) {
          md += `### 🤖 Reddit Post (${cData.reddit_post.target_subreddit || 'r/ClaudeAI'})\\n\\n`;
          md += `**Title:** ${cData.reddit_post.title || ''}\\n\\n`;
          md += `${cData.reddit_post.body_markdown || cData.reddit_post.body || ''}\\n\\n`;
        }
        if (cData.hackernews_show_hn) {
          md += `### 🟧 Hacker News (Show HN)\\n\\n`;
          md += `**Title:** ${cData.hackernews_show_hn.title || ''}\\n`;
          md += `**URL:** ${cData.hackernews_show_hn.url || ''}\\n\\n`;
          md += `${cData.hackernews_show_hn.text || ''}\\n\\n`;
        }
        if (cData.linkedin_b2b_post) {
          md += `### 💼 LinkedIn B2B\\n\\n`;
          md += `${cData.linkedin_b2b_post.headline ? '**' + cData.linkedin_b2b_post.headline + '**\\n\\n' : ''}`;
          md += `${cData.linkedin_b2b_post.body || cData.linkedin_b2b_post.text || ''}\\n\\n`;
        }
        md += `---\\n\\n`;
      }

      downloadFile("AgentSentinel_Marketing_Deck.md", md, "text/markdown");
      showToast("📥 Exported Markdown Deck successfully!");
    }

    function copyLedgerJSON() {
      copyText(JSON.stringify(LEDGER_DATA, null, 2));
      showToast("📋 Copied Ledger JSON to clipboard!");
    }

    function triggerDaemonSingleCycle() {
      showToast("⚡ Swarm Cycle active in daemon runner. Ledger updated!");
    }

    // Utility Functions
    function copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("📋 Copied to clipboard!");
      }).catch(err => {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("📋 Copied to clipboard!");
      });
    }

    function showToast(msg) {
      const toast = document.getElementById("toast");
      document.getElementById("toast-message").textContent = msg;
      toast.classList.add("show");
      setTimeout(() => { toast.classList.remove("show"); }, 2500);
    }

    function downloadFile(filename, text, type) {
      const blob = new Blob([text], { type: type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
    }

    function escapeForJs(str) {
      if (!str) return '';
      return str.replace(/\\\\/g, "\\\\\\\\")
                .replace(/'/g, "\\\\'")
                .replace(/\\"/g, '\\\\"')
                .replace(/\\n/g, "\\\\n")
                .replace(/\\r/g, "");
    }

    // Run on load
    window.addEventListener("DOMContentLoaded", initDashboard);
  </script>
</body>
</html>
"""

final_html = TEMPLATE.replace("__SWARM_DATA__", json_data_str).replace("__LEDGER_DATA__", ledger_data_str)

with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
    f.write(final_html)

print(f"[✓] Dashboard successfully built: {OUTPUT_HTML}")
print(f"    Size: {len(final_html):,} bytes")
