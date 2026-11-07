@echo off
title MiroFish SentinelGrowth Swarm - 24/7 Autonomous Marketing Engine
echo ===============================================================================
echo 🐟 MIROFISH SENTINELGROWTH: 24/7 AUTONOMOUS AI MARKETING SWARM
echo Target: AgentSentinel (https://getagentsentinel.com)
echo Mode: 1,000,000 Synthetic Developer Agent Simulation + Anti-Ban Pacer
echo ===============================================================================

cd /d "%~dp0"

echo [1/3] Verifying Simulation Data...
python mirofish_growth_swarm_engine.py

echo [2/3] Building & Syncing Growth Dashboard...
python build_dashboard.py

echo [3/3] Opening Interactive Swarm HUD in Browser...
start "" "%~dp0GROWTH_SWARM_DASHBOARD.html"

echo ===============================================================================
echo [✓] Dashboard is now LIVE in your browser!
echo Starting SentinelPoster 24/7 Autonomous Daemon in background...
echo Pacing: Balanced Human Cadence (60-120 min + 15%% jitter)
echo Press Ctrl+C in this terminal anytime to stop the background pacer.
echo ===============================================================================

python autonomous_poster_daemon.py --daemon
pause
