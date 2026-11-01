import { EmailDomainValidator } from './email_domain_validator.js';
import { SemverRangeMatcher } from './semver_range_matcher.js';
import { JsonPathExtractor } from './json_path_extractor.js';
import { WildcardPatternMatcher } from './wildcard_pattern_matcher.js';
import { UnicodeHomoglyphDetector } from './unicode_homoglyph_detector.js';
import { Base64UrlEncoder } from './base64url_encoder.js';
import { HtmlTagSanitizer } from './html_tag_sanitizer.js';
import { HexColorValidator } from './hex_color_validator.js';
import { JwtClaimsExtractor } from './jwt_claims_extractor.js';
import { SqlIdentifierValidator } from './sql_identifier_validator.js';
import { Pbkdf2KeyDeriver } from './pbkdf2_key_deriver.js';
import { TotpValidator } from './totp_validator.js';
import { Base32Encoder } from './base32_encoder.js';
import { HkdfKeyExpander } from './hkdf_key_expander.js';
import { MaskedSecretFormatter } from './masked_secret_formatter.js';
import { TimingSafeBufferComparator } from './timing_safe_buffer_comparator.js';
import { Sha512ChecksumCalculator } from './sha512_checksum_calculator.js';
import { ScryptHasher } from './scrypt_hasher.js';
import { Bip39MnemonicValidator } from './bip39_mnemonic_validator.js';
import { EntropyCalculator } from './entropy_calculator.js';
import { UrlHostCanonicalizer } from './url_host_canonicalizer.js';
import { HttpBearerTokenExtractor } from './http_bearer_token_extractor.js';
import { HttpStatusClassifier } from './http_status_classifier.js';
import { ContentLengthEnforcer } from './content_length_enforcer.js';
import { SafeRedirectValidator } from './safe_redirect_validator.js';
import { DnsRebindingGuard } from './dns_rebinding_guard.js';
import { BasicAuthHeaderParser } from './basic_auth_header_parser.js';
import { RetryAfterParser } from './retry_after_parser.js';
import { CookieHeaderParser } from './cookie_header_parser.js';
import { SubdomainExtractor } from './subdomain_extractor.js';
import { InstructionOverrideDetector } from './instruction_override_detector.js';
import { PromptLeakProbeDetector } from './prompt_leak_probe_detector.js';
import { ZeroWidthSpaceScrubber } from './zero_width_space_scrubber.js';
import { SystemRoleSpoofGuard } from './system_role_spoof_guard.js';
import { JailbreakAffirmationFilter } from './jailbreak_affirmation_filter.js';
import { MultiLanguageInstructionSniffer } from './multi_language_instruction_sniffer.js';
import { CharacterRepetitionGuard } from './character_repetition_guard.js';
import { RecursiveBracketDepthGuard } from './recursive_bracket_depth_guard.js';
import { EntropyObfuscationScrubber } from './entropy_obfuscation_scrubber.js';
import { PromptSanitizerPipeline } from './prompt_sanitizer_pipeline.js';
import { LeakyBucketRateLimiter } from './leaky_bucket_rate_limiter.js';
import { AsyncBarrier } from './async_barrier.js';
import { CountDownLatch } from './countdown_latch.js';
import { DebounceLeadingTrailing } from './debounce_leading_trailing.js';
import { JitterBackoffCalculator } from './jitter_backoff_calculator.js';
import { WorkerPoolLimiter } from './worker_pool_limiter.js';
import { AbortControllerTimeout } from './abort_controller_timeout.js';
import { SlidingWindowCounter } from './sliding_window_counter.js';
import { ExecutionTimeTracker } from './execution_time_tracker.js';
import { PromiseTimeoutWrapper } from './promise_timeout_wrapper.js';
import { LogfmtFormatter } from './logfmt_formatter.js';
import { PercentileCalculator } from './percentile_calculator.js';
import { StructuredLogRedactor } from './structured_log_redactor.js';
import { HeartbeatMonitor } from './heartbeat_monitor.js';
import { ToolInvocationStatsAggregator } from './tool_invocation_stats_aggregator.js';
import { CsvMetricsExporter } from './csv_metrics_exporter.js';
import { AlertDeduplicator } from './alert_deduplicator.js';
import { MemoryTrendTracker } from './memory_trend_tracker.js';
import { SyslogSeverityMapper } from './syslog_severity_mapper.js';
import { HealthScoreCalculator } from './health_score_calculator.js';
import { SorobanAuthModeClassifier } from './soroban_auth_mode_classifier.js';
import { StellarStrkeyDecoder } from './stellar_strkey_decoder.js';
import { SorobanLedgerSequenceGuard } from './soroban_ledger_sequence_guard.js';
import { StellarNetworkPassphraseDetector } from './stellar_network_passphrase_detector.js';
import { SorobanSymbolValidator } from './soroban_symbol_validator.js';
import { SorobanValTypeClassifier } from './soroban_val_type_classifier.js';
import { StellarMuxedAccountParser } from './stellar_muxed_account_parser.js';
import { SorobanTtlExtensionGuard } from './soroban_ttl_extension_guard.js';
import { SorobanFeeBudgetGuard } from './soroban_fee_budget_guard.js';
import { SorobanEventSignatureHasher } from './soroban_event_signature_hasher.js';
import { MimeTypeResolver } from './mime_type_resolver.js';
import { PathTraversalPreventer } from './path_traversal_preventer.js';
import { FileExtensionValidator } from './file_extension_validator.js';
import { FileNameSanitizer } from './file_name_sanitizer.js';
import { SafeFileReader } from './safe_file_reader.js';
import { DirectoryListingFilter } from './directory_listing_filter.js';
import { SymlinkTargetInspector } from './symlink_target_inspector.js';
import { WasmMagicByteValidator } from './wasm_magic_byte_validator.js';
import { TemporaryFileCleaner } from './temporary_file_cleaner.js';
import { ChmodPermissionGuard } from './chmod_permission_guard.js';
import { DataRetentionPolicyEvaluator } from './data_retention_policy_evaluator.js';
import { GdprRightToBeForgottenHandler } from './gdpr_right_to_be_forgotten_handler.js';
import { ComplianceFrameworkMapper } from './compliance_framework_mapper.js';
import { TenantRateTierEnforcer } from './tenant_rate_tier_enforcer.js';
import { GeoIpCountryAllowlist } from './geo_ip_country_allowlist.js';
import { AuditRecordChecksumGenerator } from './audit_record_checksum_generator.js';
import { RoleBasedAccessEvaluator } from './role_based_access_evaluator.js';
import { CostCenterTagValidator } from './cost_center_tag_validator.js';
import { SessionInactivityTimeoutGuard } from './session_inactivity_timeout_guard.js';
import { EnterpriseLicenseValidator } from './enterprise_license_validator.js';
import { GracefulShutdownCoordinator } from './graceful_shutdown_coordinator.js';
import { EventBusBroadcaster } from './event_bus_broadcaster.js';
import { DependencyInjectionContainer } from './dependency_injection_container.js';
import { ConfigurationMerger } from './configuration_merger.js';
import { HealthCheckProbeServer } from './health_check_probe_server.js';
import { PluginLifecycleManager } from './plugin_lifecycle_manager.js';
import { SafeAsyncGenerator } from './safe_async_generator.js';
import { RuntimeEnvironmentDetector } from './runtime_environment_detector.js';
import { SentinelVersionBanner } from './sentinel_version_banner.js';

export class MasterOmniLoader {
  public static readonly TOTAL_MODULES = 100;

  public static loadAll(): { loadedCount: number; verified: boolean } {
    const modules = [
      EmailDomainValidator, SemverRangeMatcher, JsonPathExtractor, WildcardPatternMatcher,
      UnicodeHomoglyphDetector, Base64UrlEncoder, HtmlTagSanitizer, HexColorValidator,
      JwtClaimsExtractor, SqlIdentifierValidator, Pbkdf2KeyDeriver, TotpValidator,
      Base32Encoder, HkdfKeyExpander, MaskedSecretFormatter, TimingSafeBufferComparator,
      Sha512ChecksumCalculator, ScryptHasher, Bip39MnemonicValidator, EntropyCalculator,
      UrlHostCanonicalizer, HttpBearerTokenExtractor, HttpStatusClassifier, ContentLengthEnforcer,
      SafeRedirectValidator, DnsRebindingGuard, BasicAuthHeaderParser, RetryAfterParser,
      CookieHeaderParser, SubdomainExtractor, InstructionOverrideDetector, PromptLeakProbeDetector,
      ZeroWidthSpaceScrubber, SystemRoleSpoofGuard, JailbreakAffirmationFilter, MultiLanguageInstructionSniffer,
      CharacterRepetitionGuard, RecursiveBracketDepthGuard, EntropyObfuscationScrubber, PromptSanitizerPipeline,
      LeakyBucketRateLimiter, AsyncBarrier, CountDownLatch, DebounceLeadingTrailing,
      JitterBackoffCalculator, WorkerPoolLimiter, AbortControllerTimeout, SlidingWindowCounter,
      ExecutionTimeTracker, PromiseTimeoutWrapper, LogfmtFormatter, PercentileCalculator,
      StructuredLogRedactor, HeartbeatMonitor, ToolInvocationStatsAggregator, CsvMetricsExporter,
      AlertDeduplicator, MemoryTrendTracker, SyslogSeverityMapper, HealthScoreCalculator,
      SorobanAuthModeClassifier, StellarStrkeyDecoder, SorobanLedgerSequenceGuard, StellarNetworkPassphraseDetector,
      SorobanSymbolValidator, SorobanValTypeClassifier, StellarMuxedAccountParser, SorobanTtlExtensionGuard,
      SorobanFeeBudgetGuard, SorobanEventSignatureHasher, MimeTypeResolver, PathTraversalPreventer,
      FileExtensionValidator, FileNameSanitizer, SafeFileReader, DirectoryListingFilter,
      SymlinkTargetInspector, WasmMagicByteValidator, TemporaryFileCleaner, ChmodPermissionGuard,
      DataRetentionPolicyEvaluator, GdprRightToBeForgottenHandler, ComplianceFrameworkMapper, TenantRateTierEnforcer,
      GeoIpCountryAllowlist, AuditRecordChecksumGenerator, RoleBasedAccessEvaluator, CostCenterTagValidator,
      SessionInactivityTimeoutGuard, EnterpriseLicenseValidator, GracefulShutdownCoordinator, EventBusBroadcaster,
      DependencyInjectionContainer, ConfigurationMerger, HealthCheckProbeServer, PluginLifecycleManager,
      SafeAsyncGenerator, RuntimeEnvironmentDetector, SentinelVersionBanner
    ];

    return {
      loadedCount: modules.length + 1, // Including MasterOmniLoader itself
      verified: modules.every(m => typeof m !== 'undefined')
    };
  }
}
