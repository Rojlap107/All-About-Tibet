const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
console.log('Setting up static file server from:', __dirname);
app.use(express.static(__dirname, {
  index: false // Don't automatically serve index.html
}));

// Create directories for uploads if they don't exist
const blogImagesDir = path.join(__dirname, 'images', 'blog');
const heroImagesDir = path.join(__dirname, 'images', 'heroes');

// Debugging directory permissions
console.log('Blog images directory:', blogImagesDir);
console.log('Hero images directory:', heroImagesDir);

try {
  if (!fs.existsSync(blogImagesDir)) {
    fs.mkdirSync(blogImagesDir, { recursive: true });
    console.log('Created blog images directory');
  } else {
    console.log('Blog images directory already exists');
  }

  if (!fs.existsSync(heroImagesDir)) {
    fs.mkdirSync(heroImagesDir, { recursive: true });
    console.log('Created hero images directory');
  } else {
    console.log('Hero images directory already exists');
  }
} catch (err) {
  console.error('Error creating upload directories:', err);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on upload type (blog or hero)
    const uploadType = req.params.type;
    console.log('Destination upload type:', uploadType);
    
    let dest;
    if (uploadType === 'blog') {
      dest = blogImagesDir;
      console.log('Using blog images directory:', dest);
    } else if (uploadType === 'heroes') {
      dest = heroImagesDir;
      console.log('Using heroes images directory:', dest);
    } else {
      console.log('Using default images directory (blog):', blogImagesDir);
      dest = blogImagesDir;
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      console.log('Creating directory:', dest);
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    const filename = uniqueSuffix + fileExt;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Set up multer with configuration
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper functions for JSON file operations
const blogsJsonPath = path.join(__dirname, 'data', 'blogs.json');
const heroesJsonPath = path.join(__dirname, 'data', 'heroes.json');

// Function to read JSON data from file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading JSON file ${filePath}:`, err);
    return null;
  }
}

// Function to write JSON data to file
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing JSON file ${filePath}:`, err);
    return false;
  }
}

// Routes - Blogs
app.get('/api/blogs', (req, res) => {
  try {
    const data = readJsonFile(blogsJsonPath);
    if (!data) {
      return res.status(500).json({ message: 'Error reading blogs data' });
    }

    // If ID is provided, return specific blog
    if (req.query.id) {
      const blogs = data.blogs.filter(blog => blog.id == req.query.id);
      res.json({ blogs });
    } else {
      // Otherwise return all blogs, sorted by date
      const blogs = [...data.blogs].sort((a, b) => {
        // Parse date strings (assuming format like "April 5, 2025")
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Newest first
      });
      res.json({ blogs });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/blogs/:id', (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const data = readJsonFile(blogsJsonPath);
    
    if (!data) {
      return res.status(500).json({ message: 'Error reading blogs data' });
    }
    
    // Find index of blog with given ID
    const blogIndex = data.blogs.findIndex(blog => blog.id === blogId);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Update blog data with new values
    const updatedBlog = {
      ...data.blogs[blogIndex],
      ...req.body
    };
    
    // Replace old blog with updated one
    data.blogs[blogIndex] = updatedBlog;
    
    // Write updated data back to file
    if (!writeJsonFile(blogsJsonPath, data)) {
      return res.status(500).json({ message: 'Error saving blogs data' });
    }
    
    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/blogs/:id', (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const data = readJsonFile(blogsJsonPath);
    
    if (!data) {
      return res.status(500).json({ message: 'Error reading blogs data' });
    }
    
    // Find index of blog with given ID
    const blogIndex = data.blogs.findIndex(blog => blog.id === blogId);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Remove blog from array
    data.blogs.splice(blogIndex, 1);
    
    // Write updated data back to file
    if (!writeJsonFile(blogsJsonPath, data)) {
      return res.status(500).json({ message: 'Error saving blogs data' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Routes - Heroes
app.get('/api/heroes', (req, res) => {
  try {
    const data = readJsonFile(heroesJsonPath);
    if (!data) {
      return res.status(500).json({ message: 'Error reading heroes data' });
    }

    // If ID is provided, return specific hero
    if (req.query.id) {
      const heroes = data.heroes.filter(hero => hero.id == req.query.id);
      res.json({ heroes });
    } else {
      // Otherwise return all heroes
      res.json({ heroes: data.heroes });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/heroes/:id', (req, res) => {
  try {
    const heroId = parseInt(req.params.id);
    const data = readJsonFile(heroesJsonPath);
    
    if (!data) {
      return res.status(500).json({ message: 'Error reading heroes data' });
    }
    
    // Find index of hero with given ID
    const heroIndex = data.heroes.findIndex(hero => hero.id === heroId);
    
    if (heroIndex === -1) {
      return res.status(404).json({ message: 'Hero not found' });
    }
    
    // Update hero data with new values
    const updatedHero = {
      ...data.heroes[heroIndex],
      ...req.body
    };
    
    // Replace old hero with updated one
    data.heroes[heroIndex] = updatedHero;
    
    // Write updated data back to file
    if (!writeJsonFile(heroesJsonPath, data)) {
      return res.status(500).json({ message: 'Error saving heroes data' });
    }
    
    res.json({ message: 'Hero updated successfully', hero: updatedHero });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/heroes/:id', (req, res) => {
  try {
    const heroId = parseInt(req.params.id);
    const data = readJsonFile(heroesJsonPath);
    
    if (!data) {
      return res.status(500).json({ message: 'Error reading heroes data' });
    }
    
    // Find index of hero with given ID
    const heroIndex = data.heroes.findIndex(hero => hero.id === heroId);
    
    if (heroIndex === -1) {
      return res.status(404).json({ message: 'Hero not found' });
    }
    
    // Remove hero from array
    data.heroes.splice(heroIndex, 1);
    
    // Write updated data back to file
    if (!writeJsonFile(heroesJsonPath, data)) {
      return res.status(500).json({ message: 'Error saving heroes data' });
    }
    
    res.json({ message: 'Hero deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    console.error('Unknown upload error:', err);
    return res.status(500).json({
      success: false,
      message: `Error uploading file: ${err.message}`
    });
  }
  next();
};

// Enhanced upload route with better logging
app.post('/api/upload/:type', (req, res) => {
  console.log('Processing upload for type:', req.params.type);
  console.log('Request headers:', req.headers);
  
  // Use single() directly inside the route handler
  upload.single('image')(req, res, function(err) {
    if (err) {
      console.error('Upload error occurred:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File is too large. Maximum size is 5MB.'
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
    }
    
    try {
      // Log the request body for debugging
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Upload file info:', req.file);
      
      // Check if file was uploaded
      if (!req.file) {
        console.log('No file in request. Form data might be incorrectly formatted.');
        return res.status(400).json({
          success: false,
          message: 'No file was uploaded. Make sure the field name is "image" and form is multipart/form-data.'
        });
      }
      
      // Create relative path for frontend use
      const uploadType = req.params.type;
      const relativePath = `images/${uploadType}/${req.file.filename}`;
      console.log('File saved to:', req.file.path);
      console.log('Relative path for frontend:', relativePath);
      
      // Send success response
      return res.json({
        success: true,
        filePath: relativePath,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Error in upload handler:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Unknown error occurred'
      });
    }
  });
});

// Login route (simple implementation - in production use proper auth)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication (replace with proper auth in production)
  if (username === 'admin' && password === 'password') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Serve static HTML files directly
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for other pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});