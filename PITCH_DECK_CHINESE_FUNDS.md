# Institutional B2B Sales & Outreach Playbook
## Targeting Chinese & Asian Quant Hedge Funds Post-Market Shock

**Confidential Document:** For Internal Go-To-Market Execution Only  
**Campaign Objective:** Secure 3–5 Enterprise Annual Licenses ($15,000 – $50,000 ARR each) for AgentSentinel Quant Edition.  

---

## 1. Prime Target Fund Profiles (Hong Kong, Shanghai, Shenzhen & Singapore)

These institutions manage massive automated AI/quant trading capital and face intense regulatory and risk scrutiny following the recent algorithmic drawdowns:

1. **High-Flyer Capital Management (幻方量化 / DeepSeek Parent Fund)** – Hangzhou/Shanghai
2. **Ubiquant Investment (九坤投资)** – Beijing/Shanghai
3. **Ningbo Lingjun Investment (宁波灵均)** – Shanghai/Hong Kong
4. **WizardQuant (鸣石基金)** – Shanghai
5. **Yanfu Investments (衍复投资)** – Shanghai
6. **Amber Group** – Hong Kong/Singapore
7. **Wintermute Asia / Presto Labs** – Singapore/Seoul

---

## 2. Institutional Cold Outreach Template (English)

**Subject:** Zero-Latency Execution Firewall for AI Trading Swarms (Preventing Reflexive Liquidation Cascades)

**Dear [Chief Risk Officer / Head of Quantitative Infrastructure],**

Following the recent algorithmic volatility shocks and reflexive liquidation cascades observed in autonomous trading desks, several quantitative teams have experienced severe slippage blowouts and unconstrained order-execution loops from autonomous LLM and RL agents.

We have engineered **AgentSentinel (Quant Edition)** — a deterministic, sub-millisecond (< 500µs) out-of-band security firewall and execution circuit breaker built explicitly for autonomous trading agents.

### Key Capabilities for Quantitative Desks:
1. **Dynamic Slippage & Liquidity Shock Cutoff:** Hard-blocks any tool call or order adjusting slippage above strict institutional boundaries (e.g. > 0.75%), preventing market orders into thin liquidity.
2. **Infinite Loop & Velocity Breaker:** Detects recursive re-quote loops and high-frequency tool bursts in real time, auto-throttling rogue subagents before triggering exchange bans.
3. **Web3 Fee & Overflow Tripwire:** Stops sudden archival rent spikes, gas surges, and uint32 integer overflow simulation crashes before transactions hit RPC nodes.
4. **100% Air-Gapped Privacy:** Completely local, zero-telemetry binary. Zero external network calls. 100% of your proprietary alpha, parameters, and strategy remain strictly inside your VPC.

We have published our technical whitepaper: **[AgentSentinel Quantitative Edition Architecture](https://github.com/sparkysolutions10-pixel/agentsentinel/blob/main/AGENTSENTINEL_QUANT_WHITE-PAPER.md)**.

Would you be open to a 10-minute technical briefing next Tuesday or Wednesday on deploying AgentSentinel's deterministic circuit breakers across your execution clusters?

Sincerely,  
**Chief Risk Architect**  
AgentSentinel Enterprise Group  
GitHub: [sparkysolutions10-pixel/agentsentinel](https://github.com/sparkysolutions10-pixel/agentsentinel)  

---

## 3. Institutional Cold Outreach Template (Mandatory Mandarin Chinese - 简体中文)

**主题:** 针对量化与AI自主交易团队的亚毫秒级断路器防火墙（防范连环爆仓与自反性循环）

**尊敬的 [首席风险官 / 量化技术总监 / 量化投资总监]:**

您好！

在近期多智能体（Multi-Agent）与强化学习自主交易系统所引发的自反性流动性冲击中，许多量化机构都遭遇了自主模型极端滑点、无限递归重报循环（Re-quote Loop）以及Gas/手续费溢出导致的钱包风控击穿。

针对上述严峻的系统性缺陷，我们研发了 **AgentSentinel（量化机构专用版）** —— 一款专为AI自主交易Agent与高频执行引擎打造的亚毫秒级（< 500微秒）零信任确定性执行防火墙与AST断路器。

### 为顶级量化私募/对冲基金提供的核心防护能力：
1. **动态滑点与流动性冲击断路器：** 强制拦截任何超出机构风控阈值（如冲击成本 > 0.75%）的自主下单指令，杜绝AI在流动性真空区砸盘自残。
2. **高频异常速率限制与防爆仓陷阱：** 实时捕获因API部分成交导致的死循环调用，在纳秒级滑动窗口内阻断异常报单，避免触发交易所IP封禁与强制平仓。
3. **Web3状态租金与整型溢出熔断：** 拦截包括32位uint32溢出及链上突发费率激增在内的底层RPC交易，彻底避免资金被异常Gas耗尽。
4. **100% 本地离线私密性（Zero-Telemetry）：** 绝不进行任何外部网络回传。全部核心策略、Prompt及交易参数完全封闭于贵机构的本地私有集群内，保障绝对商业机密。

技术白皮书详见：**[AgentSentinel 量化架构技术白皮书](https://github.com/sparkysolutions10-pixel/agentsentinel/blob/main/AGENTSENTINEL_QUANT_WHITE-PAPER.md)**

如果贵司正在评估AI智能体交易集群的底层物理风控方案，我们非常乐意为您安排一次10分钟的线上架构演示与测试验证。

祝好，  
**AgentSentinel 机构安全工程团队**  
GitHub开源库: [sparkysolutions10-pixel/agentsentinel](https://github.com/sparkysolutions10-pixel/agentsentinel)  

---

## 4. B2B Sales Objection Handling (Battlecard)

| Client Question / Objection | Winning Response |
| :--- | :--- |
| *"Does this add latency to our high-frequency orders?"* | **No.** Benchmarked at **0.42ms (420 microseconds)** in native C++/V8 environments. It runs in-process before socket dispatch, orders of magnitude faster than exchange network hops. |
| *"Will our proprietary trading alpha or API keys leak?"* | **Impossible.** AgentSentinel contains **zero network telemetry** code. We provide fully air-gapped binaries and allow strict local VPC security audits. |
| *"Can we write custom risk rules for our proprietary order types?"* | **Yes.** You can define custom AST rules in declarative JSON or code in under 5 minutes using our modular Rule interface. |
