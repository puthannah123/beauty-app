const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  });
  
  // Update this line to ensure it matches the path to index.html
  win.loadFile(path.join(__dirname, 'index.html'));
}

// Ensure 'Files' directory exists
const filesDir = path.join(__dirname, 'Files');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// Listen for 'save-wishlist-item' event from renderer
ipcMain.on('save-wishlist-item', (event, item) => {
  const fileName = `${item.name.replace(/\s+/g, '_')}.txt`;
  const filePath = path.join(filesDir, fileName);
  const data = `Name: ${item.name}\nBrand: ${item.brand}\nPrice: RM${item.price}\nType: ${item.productType}`;

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      event.reply('save-error', 'Failed to save wishlist item.');
    } else {
      event.reply('save-success', 'Wishlist item saved successfully.');
    }
  });
});



// Listen for 'delete-wishlist-item' event from renderer
ipcMain.on('delete-wishlist-item', (event, fileName) => {
  const filePath = path.join(filesDir, `${fileName.replace(/\s+/g, '_')}.txt`);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      event.reply('delete-error', 'Failed to delete wishlist item.');
    } else {
      event.reply('delete-success', 'Wishlist item deleted successfully.');
    }
  });
});

// Update wishlist item event listener
ipcMain.on('update-wishlist-item', (event, item) => {
  const fileName = `${item.name.replace(/\s+/g, '_')}.txt`;
  const filePath = path.join(filesDir, fileName);
  const data = `Name: ${item.name}\nBrand: ${item.brand || "Unknown"}\nPrice: RM${item.price || "0.00"}\nType: ${item.productType || "N/A"}\nNote: ${item.note || "No notes added."}`;

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      event.reply('update-error', 'Failed to update wishlist item.');
    } else {
      event.reply('update-success', 'Wishlist item updated successfully.');
    }
  });
});


//read
// Listen for file read requests
ipcMain.on('read-wishlist-file', (event, fileName) => {
  // Construct the path to avoid "Files/Files" duplication
  const sanitizedFileName = `${fileName.replace(/\s+/g, '_')}.txt`;
  const filePath = path.join(filesDir, sanitizedFileName);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      event.reply('file-read-error', 'File not found or cannot be accessed.');
    } else {
      event.reply('file-read-success', data); // Send back file content
    }
  });
});


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


