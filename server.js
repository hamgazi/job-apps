const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const app = express();
const port = 3000;

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save the file with its original name
  }
});
const upload = multer({ storage: storage });

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Helper function to save data to a PDF file
async function saveToPDF(data) {
  const filePath = path.join(__dirname, 'pdfs', `${data.first_name}_application.pdf`);
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text('Job Application', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(12).text(`Timestamp: ${new Date().toISOString()}`);
  doc.text(`First Name: ${data.first_name}`);
  doc.text(`Last Name: ${data.last_name}`);
  doc.text(`Email: ${data.email}`);
  doc.text(`Job Role: ${data.job_role}`);
  doc.text(`Address: ${data.address}`);
  doc.text(`City: ${data.city}`);
  doc.text(`Pincode: ${data.pincode}`);
  doc.text(`Date: ${data.date}`);
  doc.text(`File Name: ${data.file_name}`);
  doc.text(`File Path: ${data.file_path}`);

  doc.end();

  console.log('PDF generated and saved:', filePath);
}

// Handle form submission
app.post('/submit-application', upload.single('upload'), async (req, res) => {
  try {
    // Extract form data
    const formData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      job_role: req.body.job_role,
      address: req.body.address,
      city: req.body.city,
      pincode: req.body.pincode,
      date: req.body.date,
      file_name: req.file ? req.file.originalname : 'No file uploaded',
      file_path: req.file ? req.file.path : 'No file uploaded'
    };

    // Ensure 'pdfs' directory exists
    const pdfDir = path.join(__dirname, 'pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir);
    }

    // Save form data to PDF
    await saveToPDF(formData);

    // Log the data
    console.log('Form Data:', formData);

    // Respond to the client
    res.json({ message: 'Application received successfully and PDF generated!' });
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ message: 'Error processing application' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
