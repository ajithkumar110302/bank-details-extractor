# 🏦 IFSC Bank Details Enricher

A simple React web application that allows users to upload an Excel file containing IFSC codes, enriches them with bank details via the Razorpay IFSC API, and downloads the enriched data as a new Excel file.

---

## ✨ Features

- Upload `.xlsx` or `.xls` Excel files.
- Input any column name that contains IFSC codes (e.g., `Remitter IFSC`, `IFSC`, etc.).
- Validates if the provided column exists in the Excel file.
- Fetches bank details (bank name, branch, address, etc.) using the Razorpay IFSC API.
- Displays enriched data in a paginated table (10 records per page).
- Allows downloading of enriched results as a new Excel file.

---

## 📁 File Format Requirements

You can specify **any column name** that contains IFSC codes.  
Before parsing, the app will check if that column exists in the uploaded file.  
If the column is missing, you'll see an error like:
