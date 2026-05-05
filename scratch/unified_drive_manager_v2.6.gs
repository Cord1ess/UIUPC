// ═══════════════════════════════════════════════════════════════
// UIUPC Unified Drive Manager v2.6 (Browse + Upload)
// ═══════════════════════════════════════════════════════════════

// ─── CONFIG ────────────────────────────────────────────────────
var ROOT_NAME = "UIUPC_Website";

// Starter folders — Includes new modules for Finance and Recruitment
var STARTER_FOLDERS = [
  "Events",
  "Posters",
  "Exhibitions",
  "Committee",
  "Gallery",
  "Blog",
  "Assets",
  "Receipts",        // For Finance module
  "New Recruitment"  // For Member Photo dropzone
];

// ─── ONE-TIME SETUP ────────────────────────────────────────────
// Run this ONCE to create the folder structure and set permissions.
function setupFolders() {
  var root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_NAME);
  Logger.log("📁 Root folder: " + root.getUrl());

  for (var i = 0; i < STARTER_FOLDERS.length; i++) {
    var folder = getOrCreateFolder_(root, STARTER_FOLDERS[i]);
    // Make each folder viewable by anyone with the link
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log("  ✓ " + STARTER_FOLDERS[i] + " → " + folder.getUrl());
  }

  Logger.log("\n✅ Done! Your folder structure is ready.");
  return { success: true, rootId: root.getId() };
}

function getOrCreateFolder_(parent, name) {
  var existing = parent.getFoldersByName(name);
  if (existing.hasNext()) return existing.next();
  var created = parent.createFolder(name);
  return created;
}

// ─── POST: UPLOAD ROUTER ───────────────────────────────────────
function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    var root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_NAME);

    // Dynamic routing based on the 'action' sent from the Admin Panel
    if (action === "upload_receipt") {
      var folder = getOrCreateFolder_(root, "Receipts");
      return processUpload_(folder, params);
    } 
    
    if (action === "upload_member") {
      var folder = getOrCreateFolder_(root, "New Recruitment");
      return processUpload_(folder, params);
    }

    if (action === "upload_exhibition") {
      var folder = getOrCreateFolder_(root, "Exhibitions");
      return processUpload_(folder, params);
    }

    return jsonResponse_({ error: "Unknown upload action: " + action });
  } catch (err) {
    return jsonResponse_({ error: err.toString() });
  }
}

// ─── GET: BROWSE ROUTER ────────────────────────────────────────
function doGet(e) {
  var action = (e.parameter.action || "browse").toLowerCase();
  var folderId = e.parameter.folderId || null;
  var query = e.parameter.query || "";
  var response;

  try {
    if (action === "browse") {
      response = browseDrive_(folderId);
    } else if (action === "search") {
      response = searchDrive_(query);
    } else if (action === "root") {
      response = getRootId_();
    } else {
      response = { error: "Unknown action." };
    }
  } catch (err) {
    response = { error: err.toString() };
  }

  return jsonResponse_(response);
}

// ─── CORE LOGIC ────────────────────────────────────────────────

function processUpload_(folder, params) {
  var blob = Utilities.newBlob(Utilities.base64Decode(params.data), params.mimeType, params.fileName);
  var file = folder.createFile(blob);
  // Ensure the file is viewable so the admin panel can show a preview
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return jsonResponse_({ 
    success: true, 
    fileId: file.getId(), 
    name: file.getName() 
  });
}

function browseDrive_(folderId) {
  var folder = folderId ? DriveApp.getFolderById(folderId) : getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_NAME);
  
  var subfolders = [];
  var folderIter = folder.getFolders();
  while (folderIter.hasNext()) {
    var f = folderIter.next();
    subfolders.push({ id: f.getId(), name: f.getName(), type: "folder" });
  }
  subfolders.sort(function(a, b) { return a.name.localeCompare(b.name); });

  var files = [];
  var fileIter = folder.getFiles();
  while (fileIter.hasNext()) {
    var file = fileIter.next();
    if (file.getMimeType().indexOf("image/") === 0) {
      files.push({
        id: file.getId(),
        name: file.getName(),
        type: "file",
        thumbnail: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w200",
        created: file.getDateCreated().toISOString()
      });
    }
  }
  files.sort(function(a, b) { return b.created.localeCompare(a.created); });

  return {
    folderId: folder.getId(),
    folderName: folder.getName(),
    path: buildPath_(folder),
    subfolders: subfolders,
    files: files
  };
}

function searchDrive_(query) {
  var results = [];
  var search = DriveApp.searchFiles("mimeType contains 'image/' and title contains '" + query.replace(/'/g, "\\'") + "' and trashed = false");
  var count = 0;
  while (search.hasNext() && count < 40) {
    var file = search.next();
    results.push({ id: file.getId(), name: file.getName(), thumbnail: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w200" });
    count++;
  }
  return { results: results };
}

function getRootId_() {
  var root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_NAME);
  return { rootId: root.getId(), rootName: root.getName() };
}

function buildPath_(folder) {
  var path = [];
  var current = folder;
  var root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_NAME);
  var safety = 0;

  while (current && safety < 10) {
    path.unshift({ id: current.getId(), name: current.getName() });
    if (current.getId() === root.getId()) break;
    var parents = current.getParents();
    current = parents.hasNext() ? parents.next() : null;
    safety++;
  }
  return path;
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
