# Data flow

## Case intake
- Officer creates a case from the case manager screen.
- Backend persists the case record.

## Document processing
- Officer uploads PDF files to the case.
- Backend scans the PDFs and produces CSV output.
- Extracted rows are stored in SQLite.

## Rendering
- Frontend requests case, document, and report endpoints.
- Dashboard and detail screens render the data from API responses.

## Suggested backend endpoints
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:id`
- `POST /api/cases/:id/documents`
- `GET /api/cases/:id/documents`
- `GET /api/cases/:id/rows`
- `GET /api/cases/:id/csv`
- `GET /api/dashboard/summary`
