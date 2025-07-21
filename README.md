# 🏦 IFSC Bank Details Enricher

A simple React web application that allows users to upload an Excel file containing IFSC codes, enriches them with bank details via the Razorpay IFSC API, and downloads the enriched data as a new Excel file.

---

## ✨ Features

- Upload `.xlsx` or `.xls` Excel files.
- Parses IFSC codes from a column named **"Remitter IFSC"**.
- Fetches bank details (bank name, branch, address, etc.) using the Razorpay IFSC API.
- Displays enriched data in a paginated table (10 records per page).
- Allows downloading of enriched results as a new Excel file.

---

## 📁 File Format Requirements

Your Excel file must contain a column titled: Remitter IFSCs
