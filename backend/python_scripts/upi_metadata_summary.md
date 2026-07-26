# UPI App Statement Metadata Extraction Validation Summary

| PDF Filename | Platform | Mobile Number | Email | Transaction Count | Total Sent | Total Received | Status |
|---|---|---|---|---|---|---|---|
| gpay_statement_20251201_20260531.pdf | GOOGLE PAY | 9303556894 | lakshitverma022@gmail.com | 8 | ₹1,35,000 | ₹1 | SUCCESS |
| MobiKwik Txn Statement 01_Jul_2025-29_Jun_2026.pdf | MOBIKWIK | 6268646007 | UNKNOWN | 129 | Rs. 308001.25 | UNKNOWN | SUCCESS |
| Paytm.pdf | PAYTM | 7597748121 | acelakshitverma@gmail.com | 4 | Rs.1,898.32 | Rs.30 | SUCCESS |
| PhonePe_Statement_Apr2026_Jun2026.pdf | PHONEPE | 7597748121 | UNKNOWN | 7 | ₹25,420.92 | UNKNOWN | SUCCESS |
| Super_money.pdf | SUPERMONEY | UNKNOWN | UNKNOWN | 1 | UNKNOWN | UNKNOWN | SUCCESS |


## Detailed Metadata Mapping

### gpay_statement_20251201_20260531.pdf
```json
{
  "document_type": "UPI_STATEMENT",
  "institution": {
    "bank_name": "AUSmallFinanceBank",
    "platform": "GOOGLE PAY",
    "country": "IN"
  },
  "account_holder": {
    "name": "UNKNOWN",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "9303556894",
    "email": "lakshitverma022@gmail.com",
    "address_raw": "UNKNOWN",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "UNKNOWN",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UNKNOWN",
    "micr_code": "UNKNOWN",
    "branch_name": "UNKNOWN",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01December2025 to 31May2026",
    "start_date": "01December2025",
    "end_date": "31May2026",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": "UNKNOWN"
  },
  "upi_summary": {
    "total_sent": "\u20b91,35,000",
    "total_received": "\u20b91",
    "transaction_count": "8",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### MobiKwik Txn Statement 01_Jul_2025-29_Jun_2026.pdf
```json
{
  "document_type": "UPI_STATEMENT",
  "institution": {
    "bank_name": "UNKNOWN",
    "platform": "MOBIKWIK",
    "country": "IN"
  },
  "account_holder": {
    "name": "UNKNOWN",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "6268646007",
    "email": "UNKNOWN",
    "address_raw": "UNKNOWN",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "UNKNOWN",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UNKNOWN",
    "micr_code": "UNKNOWN",
    "branch_name": "UNKNOWN",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "2025-07-01 to 2026-06-29",
    "start_date": "2025-07-01",
    "end_date": "2026-06-29",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": 21.88
  },
  "upi_summary": {
    "total_sent": "Rs. 308001.25",
    "total_received": "UNKNOWN",
    "transaction_count": "129",
    "wallet_balance": "Rs. 21.88",
    "linked_accounts": []
  }
}
```

### Paytm.pdf
```json
{
  "document_type": "UPI_STATEMENT",
  "institution": {
    "bank_name": "UNKNOWN",
    "platform": "PAYTM",
    "country": "IN"
  },
  "account_holder": {
    "name": "Lakshit Verma",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "7597748121",
    "email": "acelakshitverma@gmail.com",
    "address_raw": "UNKNOWN",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "UNKNOWN",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UNKNOWN",
    "micr_code": "UNKNOWN",
    "branch_name": "UNKNOWN",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "1 APR'25 to 31 MAR'26",
    "start_date": "1 APR'25",
    "end_date": "31 MAR'26",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": "UNKNOWN"
  },
  "upi_summary": {
    "total_sent": "Rs.1,898.32",
    "total_received": "Rs.30",
    "transaction_count": "4",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": [
      {
        "bank": "Kotak Mahindra Bank",
        "masked_account": "70",
        "sent": "Rs.956",
        "received": "Rs.0"
      },
      {
        "bank": "Union Bank Of India",
        "masked_account": "36",
        "sent": "Rs.942.32",
        "received": "Rs.0"
      }
    ]
  }
}
```

### PhonePe_Statement_Apr2026_Jun2026.pdf
```json
{
  "document_type": "UPI_STATEMENT",
  "institution": {
    "bank_name": "UNKNOWN",
    "platform": "PHONEPE",
    "country": "IN"
  },
  "account_holder": {
    "name": "UNKNOWN",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "7597748121",
    "email": "UNKNOWN",
    "address_raw": "UNKNOWN",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "UNKNOWN",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UNKNOWN",
    "micr_code": "UNKNOWN",
    "branch_name": "UNKNOWN",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01 Apr, 2026 to 15 Jun, 2026",
    "start_date": "01 Apr, 2026",
    "end_date": "15 Jun, 2026",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": "UNKNOWN"
  },
  "upi_summary": {
    "total_sent": "\u20b925,420.92",
    "total_received": "UNKNOWN",
    "transaction_count": "7",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": [
      {
        "masked_account": "XXXXXXXXXXXX2774"
      },
      {
        "masked_account": "XXXXXXXX3070"
      },
      {
        "masked_account": "XXXXXXXXXXX7236"
      }
    ]
  }
}
```

### Super_money.pdf
```json
{
  "document_type": "UPI_STATEMENT",
  "institution": {
    "bank_name": "UNKNOWN",
    "platform": "SUPERMONEY",
    "country": "IN"
  },
  "account_holder": {
    "name": "UNKNOWN",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "UNKNOWN",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "UNKNOWN",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UNKNOWN",
    "micr_code": "UNKNOWN",
    "branch_name": "UNKNOWN",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "20 May 2026 to 20 June 2026",
    "start_date": "20 May 2026",
    "end_date": "20 June 2026",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": "UNKNOWN"
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "1",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": [
      {
        "counterparty": "Name Bank Amount Date Status\nMr Aditya Chandil",
        "bank": "Kotak",
        "masked_account": "3070",
        "amount": "-1.00",
        "date": "20 June 2026",
        "status": "SUCCESS"
      }
    ]
  }
}
```
