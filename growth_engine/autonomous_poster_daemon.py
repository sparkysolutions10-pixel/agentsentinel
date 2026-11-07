#!/usr/bin/env python3
"""
================================================================================
🤖 AUTONOMOUS SENTINELPOSTER DAEMON (24/7 GROWTH ENGINE)
================================================================================
Continuous background multi-agent marketing runner for AgentSentinel.
Orchestrates:
- SentinelScout: Incident & topic selection
- MiroFish Simulator: 1,000,000 synthetic agent pre-validation
- SentinelScribe: Platform-specific post crafting
- SentinelPacer: Anti-ban randomized jitter timing
- SentinelPusher: Multi-channel dispatch & cryptographic ledger recording
================================================================================
"""

import sys
import os
import json
import time
import random
import hashlib
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "growth_config.json")
SWARM_OUTPUT_PATH = os.path.join(BASE_DIR, "mirofish_growth_swarm_output.json")
LEDGER_PATH = os.path.join(BASE_DIR, "live_dispatch_ledger.json")

def load_json(filepath, default=None):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Warning reading {filepath}: {e}")
    return default if default is not None else {}

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def dispatch_webhook(url, payload):
    """Safely dispatches payload to external webhook (Discord/Slack/Make/Zapier)"""
    if not url or not url.startswith("http"):
        return False, "No valid webhook configured"
    try:
        req_data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "AgentSentinel-GrowthSwarm/2026.4"
            }
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return True, f"HTTP {response.status}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}: {e.reason}"
    except Exception as e:
        return False, str(e)

class SentinelPosterDaemon:
    def __init__(self):
        self.config = load_json(CONFIG_PATH, {})
        self.swarm_data = load_json(SWARM_OUTPUT_PATH, {})
        self.ledger = load_json(LEDGER_PATH, {"dispatches": [], "stats": {"total_dispatches": 0, "successful_webhooks": 0}})

    def ensure_swarm_data(self):
        """Regenerates swarm simulation if not present"""
        if not self.swarm_data or "simulation_results" not in self.swarm_data:
            print("[*] Swarm data missing. Running MiroFish 1M Agent Simulation first...")
            engine_script = os.path.join(BASE_DIR, "mirofish_growth_swarm_engine.py")
            if os.path.exists(engine_script):
                import subprocess
                subprocess.run([sys.executable, engine_script], check=True)
                self.swarm_data = load_json(SWARM_OUTPUT_PATH, {})

    def calculate_next_interval(self):
        """SentinelPacer: Anti-ban randomized jitter calculation"""
        pacing_mode = self.config.get("pacing_mode", "BALANCED")
        profile = self.config.get("pacing_profiles", {}).get(pacing_mode, {})
        
        min_min = profile.get("interval_minutes_min", 60)
        max_min = profile.get("interval_minutes_max", 120)
        jitter = profile.get("jitter_factor", 0.15)
        
        base_minutes = random.uniform(min_min, max_min)
        jitter_delta = base_minutes * jitter * random.uniform(-1.0, 1.0)
        final_minutes = max(10, base_minutes + jitter_delta)
        return round(final_minutes, 1)

    def select_next_campaign(self):
        """SentinelScout: Selects highest-resonance campaign from simulation"""
        campaigns = self.swarm_data.get("simulation_results", [])
        if not campaigns:
            return None
        
        # Sort by overall confidence score
        sorted_camps = sorted(campaigns, key=lambda c: c.get("overall_confidence", 0), reverse=True)
        # Select weighted by confidence
        chosen = random.choice(sorted_camps[:2])
        return chosen

    def prepare_dispatch_bundle(self, campaign):
        """SentinelScribe: Bundles multi-platform posts with UTM tags"""
        camp_id = campaign.get("campaign_id", "CAMP_01_DEVIANT_AGENT_DISASTER")
        ready_campaigns = self.swarm_data.get("ready_to_publish_campaigns", {})
        camp_assets = ready_campaigns.get(camp_id) or ready_campaigns.get("CAMP_01_DEVIANT_AGENT_DISASTER") or ready_campaigns
        
        landing_url = self.config.get("landing_url", "https://getagentsentinel.com")
        utm_params = self.config.get("utm_parameters", {})
        
        utm_suffix = f"?utm_source=ai_swarm&utm_campaign={camp_id.lower()}&utm_medium={utm_params.get('utm_medium', 'autonomous')}"
        full_cta_url = f"{landing_url}{utm_suffix}"
        
        raw_twitter_thread = camp_assets.get("twitter_x_thread", [])
        twitter_thread = []
        for item in raw_twitter_thread:
            if isinstance(item, str):
                twitter_thread.append(item)
            elif isinstance(item, dict):
                text = item.get("hook") or item.get("text") or ""
                cta = item.get("cta")
                if cta and cta not in text:
                    text = f"{text}\n\n🔗 {full_cta_url}"
                twitter_thread.append(text)
        
        reddit_post = camp_assets.get("reddit_post", {})
        hn_post = camp_assets.get("hackernews_show_hn", {})
        linkedin_post = camp_assets.get("linkedin_b2b_post", {})
        
        first_tweet = twitter_thread[0] if twitter_thread else f"AgentSentinel: Zero-Trust AI Agent Security {full_cta_url}"
        
        dispatch_id = f"DSP_{int(time.time())}_{random.randint(1000, 9999)}"
        bundle = {
            "dispatch_id": dispatch_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "campaign_id": camp_id,
            "campaign_title": campaign.get("title", ""),
            "confidence_score": campaign.get("overall_confidence", 90.0),
            "cta_url": full_cta_url,
            "platforms": {
                "twitter_x": {
                    "tweets": twitter_thread,
                    "tweet_count": len(twitter_thread),
                    "intent_url": f"https://twitter.com/intent/tweet?text={urllib.parse.quote(first_tweet)}"
                },
                "reddit": {
                    "subreddit": reddit_post.get("target_subreddit", "r/ClaudeAI"),
                    "title": reddit_post.get("title", ""),
                    "body": reddit_post.get("body_markdown", ""),
                    "intent_url": f"https://www.reddit.com/{reddit_post.get('target_subreddit', 'r/ClaudeAI')}/submit?title={urllib.parse.quote(reddit_post.get('title', ''))}&text={urllib.parse.quote(reddit_post.get('body_markdown', ''))}"
                },
                "hackernews": {
                    "title": hn_post.get("title", ""),
                    "url": hn_post.get("url", full_cta_url),
                    "text": hn_post.get("text", ""),
                    "intent_url": f"https://news.ycombinator.com/submitlink?u={urllib.parse.quote(hn_post.get('url', full_cta_url))}&t={urllib.parse.quote(hn_post.get('title', ''))}"
                },
                "linkedin": {
                    "headline": linkedin_post.get("headline", ""),
                    "body": linkedin_post.get("body", ""),
                    "intent_url": f"https://www.linkedin.com/sharing/share-offsite/?url={urllib.parse.quote(full_cta_url)}"
                }
            }
        }
        
        # Calculate cryptographic hash of content for forensic verification
        raw_repr = json.dumps(bundle, sort_keys=True).encode('utf-8')
        bundle["merkle_sha256"] = hashlib.sha256(raw_repr).hexdigest()
        return bundle

    def execute_single_cycle(self):
        """Executes one complete autonomous scout-simulate-scribe-push cycle"""
        self.ensure_swarm_data()
        campaign = self.select_next_campaign()
        if not campaign:
            print("[!] Error: No valid campaign found in swarm data.")
            return None
        
        print(f"\n[+] SentinelScout Triggered: Selected '{campaign.get('title')}'")
        print(f"    Confidence: {campaign.get('overall_confidence')}% across 1M Synthetic Nodes")
        
        bundle = self.prepare_dispatch_bundle(campaign)
        print(f"[+] SentinelScribe Generated: Multi-platform bundle [{bundle['dispatch_id']}]")
        print(f"    Merkle SHA-256: {bundle['merkle_sha256'][:16]}...")
        
        # Push to external webhooks if configured
        webhook_results = {}
        for wh_name, wh_url in self.config.get("webhooks", {}).items():
            if wh_url:
                payload = {
                    "content": f"🚨 **AgentSentinel Autonomous Marketing Swarm: New Campaign Ready**\n**{bundle['campaign_title']}**\nConfidence: {bundle['confidence_score']}%\nLaunch URL: {bundle['cta_url']}",
                    "embeds": [
                        {
                            "title": bundle["campaign_title"],
                            "description": bundle["platforms"]["twitter_x"]["tweets"][0] if bundle["platforms"]["twitter_x"]["tweets"] else "",
                            "url": bundle["cta_url"],
                            "color": 3447003
                        }
                    ]
                }
                success, msg = dispatch_webhook(wh_url, payload)
                webhook_results[wh_name] = {"success": success, "message": msg}
                if success:
                    print(f"    [✓] Webhook dispatched to {wh_name}: {msg}")
                else:
                    print(f"    [!] Webhook failed for {wh_name}: {msg}")
        
        bundle["webhook_results"] = webhook_results
        
        # Append to live ledger
        self.ledger["dispatches"].insert(0, bundle)
        # Keep latest 100 dispatches
        self.ledger["dispatches"] = self.ledger["dispatches"][:100]
        self.ledger["stats"]["total_dispatches"] = self.ledger["stats"].get("total_dispatches", 0) + 1
        if any(r.get("success") for r in webhook_results.values()):
            self.ledger["stats"]["successful_webhooks"] = self.ledger["stats"].get("successful_webhooks", 0) + 1
        
        save_json(LEDGER_PATH, self.ledger)
        
        # Update last run in config
        self.config["last_run_timestamp"] = datetime.now(timezone.utc).isoformat()
        save_json(CONFIG_PATH, self.config)
        
        next_interval = self.calculate_next_interval()
        print(f"[✓] SentinelPacer: Next scheduled campaign in {next_interval} minutes (Anti-ban jitter active)")
        return bundle

    def run_daemon(self):
        """24/7 continuous autonomous runner"""
        print("=" * 80)
        print("🚀 STARTING SENTINELPOSTER 24/7 AUTONOMOUS MARKETING DAEMON")
        print(f"Target: {self.config.get('target_product')} ({self.config.get('landing_url')})")
        print(f"Pacing Mode: {self.config.get('pacing_mode')}")
        print("Press Ctrl+C to stop.")
        print("=" * 80)
        
        while True:
            try:
                self.execute_single_cycle()
                interval_min = self.calculate_next_interval()
                sleep_seconds = interval_min * 60
                print(f"[*] Sleeping for {interval_min} minutes ({int(sleep_seconds)}s) with natural human variance...")
                time.sleep(sleep_seconds)
            except KeyboardInterrupt:
                print("\n[!] Daemon stopped by user.")
                break
            except Exception as e:
                print(f"[!] Daemon error: {e}. Retrying in 60s...")
                time.sleep(60)

    def print_status(self):
        """Displays status and recent dispatches"""
        total = self.ledger.get("stats", {}).get("total_dispatches", 0)
        dispatches = self.ledger.get("dispatches", [])
        print("=" * 80)
        print("📊 SENTINELPOSTER DAEMON STATUS")
        print("=" * 80)
        print(f"Total Dispatches Recorded: {total}")
        print(f"Pacing Mode: {self.config.get('pacing_mode')}")
        print(f"Last Run: {self.config.get('last_run_timestamp')}")
        print("-" * 80)
        print("Recent 5 Dispatches:")
        for d in dispatches[:5]:
            print(f"• [{d.get('dispatch_id')}] {d.get('timestamp')} | Confidence: {d.get('confidence_score')}% | {d.get('campaign_title')[:50]}...")
        print("=" * 80)

if __name__ == "__main__":
    daemon = SentinelPosterDaemon()
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg == "--daemon":
            daemon.run_daemon()
        elif arg == "--status":
            daemon.print_status()
        elif arg == "--reset-ledger":
            save_json(LEDGER_PATH, {"dispatches": [], "stats": {"total_dispatches": 0, "successful_webhooks": 0}})
            print("[✓] Ledger reset successfully.")
        else:
            daemon.execute_single_cycle()
    else:
        daemon.execute_single_cycle()
