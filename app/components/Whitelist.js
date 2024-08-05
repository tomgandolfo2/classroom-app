// app/components/Whitelist.js

"use client";

import React, { useState, useEffect } from "react";
import { CSVLink } from "react-csv";

export default function Whitelist() {
  const [whitelist, setWhitelist] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrls, setSelectedUrls] = useState([]);

  useEffect(() => {
    const fetchWhitelist = async () => {
      try {
        const response = await fetch("/api/whitelist");
        if (!response.ok) throw new Error("Failed to fetch whitelist");
        const data = await response.json();
        setWhitelist(data);
      } catch (error) {
        console.error("Error fetching whitelist:", error);
        alert(
          "An error occurred while fetching the whitelist. Please try again later."
        );
      }
    };

    fetchWhitelist();
  }, []);

  const addUrl = async () => {
    if (!newUrl.trim()) {
      alert("URL cannot be empty.");
      return;
    }

    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-zA-Z0-9$_.+!*'(),;?&=-]+)\\.)+[a-zA-Z]{2,})" + // domain name
        "(\\/[a-zA-Z0-9$_.+!*'(),;?&=-]*)*" + // path
        "(\\?[a-zA-Z0-9$_.+!*'(),;?&=-]*)?" + // query string
        "(#[a-zA-Z0-9$_.+!*'(),;?&=-]*)?$" // fragment locator
    );

    if (!urlPattern.test(newUrl)) {
      alert("Invalid URL format.");
      return;
    }

    const optimisticUrl = { id: Date.now(), url: newUrl };
    setWhitelist((prev) => [...prev, optimisticUrl]);
    setNewUrl("");

    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: newUrl }),
      });

      const addedUrl = await response.json();
      setWhitelist((prev) =>
        prev.map((item) => (item.id === optimisticUrl.id ? addedUrl : item))
      );
    } catch (error) {
      console.error("Error adding URL:", error);
      setWhitelist((prev) =>
        prev.filter((item) => item.id !== optimisticUrl.id)
      );
      alert("An error occurred while adding the URL. Please try again later.");
    }
  };

  const deleteUrl = async (id) => {
    try {
      await fetch("/api/whitelist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setWhitelist((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting URL:", error);
      alert(
        "An error occurred while deleting the URL. Please try again later."
      );
    }
  };

  const toggleUrlSelection = (id) => {
    setSelectedUrls((prev) =>
      prev.includes(id) ? prev.filter((urlId) => urlId !== id) : [...prev, id]
    );
  };

  const bulkDeleteUrls = async () => {
    const confirmation = window.confirm(
      `Are you sure you want to delete ${selectedUrls.length} URLs?`
    );
    if (!confirmation) return;

    try {
      await Promise.all(
        selectedUrls.map((id) =>
          fetch("/api/whitelist", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          })
        )
      );

      setWhitelist((prev) =>
        prev.filter((item) => !selectedUrls.includes(item.id))
      );
      setSelectedUrls([]);
    } catch (error) {
      console.error("Error deleting URLs:", error);
      alert("An error occurred while deleting URLs. Please try again later.");
    }
  };

  const importUrls = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const urls = text.split("\n").filter((url) => url.trim() !== "");

      for (const url of urls) {
        if (whitelist.some((item) => item.url === url)) continue;

        const optimisticUrl = { id: Date.now(), url };
        setWhitelist((prev) => [...prev, optimisticUrl]);

        try {
          const response = await fetch("/api/whitelist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          });

          const addedUrl = await response.json();
          setWhitelist((prev) =>
            prev.map((item) => (item.id === optimisticUrl.id ? addedUrl : item))
          );
        } catch (error) {
          console.error("Error importing URL:", error);
          setWhitelist((prev) =>
            prev.filter((item) => item.id !== optimisticUrl.id)
          );
        }
      }
    };

    reader.readAsText(file);
  };

  const filteredWhitelist = whitelist.filter((item) =>
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const csvData = whitelist.map((item) => ({ url: item.url }));

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
      <h2 className="text-2xl font-semibold mb-4">Whitelist Management</h2>

      {/* Search and Import */}
      <div className="flex items-center mb-4 space-x-4">
        <input
          type="text"
          className="border p-3 flex-1 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Search URLs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="file"
          accept=".csv,.txt"
          onChange={importUrls}
          className="border p-3 rounded-lg"
        />
      </div>

      {/* Add New URL */}
      <div className="flex items-center mb-6 space-x-4">
        <input
          type="text"
          className="border p-3 flex-1 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter URL to whitelist"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <button
          className="bg-primary text-white px-5 py-3 rounded-lg shadow-md hover:bg-secondary transition"
          onClick={addUrl}
        >
          Add URL
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedUrls.length > 0 && (
        <div className="flex items-center mb-4 space-x-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            onClick={bulkDeleteUrls}
          >
            Delete Selected ({selectedUrls.length})
          </button>
        </div>
      )}

      {/* Whitelist Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedUrls.length === whitelist.length}
                  onChange={(e) =>
                    setSelectedUrls(
                      e.target.checked ? whitelist.map((item) => item.id) : []
                    )
                  }
                />
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {filteredWhitelist.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedUrls.includes(item.id)}
                    onChange={() => toggleUrlSelection(item.id)}
                  />
                </td>
                <td className="px-6 py-4 border-b border-gray-300">
                  {item.url}
                </td>
                <td className="px-6 py-4 border-b border-gray-300 text-right">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    onClick={() => deleteUrl(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export to CSV */}
      <div className="mt-6">
        <CSVLink
          data={csvData}
          filename={"whitelist.csv"}
          className="bg-green-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-green-600 transition"
        >
          Export to CSV
        </CSVLink>
      </div>
    </div>
  );
}
