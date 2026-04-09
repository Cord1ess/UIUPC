// src/utils/adminHelpers.js

export const safeToString = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  return String(value);
};

export const getProperty = (item, property) => {
  const possibleKeys = [
    property,
    property.toLowerCase(),
    property.toUpperCase(),
    property.replace(/\s+/g, ""),
    property.replace(/\s+/g, "").toLowerCase(),
    property.replace(/\s+/g, "").toUpperCase(),
  ];

  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return safeToString(item[key]);
    }
  }

  return "N/A";
};

export const exportToCSV = (dataType, data) => {
  let headers, csvData;

  if (dataType === "membership") {
    headers = [
      "Timestamp",
      "Full Name",
      "Student ID",
      "Email",
      "Department",
      "Phone",
      "Experience Level",
      "Interests",
      "Payment Method",
      "Status",
    ];

    csvData = data.map((item) => [
      item.Timestamp || item.timestamp,
      safeToString(item["Full Name"] || item.name),
      safeToString(item["Student ID"] || item.studentId),
      safeToString(item.Email || item.email),
      safeToString(item.Department || item.department),
      safeToString(item.Phone || item.phone),
      safeToString(item["Experience Level"] || item.experience),
      safeToString(item.Interests || item.interests),
      safeToString(item["Payment Method"] || item.paymentMethod),
      safeToString(item.Status || item.status || "pending"),
    ]);
  } else {
    headers = [
      "Timestamp",
      "Name",
      "Email",
      "Phone",
      "Institution",
      "Category",
      "Photo Count",
      "Story Photo Count",
      "Photo Names",
      "Story Photo Names",
      "Folder URL",
      "Status",
    ];

    csvData = data.map((item) => [
      item.Timestamp || item.timestamp || item["Timestamp"],
      safeToString(item["Name"] || item.name || item["Full Name"]),
      safeToString(item["Email"] || item.email),
      safeToString(item["Phone"] || item.phone),
      safeToString(item["Institution"] || item.institution),
      safeToString(item["Category"] || item.category),
      safeToString(item["Photo Count"] || item.photoCount),
      safeToString(item["Story Photo Count"] || item.storyPhotoCount),
      safeToString(item["Photo Names"] || item.photoNames),
      safeToString(item["Story Photo Names"] || item.storyPhotoNames),
      safeToString(item["Folder URL"] || item.folderUrl),
      safeToString(item["Status"] || item.status),
    ]);
  }

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `uiu-${dataType}-${
    new Date().toISOString().split("T")[0]
  }.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
