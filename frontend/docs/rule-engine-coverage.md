# Finexis Rule Engine Coverage Matrix

This is the executable acceptance record for `Finexis_Complete_Rule_Engine.docx`.
Run `npm run test:rule-engine` to validate the suite.

| DOCX rule group | Implementation | Test coverage | Runtime input contract |
| --- | --- | --- | --- |
| §0.1 Bank detection and mapping | `BANK_STATEMENT_FORMATS`, `detectBankStatementFormat`, `normaliseBankStatementRow` | Bank-header/normalisation test | Raw headers and rows from ingestion |
| §0.2 Canonical schema | `enrichTransactions` | All enrichment tests | Legacy API transaction fields |
| §1.1–1.3 classification, UPI and keyword rules | Priority rule table, parser and tags | Classification, UPI, keyword tests | Narration and debit/credit direction |
| TXN-V01–TXN-V15 | `analyseTransactionVolume`, `evaluateAdvancedRules` | Volume and advanced-evidence tests | Statement dates; `time` for precise off-hour/velocity evidence |
| §2.1 category taxonomy and DS-B01–DS-B12 | Ordered category rules and behavioural evaluator | Spend and advanced-evidence tests | Complete statement history and counterparties |
| MU-01–MU-20, score tiers and suppressor-safe matching | `enrichTransactions`, `evaluateAdvancedRules` | Mule, linked-KYC and UPI-cycle tests | Linked statements/KYC/device data for MU-05, MU-10 and MU-11 |
| CR-01–CR-15 | Exchange master, crypto evaluator and linked-counterparty evaluator | Crypto and linked-crypto tests | Linked counterparty transactions for CR-08 |
| FF-01–FF-20 and FF-A01–FF-A10 | `buildFundFlowMetadata`, `evaluateFundFlowAlerts` | Graph and multi-hop alert tests | Multi-hop edges, components, verification and cross-case data |

## Required integration inputs

The engine never invents evidence. The case pipeline should supply optional context when available:

```js
{
  linkedTransactions: [], // counterparty statements
  kycAccounts: [],        // mobile, email, device_id, suspicious
  upiTransfers: [],       // sender, receiver, amount, date
  flowEdges: [],          // sender, receiver, channel, amount
  flowEvents: [],         // sender, receiver, date, amount
  components: [],         // node_ids, total_amount
  verifiedNodeIds: [],
  cryptoGatewayNodeIds: [],
  crossCaseEntities: []
}
```

Without a required source, the relevant conditional rule emits no hit. That is intentional: missing evidence must never be represented as a negative finding.
