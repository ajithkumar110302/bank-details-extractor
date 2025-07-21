import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Upload, FileSpreadsheet } from "lucide-react";

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [enrichedData, setEnrichedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputFileName, setInputFileName] = useState(null);
  const [ifscColumnName, setIfscColumnName] = useState("Remitter IFSC");
  const [columnError, setColumnError] = useState("");

  const itemsPerPage = 10;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setInputFileName(file?.name || null);
    setColumnError("");

    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      if (
        parsedData.length === 0 ||
        !parsedData[0].hasOwnProperty(ifscColumnName)
      ) {
        setData([]);
        setColumnError(
          `❌ Column "${ifscColumnName}" not found in the Excel file.`
        );
      } else {
        setData(parsedData);
        setColumnError("");
        setEnrichedData([]);
      }
    };

    reader.readAsBinaryString(file);
  };

  const fetchBankDetails = async () => {
    setLoading(true);
    const results = await Promise.all(
      data.map(async (row) => {
        const ifsc = row[ifscColumnName];
        try {
          const res = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
          return { ...row, ...res.data };
        } catch {
          return { ...row, IFSC: ifsc, error: "Invalid IFSC or not found" };
        }
      })
    );
    setEnrichedData(results);
    setLoading(false);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(enrichedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Details");
    XLSX.writeFile(workbook, "enriched_ifsc_details.xlsx");
  };

  const paginatedData = enrichedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(enrichedData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          IFSC Bank Details Enricher
        </h1>

        {/* IFSC Column Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter IFSC Column Name
          </label>
          <input
            type="text"
            value={ifscColumnName}
            onChange={(e) => setIfscColumnName(e.target.value)}
            placeholder="e.g., Remitter IFSC"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Upload UI */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 mb-6">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <div className="text-lg font-medium text-gray-800 mb-1">
            Upload Excel File with IFSC Codes
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Supports .xlsx and .xls files. Ensure there is a "Remitter IFSC"
            column.
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
          >
            <Upload size={18} />
            Choose File
          </label>
          {inputFileName && (
            <div className="mt-3 text-sm text-green-600">
              ✓ {inputFileName} uploaded ({data.length} rows found)
            </div>
          )}
        </div>

        {columnError && (
          <div className="mt-3 text-sm text-red-600">{columnError}</div>
        )}

        {/* Action Buttons */}
        {data.length > 0 && (
          <button
            onClick={fetchBankDetails}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Fetch Bank Details
          </button>
        )}

        {loading && (
          <p className="text-blue-600 mb-4">
            Fetching bank details, please wait...
          </p>
        )}

        {/* Table Section */}
        {enrichedData.length > 0 && (
          <div className="overflow-x-auto">
            <button
              onClick={downloadExcel}
              className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Download Excel
            </button>

            <table className="min-w-full table-auto border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(enrichedData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-2 py-1 border border-gray-300 text-left"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="px-2 py-1 border border-gray-200">
                        {value?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
