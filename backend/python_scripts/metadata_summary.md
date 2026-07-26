# Bank Statement Metadata Extraction Validation Summary

| PDF Filename | Detected Bank | Account Holder Name | Account Number | IFSC Code | Opening Balance | Closing Balance | Status |
|---|---|---|---|---|---|---|---|
| AU.pdf | AU SMALL FINANCE BANK | Lakshit Verma | 2301247848487972 | AUBL0002478 | 6993.4 | 265.05 | SUCCESS |
| Axis.pdf | AXIS BANK | ADITYA CHANDIL | 924010001522132 | UTIB0002510 | 17837.4 | 17897.4 | SUCCESS |
| BOB.pdf | BANK OF BARODA | SRIDHARA KUMAR PADHY | 85650100011905 | BARB0DBBERH | 9330.76 | 10968.25 | SUCCESS |
| BOI-current.pdf | BANK OF INDIA | MS SHAHNAWAZ ALI | 500920110000546 | BKID0005009 | 191.12 | 1674.12 | SUCCESS |
| BOI-savings.pdf | BANK OF INDIA | MEGHA CHHAPRE | 954510110000935 | BKID0009545 | UNKNOWN | 5480.25 | SUCCESS |
| Canara.pdf | CANARA BANK | VAISHALI PATEL | XXXXXXXXX5420 | CNRB0003387 | 245708.0 | 144698.56 | SUCCESS |
| HDFC.pdf | HDFC BANK | DIGAMBER SAHU | 50200093206905 | HDFC0003561 | UNKNOWN | 1.0 | SUCCESS |
| ICICI-savings.pdf | ICICI BANK | MEGHA CHHAPRE | 818601501466 | UNKNOWN | UNKNOWN | UNKNOWN | SUCCESS |
| ICICI_current.pdf | ICICI BANK | M/S.METALX TRADELINK | UNKNOWN | UNKNOWN | UNKNOWN | 3765163.69 | SUCCESS |
| INDIAN_OVERSEAS.pdf | INDIAN OVERSEAS BANK | SUBHAM MAHANTY | 235001000008602 | IOBA0002350 | 26763.78 | 1365.52 | SUCCESS |
| KOTAK.pdf | KOTAK MAHINDRA BANK | Lakshit Verma | 6845143070 | KKBK0003708 | 324.96 | 16.96 | SUCCESS |
| PNB.pdf | PUNJAB NATIONAL BANK | SIDDHANT SINGH THAKUR | 6422000100039278 | PUNB0642200 | 7174.58 | 8464.58 | SUCCESS |
| Punjab-and-sindh.pdf | PUNJAB & SIND BANK | BAJRANG | 13401000001876 | PSIB0021340 | 6.84 | 159.92 | SUCCESS |
| SBI-current.pdf | STATE BANK OF INDIA | SRI SIVASAI ENTERPRISES | 62205225772 | SBIN0021050 | UNKNOWN | 97184.0 | SUCCESS |
| SBI-savings.pdf | STATE BANK OF INDIA | ADITYA JENA | 37683591241 | SBIN0000038 | 223.52 | 303.52 | SUCCESS |
| slice_statement_01Jun26_20Jun26.pdf | SLICE SMALL FINANCE BANK | LAKSHIT VERMA | 033325224600037 | NESF0000333 | UNKNOWN | UNKNOWN | SUCCESS |
| UNION_BANK.pdf | UNION BANK OF INDIA | LAKSHIT VERMA | 592302010007236 | UBIN0559237 | 28169.6 | 4905.6 | SUCCESS |


## Detailed Metadata Mapping

### AU.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "AU SMALL FINANCE BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "Lakshit Verma",
    "customer_id_or_crn": "28923753",
    "customer_type": "Individual - Full KYC",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "55 B Khushi Nivas Sarvanand Nagar, Bholaram Ustad Marg, Meera Garden Indore - 452014, Madhya Pradesh - India",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "2301247848487972",
    "account_type": "AU Digital Savings Account",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "Not Registered",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "AUBL0002478",
    "micr_code": "UNKNOWN",
    "branch_name": "Indore Jawahar Marg",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01 Apr 2025 to 31 Mar 2026",
    "start_date": "01 Apr 2025",
    "end_date": "31 Mar 2026",
    "generated_at": "15 Jun 2026"
  },
  "summary_snapshot": {
    "opening_balance": 6993.4,
    "closing_balance": 265.05
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### Axis.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "AXIS BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "ADITYA CHANDIL",
    "customer_id_or_crn": "959058859",
    "customer_type": "UNKNOWN",
    "ckyc_number": "XXXXXXXXXX8590",
    "pan_number": "CQBPC6412R",
    "mobile_number": "XXXXXX7647",
    "email": "ADXXXXR8@GMAIL.COM",
    "address_raw": "BUNGLOW NO-60 TYPE-C PHASE-01 B SAGE MILE STONE KALIYASOAT HOSHANGBAD ROAD HUZUR BHOPAL MADHYA PRADESH-INDIA 462047",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "924010001522132",
    "account_type": "EASYACCESS SAVINGS ACCOUNT",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "Registered",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UTIB0002510",
    "micr_code": "462211013",
    "branch_name": "UNKNOWN",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "22-06-2026 to 24-06-2026",
    "start_date": "22-06-2026",
    "end_date": "24-06-2026",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": 17837.4,
    "closing_balance": 17897.4
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### BOB.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "BANK OF BARODA",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "SRIDHARA KUMAR PADHY",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "AT/PO HALDIAPADAR RALAB ROAD TIRUPATI NAGAR 4TH LANE BERHAMPUR GANJAM ODISHA 760003 BERHAMPUR",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "85650100011905",
    "account_type": "SBA",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "BARB0DBBERH",
    "micr_code": "760012005",
    "branch_name": "VINCENT, BERHAMPUR",
    "branch_code": "UNKNOWN",
    "branch_address": "VINCENT SCHOOL ROAD KHOLIKOTE BERHAMPUR BERHAMPUR 760005",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01-12-2025 to 07-02-2026",
    "start_date": "01-12-2025",
    "end_date": "07-02-2026",
    "generated_at": "07/02/2026 03:54:04 PM"
  },
  "summary_snapshot": {
    "opening_balance": 9330.76,
    "closing_balance": 10968.25
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### BOI-current.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "BANK OF INDIA",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "MS SHAHNAWAZ ALI",
    "customer_id_or_crn": "CD657852",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "GUWAHATI-781037, ASSAM, INDIA",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "500920110000546",
    "account_type": "CURRENT- GENERAL",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "Registered",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "BKID0005009",
    "micr_code": "781013005",
    "branch_name": "KHANAPARA",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "17-02-2026 to 24-02-2026",
    "start_date": "17-02-2026",
    "end_date": "24-02-2026",
    "generated_at": "24-02-2026"
  },
  "summary_snapshot": {
    "opening_balance": 191.12,
    "closing_balance": 1674.12
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### BOI-savings.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "BANK OF INDIA",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "MEGHA CHHAPRE",
    "customer_id_or_crn": "134461007",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "H N 11 WARD N0 1 NEAR RAM MANDIR VILL NAKWAD PO JIJGAON KHURD TEH DIST HARDA 461331",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "954510110000935",
    "account_type": "SAVINGS",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "BKID0009545",
    "micr_code": "UNKNOWN",
    "branch_name": "GHANTAGHAR",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01-01-2024 to 12-06-2026",
    "start_date": "01-01-2024",
    "end_date": "12-06-2026",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": 5480.25
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### Canara.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "CANARA BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "VAISHALI PATEL",
    "customer_id_or_crn": "XXXXXXX78",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "+919343855229",
    "email": "UNKNOWN",
    "address_raw": "D O CHANDRAKANT PATEL 448 BEHIND DAK BANGALO VILLAGE NIWALI BUJURG TEH NIWALI NIWALI BARWANI MADHYA PRADESH",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "XXXXXXXXX5420",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "CNRB0003387",
    "micr_code": "UNKNOWN",
    "branch_name": "BARWANI",
    "branch_code": "3387",
    "branch_address": "H.NO.1, WARD NO 16, JAWAHAR MARG, BARWANI MADHYA PRADESH",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01-Sep-2023 to 27-Feb-2024",
    "start_date": "01-Sep-2023",
    "end_date": "27-Feb-2024",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": 245708.0,
    "closing_balance": 144698.56
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### HDFC.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "HDFC BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "DIGAMBER SAHU",
    "customer_id_or_crn": "177839838",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "ss2612387@gmail.com",
    "address_raw": "YOGENDRA KUMAR SAHU HOUSE NUMBER 139 WARD NUMBER,11 BAZAR MOHALLA VILLAGE SAMNAPUR POST OFFICE SAMNAPUR MAL. 481778 MADHYA PRADESH INDIA",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "50200093206905",
    "account_type": "BIZ LITE PLUS ACCOUNT(1481)",
    "account_status": "Regular",
    "currency": "INR",
    "nominee_registered": "Registered",
    "od_limit": 0.0
  },
  "routing_identifiers": {
    "ifsc_code": "HDFC0003561",
    "micr_code": "481240301",
    "branch_name": "DINDORI MP",
    "branch_code": "3561",
    "branch_address": "HDFC BANK LTD OPPOSITE JAIN PETROL PUMP, MAINROAD,DIST-DINDORI, DINDORI 481880 MADHYA PRADESH",
    "branch_phone_number": "18002600/18001600"
  },
  "statement_details": {
    "period_raw": "01/04/2025 to 31/03/2026",
    "start_date": "01/04/2025",
    "end_date": "31/03/2026",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": 1.0
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### ICICI-savings.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "ICICI BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "MEGHA CHHAPRE",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "MAKAN,NO -11 WARD NO -1 RAM,JANKI, MANDIR KE PAS,TAH-HARDA, HARDA MADHYAPRADESH - INDIA - 461228",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "818601501466",
    "account_type": "SAVINGS",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UNKNOWN",
    "micr_code": "UNKNOWN",
    "branch_name": "ICICI BANK LIMITED,",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "December 12, 2025 - June 12, 2026",
    "start_date": "December 12, 2025",
    "end_date": "June 12, 2026",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": "UNKNOWN"
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### ICICI_current.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "ICICI BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "M/S.METALX TRADELINK",
    "customer_id_or_crn": "573662817",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "GALA NO 3 HOUSE NO 3525,PUNE BANGLORE ROAD, KOLHAPUR,NEAR SHIROLI POLICE STATION KOLHAPUR MAHARASHTRA - INDIA - 416122",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "UNKNOWN",
    "account_type": "CURRENT",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UNKNOWN",
    "micr_code": "UNKNOWN",
    "branch_name": "KOLHAPUR BRANCH, GROUND",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "UNKNOWN",
    "start_date": "UNKNOWN",
    "end_date": "UNKNOWN",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": 3765163.69
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### INDIAN_OVERSEAS.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "INDIAN OVERSEAS BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "SUBHAM MAHANTY",
    "customer_id_or_crn": "54380598",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "917847084017",
    "email": "UNKNOWN",
    "address_raw": "GANJAM,ODISHA 17-Jan-26 UPI/601742298660/DR/AARITYA S19093619 Transfer 1.00 - 26,763.78 (17-Jan-26) BROKIN/YES/Account V 17-Jan-26 UPI/000301690769/DR/ GOURAB S18945598 Transfer 6.00 - 26,764.78 (17-Jan-26) PATRA/SBI/Pay 17-Jan-26 UPI/601752585384/CR/ supermoney/YES S91087322 Transfer - 10.26 26,770.78 (17-Jan-26) /Supermone 17-Jan-26 UPI/638301328496/DR/Mr AJAY S91082051 Transfer 20.00 - 26,760.52 (17-Jan-26) KUMAR/YES/Paid via 16-Jan-26 UPI/601689066902/DR/ Mamina behera S83007419 Transfer 30.00 - 26,780.52 (16-Jan-26) /YES/Paid via 16-Jan-26 UPI/601688974043/DR/MATHURI S82815963 Transfer 40.00 - 26,810.52 (16-Jan-26) SAHOO/YES/Paid via 16-Jan-26 UPI/601688915496/DR/SANTOSH S82725478 Transfer 20.00 - 26,850.52 (16-Jan-26) KUMAR /YES/Paid via 16-Jan-26 UPI/601688897069/DR/SANTOSH S82689671 Transfer 30.00 - 26,870.52 (16-Jan-26) KUMAR /YES/Paid via 16-Jan-26 UPI/000281599106/DR/ KANHA S74892127 Transfer 300.00 - 26,900.52 (16-Jan-26) BEHERA/UBI/Pay 16-Jan-26 UPI/638287662655/DR/ DUMMY NAME S73976669 Transfer 8,000.00 - 27,200.52 (16-Jan-26) /iob/UPI 15-Jan-26 UPI/000276713165/DR/RELIANCE JIO I S65891082 Transfer 881.00 - 35,200.52 (15-Jan-26) /CIT/Pay 15-Jan-26 UPI/940854733974/CR/DANGILI S65821465 Transfer - 35,000.00 36,081.52 (15-Jan-26) BHUYAN/UBI/Payment f 15-Jan-26 UPI/601563997709/DR/ RANJEET ROUT S56470284 Transfer 10.00 - 1,081.52 (15-Jan-26) /YES/Paid via 15-Jan-26 UPI/601563985578/DR/ RANJEET ROUT S56457605 Transfer 30.00 - 1,091.52 (15-Jan-26) /YES/Paid via 14-Jan-26 UPI/601447553230/DR/RASANTA S46661236 Transfer 10.00 - 1,121.52 (14-Jan-26) BEHERA/YES/Paid via 14-Jan-26 UPI/601437907908/DR/ DEBA/YES/Paid S28415370 Transfer 80.00 - 1,131.52 (14-Jan-26) via 13-Jan-26 UPI/000252589406/DR/Navi Bill Paym S20728375 Transfer 39.00 - 1,211.52 (13-Jan-26) /ICI/Pay 13-Jan-26 UPI/601322491323/DR/RASANTA S18347675 Transfer 36.00 - 1,250.52 (13-Jan-26) BEHERA/YES/Paid via 12-Jan-26 UPI/637897431423/DR/CAPITAL S77448551 Transfer 9.00 - 1,286.52 (12-Jan-26) REGION/ICI/Paymentto 12-Jan-26 UPI/637896748945/DR/MONALISA S75965723 Transfer 70.00 - 1,295.52 (12-Jan-26) BEHER/YES/Paid via 12-Jan-26 UPI/637896673638/DR/PRAFULLA S75823156 Transfer 20.00 - 1,365.52 (12-Jan-26) KUMAR/YES/Paid via Page 1 of 29",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "235001000008602",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "IOBA0002350",
    "micr_code": "UNKNOWN",
    "branch_name": "POLASARA",
    "branch_code": "2350",
    "branch_address": "Main Road,AT/PO - Polasara,POLASARA,GANJAM",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "2025-07-18 to 2026-01-18",
    "start_date": "2025-07-18",
    "end_date": "2026-01-18",
    "generated_at": "18-01-2026 10:47:15"
  },
  "summary_snapshot": {
    "opening_balance": 26763.78,
    "closing_balance": 1365.52
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### KOTAK.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "KOTAK MAHINDRA BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "Lakshit Verma",
    "customer_id_or_crn": "xxxxxx732",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "Hn. 46 - A Saket Nagar Jhalawa, Saket Nagar, Hariyali Marriage Garden, Jhalawar - 326001, Rajasthan - India",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "6845143070",
    "account_type": "Savings",
    "account_status": "Active",
    "currency": "INR",
    "nominee_registered": "Not Registered",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "KKBK0003708",
    "micr_code": "326485202",
    "branch_name": "Jhalrapatan (m)",
    "branch_code": "UNKNOWN",
    "branch_address": "UNKNOWN",
    "branch_phone_number": "9672972343"
  },
  "statement_details": {
    "period_raw": "01 Apr 2025 to 31 Mar 2026",
    "start_date": "01 Apr 2025",
    "end_date": "31 Mar 2026",
    "generated_at": "12 Jun 2026"
  },
  "summary_snapshot": {
    "opening_balance": 324.96,
    "closing_balance": 16.96
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### PNB.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "PUNJAB NATIONAL BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "SIDDHANT SINGH THAKUR",
    "customer_id_or_crn": "UNKNOWN",
    "customer_type": "UNKNOWN",
    "ckyc_number": "Statement",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "MUKAM PO MOHAD KARELI NARSINGHPURNARSIMHHAPUR",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "6422000100039278",
    "account_type": "UNKNOWN",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "PUNB0642200",
    "micr_code": "487024002",
    "branch_name": "KARELI, JABALPUR",
    "branch_code": "UNKNOWN",
    "branch_address": "KARELI DISTT NARSINGHPUR",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01-07-2025 to 31-12-2025",
    "start_date": "01-07-2025",
    "end_date": "31-12-2025",
    "generated_at": "25/06/2026 18:07:23"
  },
  "summary_snapshot": {
    "opening_balance": 7174.58,
    "closing_balance": 8464.58
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### Punjab-and-sindh.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "PUNJAB & SIND BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "BAJRANG",
    "customer_id_or_crn": "010487034",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "BARWALA RD.,OPP. SUDHAR",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "13401000001876",
    "account_type": "Saving",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "PSIB0021340",
    "micr_code": "125023056",
    "branch_name": "AGROHA",
    "branch_code": "1340",
    "branch_address": "BARWALA RD.,OPP. SUDHAR",
    "branch_phone_number": "1669281271"
  },
  "statement_details": {
    "period_raw": "01/04/2025 to 31/03/2026",
    "start_date": "01/04/2025",
    "end_date": "31/03/2026",
    "generated_at": "26/06/2026"
  },
  "summary_snapshot": {
    "opening_balance": 6.84,
    "closing_balance": 159.92
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### SBI-current.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "STATE BANK OF INDIA",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "SRI SIVASAI ENTERPRISES",
    "customer_id_or_crn": "72090618979",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "62205225772",
    "account_type": "CA-SILVER-PUB-OTH-ALL-INR",
    "account_status": "OPEN",
    "currency": "INR",
    "nominee_registered": "Registered",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "SBIN0021050",
    "micr_code": "520002073",
    "branch_name": "GAYATRI NAGAR,VIJAYAWADA",
    "branch_code": "21050",
    "branch_address": "GAYATRI NAGAR,VIJAYAWADA D NO. 59-13-4, I ST FLOOR, NEAR BABU STATEMENT OF ACCOUNT TEXTILES, GANTASALAVARI STREET, GAYATRI Pin Code : 520008 SRI SIVASAI ENTERPRISES",
    "branch_phone_number": "9247500970"
  },
  "statement_details": {
    "period_raw": "01-01-2025 to 31-01-2026",
    "start_date": "01-01-2025",
    "end_date": "31-01-2026",
    "generated_at": "31-01-2026 12:44:03"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": 97184.0
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### SBI-savings.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "STATE BANK OF INDIA",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "ADITYA JENA",
    "customer_id_or_crn": "90111492418",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "UNKNOWN",
    "email": "UNKNOWN",
    "address_raw": "",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "37683591241",
    "account_type": "SBNCHQ-GEN-PUB IND-RURAL-INR",
    "account_status": "OPEN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "SBIN0000038",
    "micr_code": "761002302",
    "branch_name": "BHANJANAGAR",
    "branch_code": "38",
    "branch_address": "BHANJANAGAR AT/PO-BHANJANAGAR STATEMENT OF ACCOUNT DIST-GANJAM ODISHA Pin Code : 761126 ADITYA JENA",
    "branch_phone_number": "8984401627"
  },
  "statement_details": {
    "period_raw": "01-02-2025 to 04-02-2026",
    "start_date": "01-02-2025",
    "end_date": "04-02-2026",
    "generated_at": "04-02-2026 10:11:18"
  },
  "summary_snapshot": {
    "opening_balance": 223.52,
    "closing_balance": 303.52
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### slice_statement_01Jun26_20Jun26.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "SLICE SMALL FINANCE BANK",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "LAKSHIT VERMA",
    "customer_id_or_crn": "380008223998",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "7597748121",
    "email": "acelakshitverma@gmail.com",
    "address_raw": "55 B KHUSHI NIVAS SARVANAND NAGAR, BHO- MICR 560773002",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "033325224600037",
    "account_type": "SAVINGS",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "NESF0000333",
    "micr_code": "560773002",
    "branch_name": "Ashford Park View",
    "branch_code": "UNKNOWN",
    "branch_address": "Ground Floor, Ashford Park View, Indiqube, 80",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01 Jun '26 to 20 Jun '26",
    "start_date": "01 Jun '26",
    "end_date": "20 Jun '26",
    "generated_at": "UNKNOWN"
  },
  "summary_snapshot": {
    "opening_balance": "UNKNOWN",
    "closing_balance": "UNKNOWN"
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```

### UNION_BANK.pdf
```json
{
  "document_type": "BANK_STATEMENT",
  "institution": {
    "bank_name": "UNION BANK OF INDIA",
    "platform": "UNKNOWN",
    "country": "IN"
  },
  "account_holder": {
    "name": "LAKSHIT VERMA",
    "customer_id_or_crn": "603665478",
    "customer_type": "UNKNOWN",
    "ckyc_number": "UNKNOWN",
    "pan_number": "UNKNOWN",
    "mobile_number": "7****",
    "email": "Currency",
    "address_raw": "UNKNOWN",
    "joint_holders": "UNKNOWN"
  },
  "account_profile": {
    "account_number": "592302010007236",
    "account_type": "Savings Account",
    "account_status": "UNKNOWN",
    "currency": "INR",
    "nominee_registered": "UNKNOWN",
    "od_limit": "UNKNOWN"
  },
  "routing_identifiers": {
    "ifsc_code": "UBIN0559237",
    "micr_code": "UNKNOWN",
    "branch_name": "SHOP NO 8&9",
    "branch_code": "UNKNOWN",
    "branch_address": "SHOP NO 8&9 Statement Date 20-06-2026 18:04 SUMANSURABHI Statement Period 01-04-2026 to 20-06-2026 Date Transaction Id Remarks Amount( ) Balance( ) 02-04-2026 Y60543899 UPIAR/441177325136/DR/Repaka K/YESB/paytm.s1l5de3@ 45.00(Dr) 28169.60(Cr) 02-04-2026 Y60583468 UPIAR/326080483718/DR/MR JALA /YESB/ Q908450467@yb 83.00(Dr) 28086.60(Cr) 02-04-2026 Y93739753 UPIAR/303632545006/DR/ PhonePe/YESB/SV251211224730 5140.00(Dr) 22946.60(Cr) 02-04-2026 Y96028732 UPIAR/604966625468/DR/ PhonePe/YESB/SV251211224730 6420.00(Dr) 16526.60(Cr) 02-04-2026 Y96639642 UPIAB/744745340512/CR/Lakshit /AUBL/acelakshitverm 3000.00(Cr) 19526.60(Cr) 02-04-2026 Y97043531 UPIAR/322272202205/DR/ Fibe/UTIB/fibe.cf@axisba 13634.00(Dr) 5892.60(Cr) 03-04-2026 S19172775 NACH/10/3308413368/IDFC FIRST 835.00(Dr) 5057.60(Cr) 03-04-2026 S25206264 592302010007236:Int.Pd:01-01-2026 to 31-03-2026 147.00(Cr) 5204.60(Cr) 03-04-2026 S30087744 UPIAR/447718536396/DR/KONDA SR/YESB/ Q416774236@yb 45.00(Dr) 5159.60(Cr) 03-04-2026 S30190760 UPIAR/202933633604/DR/KONDA SR/YESB/ Q416774236@yb 10.00(Dr) 5149.60(Cr) 03-04-2026 S30195954 UPIAR/657732545403/DR/MR JALA /YESB/ Q908450467@yb 80.00(Dr) 5069.60(Cr) 03-04-2026 S31672667 UPIAB/991318227967/CR/Lakshit /AUBL/acelakshitverm 120.00(Cr) 5189.60(Cr) 03-04-2026 S32393777 NACH/10/3306933932/IDFC FIRST 1647.00(Dr) 3542.60(Cr) 03-04-2026 S33625988 NACH/10/3307929238/IDFC FIRST 2637.00(Dr) 905.60(Cr) 04-04-2026 T24500326 IMPSAB/609444402872/SPYINT TECHNOLOGIES/9303556894 4000.00(Cr) 4905.60(Cr) Page 1 of 4",
    "branch_phone_number": "UNKNOWN"
  },
  "statement_details": {
    "period_raw": "01-04-2026 to 20-06-2026",
    "start_date": "01-04-2026",
    "end_date": "20-06-2026",
    "generated_at": "20-06-2026 18:04"
  },
  "summary_snapshot": {
    "opening_balance": 28169.6,
    "closing_balance": 4905.6
  },
  "upi_summary": {
    "total_sent": "UNKNOWN",
    "total_received": "UNKNOWN",
    "transaction_count": "UNKNOWN",
    "wallet_balance": "UNKNOWN",
    "linked_accounts": []
  }
}
```
